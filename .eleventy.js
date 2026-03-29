const htmlmin = require("html-minifier-terser");
const CleanCSS = require("clean-css");
const { minify: terserMinify } = require("terser");
const fs = require("fs");
const path = require("path");

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

  // Minify HTML output
  eleventyConfig.addTransform("htmlmin", async function (content) {
    if ((this.page.outputPath || "").endsWith(".html")) {
      try {
        return await htmlmin.minify(content, {
          collapseWhitespace: true,
          removeComments: true,
          minifyCSS: true,
          minifyJS: true,
        });
      } catch (e) {
        console.warn(`[htmlmin] Skipping ${this.page.outputPath}: ${e.message}`);
        return content;
      }
    }
    return content;
  });

  // Minify CSS and JS after build
  eleventyConfig.on("eleventy.after", async () => {
    const outDir = "_site";

    // Minify CSS files
    const cssDir = path.join(outDir, "css");
    if (fs.existsSync(cssDir)) {
      for (const file of getAllFiles(cssDir, ".css")) {
        const src = fs.readFileSync(file, "utf8");
        const result = new CleanCSS({}).minify(src);
        if (!result.errors.length) fs.writeFileSync(file, result.styles);
      }
    }

    // Minify JS files
    const jsDir = path.join(outDir, "js");
    if (fs.existsSync(jsDir)) {
      for (const file of getAllFiles(jsDir, ".js")) {
        const src = fs.readFileSync(file, "utf8");
        const result = await terserMinify(src);
        if (result.code) fs.writeFileSync(file, result.code);
      }
    }
  });

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

// Recursively get all files with a given extension
function getAllFiles(dir, ext) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...getAllFiles(full, ext));
    else if (full.endsWith(ext)) results.push(full);
  }
  return results;
}
