import test from "node:test";
import assert from "node:assert/strict";
import { withResumeBrowser } from "../test-support/resume-pdf.mjs";

const routes = ["/", "/about/", "/resume/"];

function contrast(first, second) {
  const luminance = (rgb) => rgb.slice(0, 3).map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test("native current-page links and keyboard focus remain distinct on light, dark and forced-color surfaces",
  { timeout: 120_000 }, async () => {
    await withResumeBrowser(async ({ page, origin }) => {
      for (const forcedColors of ["none", "active"]) {
        await page.emulateMedia({ forcedColors });
        for (const width of [320, 1440]) {
          await page.setViewportSize({ width, height: 1000 });
          for (const route of routes) {
            await page.goto(`${origin}${route}`);
            const current = page.locator('nav a[aria-current="page"]');
            assert.equal(await current.count(), 1);
            assert.equal(await current.getAttribute("href"), route);
            const decoration = await current.evaluate((link) => {
              const style = getComputedStyle(link);
              return { line: style.textDecorationLine, type: style.textDecorationStyle,
                outline: style.outlineStyle };
            });
            assert.equal(decoration.line, "underline");
            assert.equal(decoration.type, "double", "Current page has a persistent non-color indicator");
            assert.equal(decoration.outline, "none", "Current-page state is not a focus outline");
            const highlight = await page.evaluate(() => {
              const probe = document.createElement("span");
              probe.style.cssText = "color: Highlight; forced-color-adjust: none; display: none";
              document.body.append(probe);
              const color = getComputedStyle(probe).color.match(/[\d.]+/g).map(Number);
              probe.remove();
              return color;
            });
            const count = await page.locator("a").count();
            if (route === "/resume/") {
              assert.equal(await page.locator(".resume a").count(), 16, "All resume links are preserved");
            }
            for (let index = 0; index < count; index++) {
              await page.keyboard.press("Tab");
              const focus = await page.evaluate(() => {
                const link = document.activeElement;
                const style = getComputedStyle(link);
                const rgb = (color) => color.match(/[\d.]+/g).map(Number);
                const layers = [];
                for (let element = link; element; element = element.parentElement) {
                  const color = rgb(getComputedStyle(element).backgroundColor);
                  layers.push(color);
                  if ((color[3] ?? 1) === 1) break;
                }
                let background = [255, 255, 255];
                for (const layer of layers.reverse()) {
                  const alpha = layer[3] ?? 1;
                  background = background.map((channel, i) => layer[i] * alpha + channel * (1 - alpha));
                }
                return { tag: link.tagName, visible: link.matches(":focus-visible"),
                  width: parseFloat(style.outlineWidth), line: style.outlineStyle,
                  outline: rgb(style.outlineColor), background,
                  hero: !!link.closest(".resume__contact"),
                  current: link.getAttribute("aria-current"), decoration: style.textDecorationStyle };
              });
              assert.equal(focus.tag, "A");
              assert.ok(focus.visible && focus.width > 0 && focus.line !== "none");
              assert.ok(contrast(focus.outline, focus.background) >= 3,
                `${route} ${width}px ${forcedColors} link ${index + 1} has 3:1 focus contrast`);
              if (forcedColors === "none" && focus.hero) {
                assert.deepEqual(focus.outline, [243, 182, 31], "Dark hero retains yellow focus");
              }
              if (forcedColors === "active") {
                assert.deepEqual(focus.outline, highlight, "Forced-color focus uses the computed system Highlight");
              }
              if (focus.current) assert.equal(focus.decoration, "double");
            }
          }
        }
      }
    });
  });

test("all routes reflow at 320px with actual 16/20/32px browser fonts and text-spacing overrides",
  { timeout: 120_000 }, async () => {
    for (const size of [16, 20, 32]) {
      await withResumeBrowser(async ({ page, origin }) => {
        await page.setViewportSize({ width: 320, height: 1000 });
        for (const route of routes) {
          await page.goto(`${origin}${route}`);
          assert.equal(await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize)), size);
          for (const spacing of [false, true]) {
            if (spacing) {
              await page.addStyleTag({ content: `
                * { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; }
                p { margin-bottom: 2em !important; }
              ` });
            }
            const geometry = await page.evaluate(() => {
              const clipped = [];
              const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
              for (let node = walker.nextNode(); node; node = walker.nextNode()) {
                if (!node.textContent.trim()) continue;
                const range = document.createRange();
                range.selectNodeContents(node);
                for (const rect of range.getClientRects()) {
                  if (rect.width && (rect.left < -1 || rect.right > innerWidth + 1)) {
                    clipped.push(node.textContent.trim());
                  }
                }
              }
              return { width: document.documentElement.scrollWidth, viewport: innerWidth, clipped,
                resumeOverflow: [...document.querySelectorAll(".resume")]
                  .some((element) => element.scrollWidth > element.clientWidth + 1),
                overflowX: getComputedStyle(document.body).overflowX };
            });
            assert.ok(geometry.width <= geometry.viewport, `${route} font ${size} spacing ${spacing}: document reflows`);
            assert.deepEqual(geometry.clipped, [], `${route} font ${size} spacing ${spacing}: text stays visible`);
            assert.equal(geometry.resumeOverflow, false, "Resume does not conceal overflowing content");
            assert.ok(!["hidden", "clip"].includes(geometry.overflowX), "Reflow does not hide document overflow");
          }
        }
      }, { args: [`--blink-settings=defaultFontSize=${size}`] });
    }
  });

test("teaching is a compact level-three role within Experience and the print continuation stays screen-hidden",
  { timeout: 120_000 }, async () => {
    await withResumeBrowser(async ({ page }) => {
      const heading = page.getByRole("heading", {
        level: 3, name: "Lead Teacher, ProjectFUN · DigiPen Institute of Technology", exact: true
      });
      assert.equal(await heading.count(), 1);
      assert.ok(await heading.evaluate((element) => !!element.closest('section[aria-labelledby="experience-heading"] article')));
      assert.equal((await page.locator(".early-experience").innerText()).replace(/\s+/g, " "),
        "Lead Teacher, ProjectFUN · DigiPen Institute of Technology 2014–2015 Taught Java and game development to high-school students and coordinated five teaching assistants.");
      const sizes = await page.locator(".early-experience").evaluate((article) => ({
        heading: getComputedStyle(article.querySelector("h3")).fontSize,
        body: getComputedStyle(article).fontSize
      }));
      assert.equal(sizes.heading, sizes.body, "The semantic heading retains the compact role size");
      assert.equal(await page.locator(".resume__continuation").isVisible(), false);
    });
  });
