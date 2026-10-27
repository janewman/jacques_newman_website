export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addGlobalData("resumeOnly", process.env.RESUME_ONLY === "true");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "dist"
    }
  };
}
