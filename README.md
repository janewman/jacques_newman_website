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
- `npm test` – run a focused build test

## Project structure

- `src/` – pages, layouts, and static assets
- `src/assets/components/` – Lit web components
- `src/_includes/layouts/` – Eleventy layouts
- `test/` – focused tests

To extend the site, add pages in `src/` and Lit components in `src/assets/components/`.
