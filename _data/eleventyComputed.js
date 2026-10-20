module.exports = {
  // Pages keep their .html URLs (/pages/x.html, not /pages/x/index.html).
  // Other templates, such as sitemap.njk, keep the permalink in their front
  // matter.
  permalink: (data) => {
    if (!String(data.page.inputPath).endsWith(".html")) return data.permalink;
    return data.page.filePathStem + ".html";
  },
};
