import test from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("build generates homepage with Lit component hook", () => {
  const repoRoot = resolve(import.meta.dirname, "..");

  execSync("npm run build", {
    cwd: repoRoot,
    stdio: "pipe"
  });

  const homepage = readFileSync(resolve(repoRoot, "dist", "index.html"), "utf8");
  assert.match(homepage, /<site-header name="Jacques Newman"><\/site-header>/);
  assert.match(homepage, /barebones personal website powered by Eleventy \+ Lit/i);
});
