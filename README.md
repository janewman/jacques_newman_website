# Jacques Newman's website

Personal website and resume, built with Eleventy.

## Getting started

Use Node.js 20 or newer.

```bash
npm ci
npm run dev
```

Open the local URL shown by Eleventy. Run `npm run build` to generate the static
site in `dist/`.

To build only the standalone resume, run `npm run build:resume`. The output
includes `dist-resume/index.html`, its stylesheet, and a linked
`dist-resume/jacques-newman-resume.pdf` generated directly from the page with
Chromium. Install the browser once with `npx playwright install chromium`.
The standalone site has no website navigation or other pages. Run
`npm run dev:resume` to preview it locally. The original site build remains
available separately in `dist/`.

## Publishing the resume

In the repository's **Settings > Pages**, set the build and deployment source to
**GitHub Actions**. The Publish resume workflow runs on pushes to `main` and can
also be started from the Actions tab. It publishes the standalone resume
build, with no navigation to the unpublished pages.

The resume is published at the Pages site root (normally
`https://janewman.github.io/jacques_newman_website/`). Its relative stylesheet
URL works with a project path or a custom domain.
Pushes to other branches do not trigger deployment; a manually dispatched run
can deploy the selected branch.

## Project structure

- `src/index.njk` and `src/about.njk` – home and about pages
- `src/resume.md` – resume details in YAML front matter
- `src/resume-chapters/*.md` – accomplishments as Markdown bullets and links
- `src/_includes/layouts/resume.njk` – resume markup
- `src/_includes/layouts/base.njk` – shared page layout
- `src/_includes/site-header.njk` – navigation
- `src/assets/` – styles and browser scripts
- `scripts/build-resume-pdf.js` – direct Chromium PDF generation

## Editing the resume

Edit the intro, contact details, job history, and education in `src/resume.md`.
Edit accomplishments in `src/resume-chapters/*.md`. Nunjucks files handle the
layout; they contain no resume copy.

Use Markdown bullets, links, and backticks for code. Wrap prose at 80 columns.
Reference-style links keep long URLs out of the text. Do not leave blank lines
between bullets: they add paragraph wrappers that change the spacing.
Link larger projects to tracking issues or Gerrit queries rather than individual
changes. Use the ChromeStatus entry for the `focusgroup` release link.

Each chapter sets its `title`, `period`, and numeric `order` in the front
matter. To add a chapter, copy an existing file and give it a unique `order`.
Keep `tags: resumeChapters` to include it in the resume and `permalink: false`
to prevent a separate page.

Eleventy uses [collections][eleventy-collections] to group the chapters and
[non-output templates][eleventy-permalinks] to render them without separate
pages.

## Manual test checklist

The site can be tested with any suitable browser and inspection tools. Use
this checklist after content, template, or style changes.

### Build and content

- [ ] Run `npm run build` and confirm it finishes without errors.
- [ ] Run `npm run build:resume` and confirm `dist-resume/` contains the resume,
  its stylesheet, and generated PDF, with no site navigation.
- [ ] Run `npm run dev`. Open `/`, `/about/`, and `/resume/` directly, then
  reload each page.
- [ ] Check for missing assets, raw Markdown, and visible template expressions.
- [ ] Compare the resume with its Markdown sources. Check contact details,
  titles, dates, bullets, code formatting, and links.
- [ ] Confirm chapters follow their numeric `order`, experience comes before
  education, and no content is missing or repeated.
- [ ] Confirm `dist/` contains no separate `resume-chapters/` pages.

### Navigation and accessibility

- [ ] Follow Home, About, and Resume from every page. Only the current page
  should have a double underline and `aria-current="page"`.
- [ ] Disable JavaScript and reload. Content and navigation should still work.
- [ ] Use Tab and Shift+Tab through every link. Check focus order, visible focus
  on light and dark backgrounds, and that focus never gets trapped.
- [ ] Activate links with the keyboard. Check web destinations and the email
  address.
- [ ] Check headings: one level-one heading per page, no skipped levels,
  chapters within experience, and the teaching role at level three. Each
  `aria-labelledby` value should reference an existing heading.
- [ ] If available, check high-contrast or forced-colors mode. Current-page
  state and keyboard focus should remain distinct and visible.

### Responsive layout

- [ ] Check widths around 320px and 1440px, plus a width between them. Resize
  across the 44rem and 76rem breakpoints.
- [ ] Check that navigation, contact details, headings, dates, and links wrap
  without overlap, clipped text, or horizontal scrolling.
- [ ] Increase browser zoom to 200% and 400%, then try a larger default text
  size. Content should remain readable and links usable.
- [ ] If text-spacing overrides are available, use 1.5 line height, 0.12em
  letter spacing, 0.16em word spacing, and 2em paragraph spacing. Check for
  overlap, clipping, and horizontal scrolling.
- [ ] When appearance should stay the same, compare spacing, typography,
  colors, and alignment with the previous version at matching viewport sizes.

### PDF

- [ ] Open the generated PDF and check for exactly one page, the website's
  rounded card and navy header with right-aligned contact details, underlined
  links, no site navigation, and no clipped text or content outside the margins.
  Text should be at least 8pt.
- [ ] Check that headings stay with their content; individual bullets, the
  teaching role, and education should not split across pages.
- [ ] Check that text is selectable, copied text follows the reading order,
  and links open the expected destinations.

Record the revision, browser version, settings, and any failures. Leave skipped
checks unchecked and note why they were not run.

[eleventy-collections]: https://www.11ty.dev/docs/collections/
[eleventy-permalinks]:
  https://www.11ty.dev/docs/permalinks/#skip-writing-to-the-file-system
