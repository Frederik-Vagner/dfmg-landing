module.exports = function (eleventyConfig) {
  // Pass through static assets unchanged
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");

  // Pass through component HTML files (loaded by components.js at runtime)
  eleventyConfig.addPassthroughCopy("pages/components");
  eleventyConfig.addPassthroughCopy("pages/facility/components");
  eleventyConfig.addPassthroughCopy("pages/software/components");

  // Ignores are defined in .eleventyignore

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
