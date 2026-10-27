import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { withResumeBrowser, inspectPdf, assertResumePdf } from "../test-support/resume-pdf.mjs";

const css = readFileSync(new URL("../src/assets/resume.css", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const markup = readFileSync(new URL("../src/resume.njk", import.meta.url), "utf8");
const print = css.slice(css.indexOf("@media print"));

test("print uses Letter paper and full-width white document flow", () => {
  assert.match(print, /@page\s*\{\s*size: letter;\s*margin: 0\.5in;/);
  for (const selector of [".resume__layout"]) {
    assert.ok(print.includes(`${selector} {\n    display: block;`), `${selector} is single-column`);
  }
  assert.match(print, /\.resume__main\s*\{\s*max-width: none;/);
  assert.match(print, /\.resume__header\s*\{[^}]*background: #fff;/);
  assert.match(print, /\.resume-page site-header\s*\{\s*display: none;/);
  assert.doesNotMatch(print, /resume__sidebar|highlights|grid-template-columns/);
  const sizes = [...print.matchAll(/font-size:\s*([\d.]+)pt/g)].map(([, size]) => Number(size));
  assert.ok(sizes.length > 10);
  assert.ok(sizes.every((size) => size >= 8), "Print support type is never smaller than 8pt");
});

test("print CSS puts experience first and defines the balanced continuation break", () => {
  assert.doesNotMatch(markup, /resume__profile|skills-heading|contributions-heading/);
  assert.match(markup, /Chromium Accessibility Platform <span>2019–Present<\/span>/);
  assert.doesNotMatch(markup, /sole Chromium implementation engineer/);
  assert.match(print, /\.role\s*\{\s*break-inside: auto;/);
  assert.match(print, /\.resume li,[\s\S]*?break-inside: avoid;/);
  assert.match(print, /\.resume h4,[\s\S]*?break-after: avoid;/);
  assert.equal([...print.matchAll(/break-before: page;/g)].length, 1);
  assert.match(print, /\.role__chapter--print-page-two\s*\{\s*break-before: page;/);
  assert.equal([...markup.matchAll(/class="resume__continuation"/g)].length, 1);
  assert.match(markup, /role__chapter--print-page-two">\s*<p class="resume__continuation" hidden aria-hidden="true">Jacques Newman · Microsoft experience, continued · 2 of 2<\/p>\s*<h4>Edge Copilot Vision/);
  assert.match(print, /\.resume \.resume__continuation\s*\{\s*display: block;/);
  assert.doesNotMatch(print, /position: fixed|@bottom|a::after|a:after/);
  assert.doesNotMatch(css, /tag-list|expertise-heading|technology-heading/);
});

test("experience-first resume retains readable responsive flow, heading order and keyboard access", { timeout: 120_000 }, async () => {
  await withResumeBrowser(async ({ page }) => {
    for (const width of [320, 390, 704, 705, 768, 1024, 1216, 1217, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const layout = await page.evaluate(() => ({
        headings: [...document.querySelectorAll(".resume h2")].map((heading) => heading.textContent),
        overflow: document.documentElement.scrollWidth > innerWidth,
        clipped: [...document.querySelectorAll(".resume h2, .resume h4, .resume a")]
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.width && (rect.left < 0 || rect.right > innerWidth);
          }).map((element) => element.textContent.trim()),
        bodyFonts: [...document.querySelectorAll(".resume li")]
          .map((element) => parseFloat(getComputedStyle(element).fontSize)),
        experienceY: document.querySelector("#experience-heading").getBoundingClientRect().top + scrollY
      }));
      assert.deepEqual(layout.headings, ["Experience", "Education"]);
      assert.equal(layout.overflow, false, `${width}px has no horizontal overflow`);
      assert.deepEqual(layout.clipped, [], `${width}px keeps headings and links within the viewport`);
      assert.ok(layout.bodyFonts.every((size) => size >= 16), `${width}px experience body type remains at least 16px`);
      if (width === 1440 || width === 390) {
        const baseline = width === 1440
          ? { experienceY: 679.5, saving: 80 }
          : { experienceY: 978.984375, saving: 180 };
        assert.ok(layout.experienceY < baseline.experienceY - baseline.saving,
          `${width}px experience begins earlier without a skills inventory or smaller body type`);
      }
      await page.evaluate(() => {
        document.activeElement?.blur();
        window.scrollTo(0, 0);
      });
      // Reload resets sequential focus navigation between viewport checks.
      await page.reload();
      const links = await page.locator("a").count();
      for (let index = 0; index < links; index++) {
        await page.keyboard.press("Tab");
        const focus = await page.evaluate(() => {
          const element = document.activeElement;
          const style = getComputedStyle(element);
          return { tag: element.tagName, visible: element.matches(":focus-visible"),
            outline: style.outlineStyle, width: parseFloat(style.outlineWidth) };
        });
        assert.equal(focus.tag, "A", `${width}px tab ${index + 1} reaches a link`);
        assert.ok(focus.visible && focus.outline !== "none" && focus.width > 0,
          `${width}px tab ${index + 1} has a visible keyboard focus indicator`);
      }
    }
  });
});

test("browser PDF preserves two Letter pages, text order, content, font size and print bounds", { timeout: 120_000 }, async (t) => {
  await withResumeBrowser(async ({ browser, page, workspace }) => {
    const pages = await inspectPdf(await page.pdf({
      path: join(workspace, "resume.pdf"),
      preferCSSPageSize: true,
      printBackground: true,
      displayHeaderFooter: false
    }));
    assertResumePdf(pages);
    t.diagnostic(`Chromium ${browser.version()}; ${pages.length} Letter pages; minimum extracted font ${
      Math.min(...pages.flatMap((page) => page.spans.map((span) => span.size))).toFixed(2)
    }pt`);

    await t.test("18pt print-root mutation is rejected by the actual page-count assertion", async () => {
      // Mutate only this browser document; source and generated CSS stay untouched.
      await page.addStyleTag({ content: "@media print { :root { font-size: 18pt; } }" });
      const mutated = await inspectPdf(await page.pdf({
        preferCSSPageSize: true,
        printBackground: true,
        displayHeaderFooter: false
      }));
      assert.ok(mutated.length > 2, "The mutation reproduces the oversized multi-page resume");
      assert.throws(() => assertResumePdf(mutated), /exactly two Letter pages/);
      t.diagnostic(`18pt mutation produced ${mutated.length} pages and failed the two-page assertion`);
    });
  });
});
