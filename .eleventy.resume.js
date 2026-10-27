import path from "node:path";

export default function (eleventyConfig) {
  const resumePath = path.resolve("src/resume.md");
  const chaptersPath = path.resolve("src/resume-chapters");

  eleventyConfig.addGlobalData("standaloneResume", true);
  eleventyConfig.addPreprocessor("resume-only", "*", function () {
    const inputPath = path.resolve(this.inputPath);
    if (inputPath !== resumePath && path.dirname(inputPath) !== chaptersPath) {
      return false;
    }
  });
  eleventyConfig.addPassthroughCopy({ "src/assets/resume.css": "assets/resume.css" });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "dist-resume"
    }
  };
}
