import test from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("build generates the personal site and current resume", () => {
  const repoRoot = resolve(import.meta.dirname, "..");

  execSync("npm run build", {
    cwd: repoRoot,
    stdio: "pipe"
  });

  const homepage = readFileSync(resolve(repoRoot, "dist", "index.html"), "utf8");
  const about = readFileSync(resolve(repoRoot, "dist", "about", "index.html"), "utf8");
  const plainText = (html) => html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  for (const route of ["", "about", "resume"]) {
    const page = readFileSync(resolve(repoRoot, "dist", route, "index.html"), "utf8");
    const navigation = page.match(/<nav class="site-header__nav" aria-label="Primary">([\s\S]*?)<\/nav>/);
    assert.ok(navigation, `Primary navigation is rendered in the HTML for /${route}`);
    assert.match(page, /<header class="site-header__inner">/);
    assert.match(page, /<p class="site-header__name">Jacques Newman<\/p>/);
    assert.deepEqual(
      [...navigation[1].matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)].map(([, href, text]) => [href, text]),
      [["/", "Home"], ["/about/", "About"], ["/resume/", "Resume"]]
    );
    assert.doesNotMatch(page, /<script[^>]+src="[^"]*(?:main|site-header)\.js"/);
    assert.match(page, /a:focus-visible\s*\{[^}]*outline:/);
    assert.match(page, /\.site-header__nav\s*\{[^}]*flex-wrap: wrap/);
  }
  assert.match(homepage, /<h1>Jacques Newman<\/h1>/);
  assert.match(
    plainText(homepage),
    /I'm a senior software engineer at Microsoft working on Chromium accessibility and web standards\./
  );
  assert.match(about, /<h1>About Jacques Newman<\/h1>/);
  assert.match(
    plainText(about),
    /I work on Microsoft Edge's web platform, with a focus on browser accessibility, Chromium, and web standards\./
  );
  assert.match(
    plainText(about),
    /My experience includes Windows UI Automation, CSS layout interoperability, and collaboration with browser vendors and assistive-technology partners\./
  );
  for (const page of [homepage, about]) {
    const main = page.match(/<main>([\s\S]*?)<\/main>/)?.[1];
    assert.ok(main, "The page has main content");
    assert.match(main, /<a href="\/resume\/">View my resume<\/a>/);
    assert.doesNotMatch(page, /barebones|powered by Eleventy|intentionally simple|Add your bio|anything else here/i);
  }

  const resume = readFileSync(resolve(repoRoot, "dist", "resume", "index.html"), "utf8");
  const bullets = [...resume.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((match) => plainText(match[1]));
  const focusgroup = bullets.find((bullet) => bullet.startsWith("Implemented and shipped declarative keyboard navigation"));
  const focusgroupStandards = bullets.find((bullet) => bullet.startsWith("Revived the focusgroup proposal"));
  assert.match(
    plainText(resume),
    /Senior software engineer building browser features, working on browser internals and native accessibility, and contributing to web standards\./
  );
  assert.ok(focusgroup, "The focusgroup ownership bullet is present");
  assert.ok(focusgroup.split(/\s+/).length <= 45, "The capability and ownership bullet stays concise");
  assert.match(focusgroup, /focusgroup in Chromium 150/);
  assert.doesNotMatch(focusgroup, /sole Chromium implementation engineer/);
  assert.match(focusgroup, /Chromium 150, including C\+\+ parsing changes and web-platform tests\./);
  assert.ok(focusgroupStandards, "Focusgroup standards and collaboration have a separate bullet");
  assert.equal(bullets.indexOf(focusgroupStandards), bullets.indexOf(focusgroup) + 1,
    "Implementation comes immediately before standards and collaboration");
  assert.ok(focusgroupStandards.split(/\s+/).length <= 50, "The standards and collaboration bullet stays concise");
  assert.match(focusgroupStandards, /Revived the focusgroup proposal, wrote the Open UI explainer and specification proposal/);
  assert.match(focusgroupStandards, /advanced it to WHATWG Stage 2/);
  assert.match(focusgroupStandards, /Supported developer trials and guided the polyfill developer through feedback and code review/);
  assert.doesNotMatch(`${focusgroup} ${focusgroupStandards}`, /specification PR remains open|final standard|merged specification|with an authored|served as/);
  assert.doesNotMatch(resume, /weekly downloads|\bdownloads\b|\b\d[\d,]*\s*(?:weekly|monthly)\b/i);
  assert.doesNotMatch(resume, /year of inactivity/);
  const notify = bullets.find((bullet) => bullet.startsWith("Enabled web applications to request screen-reader announcements"));
  assert.ok(notify, "ARIA Notify retains its handoff and shipment history");
  assert.match(notify, /without DOM updates/);
  assert.match(notify, /after the original developer departed/);
  assert.match(notify, /ARIA Notify, shipped in Chromium 141/);
  assert.match(notify, /manual web-platform tests/);
  assert.match(plainText(resume), /U\.S\. Patent 12282522/);
  assert.doesNotMatch(resume, /12,282,522/);
  assert.match(resume, /jacquesnewman@outlook\.com/);
  assert.match(resume, /Greater Seattle Area/);
  assert.match(resume, /May 2017/);
  assert.match(resume, /Senior Software Engineer, Sep 2024/);
  assert.match(plainText(resume), /Software Engineer II, Mar 2019–Sep 2024 · Software Engineer, May 2017–Mar 2019/);
  assert.match(resume, /Chromium Layout \/ GridNG/);
  assert.match(plainText(resume), /Chromium Accessibility Platform 2019–Present/);
  assert.match(plainText(resume), /Edge Copilot Vision &amp; Quality 2024–2025/);
  assert.match(plainText(resume), /Chromium Layout \/ GridNG 2020–2021/);
  const actions = bullets.find((bullet) => bullet.includes("aria-actions"));
  assert.ok(actions, "The aria-actions implementation is present");
  assert.match(actions, /enabled aria-actions by default in desktop Chromium/);
  assert.doesNotMatch(resume, /Implemented and shipped <code>aria-actions/);
  const mathml = bullets.find((bullet) => bullet.includes("MathML support for Windows UI Automation"));
  assert.ok(mathml, "The MathML implementation is present");
  assert.match(mathml, /enabled by default for Chromium Canary users/);
  assert.match(mathml, /Canary users\. Owned the Narrator UIA TextPattern scenario, adding UIA custom properties and fixing format boundaries, newline geometry, and text-range alignment\./);
  assert.doesNotMatch(mathml, /shipped|stable|Chromium \d+/i);
  assert.match(plainText(resume), /Contributed foundational track-collection data structures/);
  assert.match(plainText(resume), /launch-critical fixes to Chromium GridNG/);
  const viewsax = bullets.find((bullet) => bullet.includes("ViewsAX"));
  assert.ok(viewsax, "The shared browser UI and web content infrastructure work is present");
  assert.match(viewsax, /Helped build shared accessibility infrastructure for browser UI and web content/);
  assert.match(viewsax, /ViewsAX refactoring, including a shared UI layer and cache/);
  const shopping = bullets.find((bullet) => bullet.startsWith("Led Accessible Shopping Navigation"));
  assert.ok(shopping, "The shopping decision is present");
  assert.match(shopping, /from architecture and user research through prototyping and experimentation/);
  assert.match(shopping, /recommended against shipping based on the results/);
  assert.match(
    resume,
    /Web Platform, Accessibility &amp; Standards[\s\S]*MathML support for Windows UI Automation[\s\S]*Edge Copilot Vision[\s\S]*Chromium Accessibility Platform/
  );
  assert.equal(resume.match(/MathML support for Windows UI Automation/g)?.length, 1);
  assert.match(resume, /Lead inventor on/);
  assert.match(shopping, /Lead inventor on U\.S\. Patent 12282522/);
  assert.doesNotMatch(resume, /contributions-heading|Selected contributions/);
  const evidenceLinks = [...resume.matchAll(/<a href="([^"]+)">([\s\S]*?)<\/a>/g)]
    .filter(([, href]) => !href.startsWith("/") && !href.startsWith("mailto:") && !href.endsWith("/janewman"));
  for (const href of [
    "https://patents.google.com/patent/US12282522B2/",
    "https://open-ui.org/components/scoped-focusgroup.explainer/",
    "https://github.com/whatwg/html/pull/11723",
    "https://github.com/whatwg/html/issues/11641",
    "https://github.com/w3c/aria/pull/2577",
    "https://chromium-review.googlesource.com/c/chromium/src/+/7871960",
    "https://chromium-review.googlesource.com/c/chromium/src/+/5520052",
    "https://chromium-review.googlesource.com/c/chromium/src/+/2225835",
    "https://chromium-review.googlesource.com/c/chromium/src/+/3105008"
  ]) {
    assert.equal(evidenceLinks.filter(([, target]) => target === href).length, 1,
      `${href} appears once beside the supported work`);
  }
  for (const [, href, text] of evidenceLinks) {
    assert.ok(plainText(text).length > 10, `${href} has a descriptive source label`);
  }
  assert.match(resume, /href="https:\/\/chromium-review\.googlesource\.com\/c\/chromium\/src\/\+\/8006126"/);
  assert.match(resume, /href="https:\/\/chromium-review\.googlesource\.com\/c\/chromium\/src\/\+\/7530809"/);
  assert.doesNotMatch(resume, /known for precise systems reasoning|leadership-heading|Open source &amp; standards/);
  const article = resume.slice(resume.indexOf('<article class="resume"'));
  const headings = [...article.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g)];
  assert.equal(headings.filter(([, level]) => level === "1").length, 1);
  assert.equal(plainText(headings[0][2]), "Jacques Newman");
  assert.deepEqual(
    headings.filter(([, level]) => level === "2").map(([, , text]) => plainText(text)),
    ["Experience", "Education"],
    "Experience follows positioning directly in reading and screen-reader order"
  );
  assert.doesNotMatch(article, /resume__profile|Technical skills|<dt>Languages|JavaScript|Objective-C/);
  assert.equal((plainText(article).match(/C\+\+/g) ?? []).length, 1,
    "C++ is discoverable in evidenced implementation work, not an inventory");
  assert.doesNotMatch(article, /resume__sidebar|class="highlights"/);
  for (let index = 1; index < headings.length; index++) {
    assert.ok(Number(headings[index][1]) <= Number(headings[index - 1][1]) + 1, "Heading levels do not skip");
  }
  for (const [, id] of article.matchAll(/aria-labelledby="([^"]+)"/g)) {
    assert.match(article, new RegExp(`<h[1-6] id="${id}">`), `${id} names an existing heading`);
  }
  assert.match(resume, /github\.com\/janewman/);
  assert.doesNotMatch(resume, /22%/);
  assert.doesNotMatch(resume, /290\+/);
  assert.doesNotMatch(resume, /janewman@outlook\.com/);
  assert.doesNotMatch(resume, /jacquesnewman42@gmail\.com/i);
});
