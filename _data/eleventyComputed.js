module.exports = {
  permalink: (data) => {
    // Preserve original .html URLs instead of converting to /folder/index.html
    return data.page.filePathStem + ".html";
  },
};
