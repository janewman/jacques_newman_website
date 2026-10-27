import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import Eleventy from "@11ty/eleventy";
import { chromium } from "playwright";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));

export async function withResumeBrowser(check, launchOptions = {}) {
  // Keep each build isolated from dist and concurrent build tests.
  const workspace = await mkdtemp(join(root, ".resume-pdf-"));
  const output = join(workspace, "site");
  let browser;
  let server;
  try {
    await new Eleventy(join(root, "src"), output, {
      source: "cli",
      configPath: join(root, ".eleventy.js"),
      quietMode: true
    }).write();

    server = createServer(async (request, response) => {
      try {
        const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
        const file = join(output, ...pathname.split("/"), pathname.endsWith("/") ? "index.html" : "");
        const path = relative(output, file);
        if (path === ".." || path.startsWith(`..${sep}`)) throw new Error("Invalid path");
        const body = await readFile(file);
        response.writeHead(200, {
          "Content-Type": file.endsWith(".css") ? "text/css" : "text/html; charset=utf-8"
        });
        response.end(body);
      } catch {
        response.writeHead(404);
        response.end("Not found");
      }
    });
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    const origin = `http://127.0.0.1:${server.address().port}`;
    try {
      browser = await chromium.launch({ headless: true, ...launchOptions });
    } catch (error) {
      throw new Error(
        "PDF tests require Playwright Chromium. Run `npx playwright install chromium` " +
        "(Linux CI: `npx playwright install --with-deps chromium`).",
        { cause: error }
      );
    }
    const page = await browser.newPage();
    const response = await page.goto(`${origin}/resume/`);
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    await check({ browser, page, origin, workspace });
  } finally {
    try {
      await browser?.close();
    } finally {
      try {
        if (server?.listening) {
          server.closeAllConnections();
          await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
        }
      } finally {
        await rm(workspace, { recursive: true, force: true });
      }
    }
  }
}

export async function inspectPdf(buffer) {
  const document = await getDocument({
    data: new Uint8Array(buffer),
    isEvalSupported: false,
    useSystemFonts: true
  }).promise;
  try {
    const pages = [];
    for (let number = 1; number <= document.numPages; number++) {
      const page = await document.getPage(number);
      const content = await page.getTextContent({ disableNormalization: true });
      const items = content.items.filter((item) => item.str?.trim());
      const text = content.items.map((item) => `${item.str ?? ""}${item.hasEOL ? "\n" : ""}`)
        .join("").replace(/\s+/g, " ").trim();
      const spans = items.map((item) => {
        const size = Math.hypot(item.transform[2], item.transform[3]);
        const style = content.styles[item.fontName];
        const x = item.transform[4];
        const y = item.transform[5];
        return {
          text: item.str,
          size,
          left: x,
          right: x + item.width,
          bottom: y + (style.descent ?? -0.25) * size,
          top: y + (style.ascent ?? 1) * size
        };
      });
      pages.push({
        width: page.view[2] - page.view[0],
        height: page.view[3] - page.view[1],
        text,
        spans
      });
    }
    return pages;
  } finally {
    await document.destroy();
  }
}

export function assertResumePdf(pages) {
  assert.equal(pages.length, 2, "Resume must contain exactly two Letter pages");
  for (const [index, page] of pages.entries()) {
    assert.ok(Math.abs(page.width - 612) < 0.1 && Math.abs(page.height - 792) < 0.1,
      `Page ${index + 1} must be Letter (612 × 792 pt)`);
    assert.ok(page.spans.length > 0, `Page ${index + 1} has extractable text`);
    for (const span of page.spans) {
      assert.ok(span.size >= 7.99, `Page ${index + 1} text is below 8pt: ${span.text}`);
      assert.ok(span.left >= 35 && span.right <= 577 && span.bottom >= 35 && span.top <= 757,
        `Page ${index + 1} text exceeds half-inch print bounds: ${JSON.stringify(span)}`);
    }
  }
  const continuation = "Jacques Newman · Microsoft experience, continued · 2 of 2";
  assert.ok(pages[1].text.startsWith(`${continuation} Edge Copilot Vision & Quality 2024–2025`),
    "Page two starts with the continuation and its chapter date in extraction order");
  assert.ok(!pages[0].text.includes(continuation), "Continuation does not appear on page one");
  assert.equal(pages.map((page) => page.text).join(" ").split(continuation).length - 1, 1);
  assert.match(pages[1].text,
    /Lead Teacher, ProjectFUN · DigiPen Institute of Technology 2014–2015 Taught Java/,
    "Teaching date immediately follows the role in extracted document order");
  const required = [
    ["Jacques Newman", "jacquesnewman@outlook.com", "browser internals", "native accessibility",
      "C++", "web-platform tests", "Windows UI Automation", "IAccessible2",
      "macOS accessibility", "permissions policy", "manual web-platform tests",
      "Senior Software Engineer", "May 2017", "focusgroup", "Chromium 150", "WHATWG Stage 2",
      "Implemented and shipped declarative keyboard navigation for composite widgets",
      "C++ parsing changes and web-platform tests", "ARIA Notify", "Chromium 141", "original developer departed",
      "Chromium Canary", "Owned the Narrator UIA TextPattern scenario"],
    ["Edge Copilot Vision & Quality", "Chromium Accessibility Platform 2019–Present", "Windows UI Automation",
      "ViewsAX", "telemetry", "fuzzers", "Chromium Layout / GridNG", "launch-critical fixes",
      "Microsoft Edge Layout", "Lead Teacher", "Lead inventor", "recommended against shipping based on the results",
      "12282522", "EDUCATION", "B.S., Computer Science", "Minor in Mathematics", "Apr 2017"]
  ];
  required.forEach((phrases, index) => {
    // Letter-spaced headings can acquire intra-word spaces during PDF extraction.
    const compact = pages[index].text.replace(/\s+/g, "");
    for (const phrase of phrases) {
      assert.ok(compact.includes(phrase.replace(/\s+/g, "")), `Page ${index + 1} retains ${phrase}`);
    }
  });
  assert.doesNotMatch(pages.map((page) => page.text).join(" "),
    /sole Chromium implementation engineer|TECHNICAL SKILLS|Selected contributions|JavaScript|Objective-C/);
}
