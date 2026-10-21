const htmlmin = require("html-minifier-terser");
const CleanCSS = require("clean-css");
const { minify: terserMinify } = require("terser");
const fs = require("fs");
const path = require("path");
const { fillIcons } = require("./tools/icons");
const { imgWidth, imgHeight } = require("./tools/image-size");
const { danishDate, isoDate } = require("./tools/dates");

module.exports = function (eleventyConfig) {
  // Pass through static assets unchanged
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("favicon.ico");

  // width="{{ src | imgWidth }}" height="{{ src | imgHeight }}": the size of
  // a local image, read from the file (tools/image-size.js)
  eleventyConfig.addFilter("imgWidth", imgWidth);
  eleventyConfig.addFilter("imgHeight", imgHeight);

  // Inline every icon's SVG (tools/icons.js); before minifying.
  eleventyConfig.addTransform("icons", function (content) {
    if ((this.page.outputPath || "").endsWith(".html")) return fillIcons(content);
    return content;
  });

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
        // Icons in markup that scripts build (js/services.js) are inlined too.
        const src = fillIcons(fs.readFileSync(file, "utf8"));
        const result = await terserMinify(src);
        if (result.code) fs.writeFileSync(file, result.code);
      }
    }
  });

  // {{ page.date | danishDate }} -> "15. december 2024"; isoDate -> "2024-12-15".
  eleventyConfig.addFilter("danishDate", danishDate);
  eleventyConfig.addFilter("isoDate", isoDate);

  // Articles (collections.artikel, see pages/facility/indblik/artikler/artikler.11tydata.js)
  // Newest first by front matter date; the same date sorts by file path.
  const newestFirst = (articles) => [...articles].sort((a, b) => b.date - a.date || a.inputPath.localeCompare(b.inputPath));
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

  // Pages for sitemap.njk: on the main layout, not noindex, at their
  // canonical URL, dated by their own `lastmod` (articles: updated or date)
  // or else by their last commit (none if git cannot tell).
  const { execFileSync } = require("child_process");
  const lastCommit = (file) => {
    try { return execFileSync("git", ["log", "-1", "--format=%cs", "--", file], { encoding: "utf8" }).trim() || null; }
    catch { return null; }
  };
  eleventyConfig.addFilter("sitemapPages", (pages) => pages
    .filter((p) => p.data.layout && !/noindex/.test(p.data.robots || "") && p.outputPath && p.outputPath.endsWith(".html"))
    .map((p) => ({
      loc: p.data.canonical || p.data.site.url + (p.url === "/index.html" ? "/" : p.url),
      lastmod: p.data.lastmod || lastCommit(p.inputPath),
    }))
    .sort((a, b) => a.loc.localeCompare(b.loc)));

  // A photo slot with no photo yet: {% photoSlot "klima-bilfri", "brief" %}.
  // Renders an inert <template> that tools/photo-inventory.js lists on
  // /internal/photos/ and then strips from the built page. When the photo
  // arrives, replace the shortcode with the <img>; it is picked up as real.
  const attr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  eleventyConfig.addShortcode("photoSlot", (id, brief = "") =>
    `<template data-photo-slot="${attr(id)}" data-photo-status="missing"` +
    (brief ? ` data-photo-brief="${attr(brief)}"` : "") + `></template>`);

  // A callout box in an article: {% callout %}…{% endcallout %}, or
  // {% callout "success" %} for the green one. The blank lines let Markdown
  // render the content inside the box, as <p>…</p>.
  const CALLOUTS = { "": "callout", success: "callout callout--success" };
  eleventyConfig.addPairedShortcode("callout", (content, variant = "") => {
    if (!(variant in CALLOUTS)) throw new Error(`callout: unknown variant "${variant}" (use "success" or none)`);
    return `<div class="${CALLOUTS[variant]}">\n\n${content.trim()}\n\n</div>`;
  });

  // Ignores are defined in .eleventyignore. Markdown files are ignored by
  // name there (CLAUDE.md, docs/ …), because articles are Markdown.

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
