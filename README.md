# jacques_newman_website

A barebones and easy-to-extend personal website built with Eleventy + Lit.

## Getting started

```bash
npm install
npm run dev
```

Then open the local URL shown by Eleventy.

## Scripts

- `npm run dev` – start Eleventy in local dev server mode
- `npm run build` – build the static site to `dist/`
- `npm test` – run build, static navigation, and actual Chromium PDF regression tests

## Testing

Use Node.js 20 or newer. From a fresh checkout:

```bash
npm ci
npx playwright install chromium
npm test
```

On Linux CI, install Chromium's system libraries too:
`npx playwright install --with-deps chromium`.
The browser is Playwright's versioned Chromium, not a local Edge installation.
Missing browser binaries fail the tests with installation instructions; they are
never silently skipped.

For just the print checks, run `node --test test/resume-print.test.mjs`.
The tests build into a unique repository-local scratch directory, serve it on an
ephemeral loopback port, and generate a fresh PDF. They do not reuse `dist/` or
race the build test. Browser, server, and scratch output are cleaned up even on
failure.

PDF.js checks the extracted document order, essential content, exactly two
Letter pages, at least 8pt text, and half-inch print bounds. A browser-only 18pt
mutation must fail the page-count assertion, protecting against an incorrect
“2 of 2” continuation on a longer document. This tests Chromium PDF output, not
every browser, interactive print-dialog setting, ATS, or screen reader. Installed
system fonts can affect pagination; manually inspect both PDF pages after font
or layout changes.

The resume leads with browser/platform accomplishments rather than a skills
inventory. Source links sit beside the work they support, and the patent stays
with the shopping project. The print continuation begins with Copilot Vision,
keeping its date and the subsequent Microsoft chapters together on page two.
Responsive checks cover 320–1440px, both layout breakpoints, readable experience
text, and visible keyboard focus on every link.

## Project structure

- `src/` – pages, layouts, and static assets
- `src/assets/components/` – Lit web components
- `src/_includes/layouts/` – Eleventy layouts
- `src/_includes/site-header.njk` – server-rendered primary navigation
- `test/` – focused tests

Primary navigation is rendered by Eleventy and works without JavaScript. The
`site-header` wrapper is a screen/print styling hook, not a registered web component.
Its Home, About, and Resume links retain native keyboard navigation and visible
focus indicators; the header and links wrap on narrow screens.

To extend the site, add pages in `src/`. Lit remains installed for future components
in `src/assets/components/`; these need a browser-compatible build or import map
before loading them in a page. The reserved `src/assets/main.js` entry point is not
loaded by the base layout.
