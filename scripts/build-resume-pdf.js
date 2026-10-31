import { chromium } from "playwright";
import { access, readFile, rename, rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const outputDirectory = path.resolve("dist-resume");
const htmlPath = path.join(outputDirectory, "index.html");
const pdfPath = path.join(outputDirectory, "jacques-newman-resume.pdf");
const tempPdfPath = path.join(outputDirectory, ".jacques-newman-resume.tmp.pdf");

await access(htmlPath);
const browser = await chromium.launch();

try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
  await page.pdf({
    path: tempPdfPath,
    format: "Letter",
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false
  });

  const pdf = await readFile(tempPdfPath);
  if (!pdf.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    throw new Error("The browser did not produce a valid PDF.");
  }
  const pdfContents = pdf.toString("latin1");
  const pageCounts = [...pdfContents.matchAll(/\/Count\s+(\d+)/g)].map((match) =>
    Number(match[1])
  );
  const linkCount = (pdfContents.match(/\/Subtype\s*\/Link/g) || []).length;
  if (pageCounts.length !== 1 || pageCounts[0] !== 1) {
    throw new Error("The resume PDF must contain exactly one page.");
  }
  if (linkCount === 0) {
    throw new Error("The resume PDF does not contain any clickable links.");
  }

  await rename(tempPdfPath, pdfPath);
  console.log(`Generated ${pdfPath} (1 page, ${linkCount} links)`);
} finally {
  await browser.close();
  await rm(tempPdfPath, { force: true });
}
