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
  assert.match(homepage, /<site-header name="Jacques Newman"><\/site-header>/);
  assert.match(homepage, /barebones personal website powered by Eleventy \+ Lit/i);

  const resume = readFileSync(resolve(repoRoot, "dist", "resume", "index.html"), "utf8");
  assert.match(
    resume,
    /Senior software engineer focused on improving the web platform for everyone\./i
  );
  assert.match(resume, /Chromium 150/);
  assert.match(resume, /extended period of inactivity/);
  assert.match(resume, /led a new explainer/);
  assert.match(resume, /sole engineer implementing it in Chromium/);
  assert.match(
    resume,
    /Worked closely with the\s+polyfill's developer, providing feature guidance and reviewing changes/
  );
  assert.match(resume, /roughly 2,000\s+weekly downloads/);
  assert.doesNotMatch(resume, /1,000 weekly downloads/);
  assert.doesNotMatch(resume, /year of inactivity/);
  assert.match(resume, /Chromium 141/);
  assert.match(resume, /ARIA Notify/);
  assert.match(resume, /U\.S\. Patent\s+12282522/);
  assert.doesNotMatch(resume, /12,282,522/);
  assert.match(resume, /jacquesnewman@outlook\.com/);
  assert.match(resume, /Greater Seattle Area/);
  assert.match(resume, /May 2017/);
  assert.match(resume, /Senior Software Engineer, Sep 2024/);
  assert.match(resume, /Chromium Layout \/ GridNG/);
  assert.match(resume, /enabled <code>aria-actions<\/code> by default in Chromium/);
  assert.doesNotMatch(resume, /Implemented and shipped <code>aria-actions/);
  assert.match(resume, /Contributed foundational data structures/);
  assert.match(
    resume,
    /Web Platform, Accessibility &amp; Standards[\s\S]*MathML-for-UIA[\s\S]*Edge Copilot Vision[\s\S]*Chromium Accessibility Platform/
  );
  assert.equal(resume.match(/MathML-for-UIA/g)?.length, 1);
  assert.match(resume, /Lead inventor on/);
  assert.match(resume, /github\.com\/janewman/);
  assert.doesNotMatch(resume, /22%/);
  assert.doesNotMatch(resume, /290\+/);
  assert.doesNotMatch(resume, /janewman@outlook\.com/);
  assert.doesNotMatch(resume, /jacquesnewman42@gmail\.com/i);
});
