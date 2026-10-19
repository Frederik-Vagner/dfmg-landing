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
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("sitemap.xml");

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
  eleventyConfig.on("eleventy.after", async ({ dir } = {}) => {
    const outDir = (dir && dir.output) || "_site";

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

  // Articles (collections.artikel, see pages/facility/indblik/artikler/artikler.11tydata.js)
  const newestFirst = (articles) => [...articles].sort((a, b) => b.data.sortDate - a.data.sortDate);
  eleventyConfig.addFilter("newestFirst", newestFirst);
  eleventyConfig.addFilter("head", (items, n) => items.slice(0, n));

  // An article by its file name, e.g. "systematik-vs-talent".
  eleventyConfig.addFilter("articleBySlug", (articles, slug) => {
    const found = articles.find((a) => a.page.fileSlug === slug);
    if (!found) throw new Error(`articleBySlug: no article "${slug}"`);
    return found;
  });

  // Other articles for the "Relaterede Artikler" box: the same category
  // first, then the rest, newest first within each.
  eleventyConfig.addFilter("relatedArticles", (articles, current, count = 3) => {
    const others = newestFirst(articles.filter((a) => a.url !== current.url));
    const same = others.filter((a) => a.data.categoryKey === current.data.categoryKey);
    const rest = others.filter((a) => a.data.categoryKey !== current.data.categoryKey);
    return [...same, ...rest].slice(0, count);
  });

  // A photo slot with no photo yet: {% photoSlot "klima-bilfri", "brief" %}.
  // Renders an inert <template> that tools/photo-inventory.js lists on
  // /internal/photos/ and then strips from the built page. When the photo
  // arrives, replace the shortcode with the <img>; it is picked up as real.
  const attr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  eleventyConfig.addShortcode("photoSlot", (id, brief = "") =>
    `<template data-photo-slot="${attr(id)}" data-photo-status="missing"` +
    (brief ? ` data-photo-brief="${attr(brief)}"` : "") + `></template>`);

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
