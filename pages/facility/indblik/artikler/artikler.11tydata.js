// Shared data for every article in this folder.
//
// An article's own front matter is the one place its facts live: title,
// date (ISO, 2024-12-15), author, reading time, photo, alt text and card
// summary. The Nyheder and
// Indblik cards, the article's header and hero photo and the "Relaterede
// Artikler" box all read them from there, so a new photo or a corrected
// reading time is one edit.
//
// The category comes from the folder the article sits in, so it cannot be
// spelled differently in different places.

const CATEGORIES = {
    indsigt:        { key: "insights",       label: "INDSIGT" },
    tips:           { key: "tips",           label: "TIPS & TRICKS" },
    baeredygtighed: { key: "sustainability", label: "BÆREDYGTIGHED" },
    innovation:     { key: "innovation",     label: "INNOVATION" },
    cases:          { key: "cases",          label: "CASE STUDY" },
};

const { isoDate } = require("../../../../tools/dates");
const { imgWidth, imgHeight } = require("../../../../tools/image-size");
const { validateArticle } = require("../../../../tools/schemas");

const folderOf = (data) => data.page.filePathStem.split("/").slice(-2, -1)[0];

const FALLBACK_IMAGE = "/images/article/ipad.webp";

const sizeOr = (read, src) => { try { return read(src); } catch { return undefined; } };

// schema.org author from a key in _data/authors.json.
const authorLd = (data) => {
    const a = data.authors[data.author];
    if (!a) throw new Error(`${data.page.inputPath}: author "${data.author}" is not in _data/authors.json`);
    const ld = { "@type": a.type, name: a.name, url: a.url };
    if (data.author === "dfmg") ld["@id"] = data.site.url + "/#organization";
    return ld;
};

module.exports = {
    tags: ["artikel"],
    // The header, photo, excerpt box, sidebar and footer around the body.
    layout: "layouts/article.njk",

    // Articles without a photograph of their own yet.
    image: FALLBACK_IMAGE,
    imageAlt: "Mand i skjorte læser på en tablet i et lyst kontor",

    // A key in _data/authors.json. The header names a person, not the company.
    author: "dfmg",

    // Fails the build on a missing, misspelled or out-of-range field, and on
    // a case that names a client without consent (tools/schemas.js).
    eleventyDataSchema: validateArticle,

    eleventyComputed: {
        // The .html URL for Markdown articles too (_data/eleventyComputed.js
        // only covers .html files): artikler/tips/x.md -> artikler/tips/x.html.
        permalink: (data) => data.page.filePathStem + ".html",
        // Listed as a stand-in on /internal/photos/ (tools/photo-inventory.js).
        imageIsFallback: (data) => data.image === FALLBACK_IMAGE,
        categoryKey: (data) => CATEGORIES[folderOf(data)].key,
        category: (data) => CATEGORIES[folderOf(data)].label,
        authorName: (data) => data.authors[data.author] && data.authors[data.author].name,
        authorIsPerson: (data) => Boolean(data.authors[data.author] && data.authors[data.author].type === "Person"),
        // The sitemap's <lastmod>: the last real content change, not the
        // last commit (a layout change is not an edit of the article).
        lastmod: (data) => isoDate(data.updated || data.page.date),
        // Link previews show the article's own photo.
        og: (data) => ({
            type: "article",
            image: data.site.url + data.image,
            // A missing file is reported by the schema below, by name.
            imageWidth: sizeOr(imgWidth, data.image),
            imageHeight: sizeOr(imgHeight, data.image),
        }),
        // Structured data for search results (base.html prints it in place
        // of the site-wide organisation block), from the same front matter:
        // the article and the breadcrumb shown above its title.
        jsonLd: (data) => {
            const url = data.site.url + data.page.url;
            const org = { "@id": data.site.url + "/#organization" };
            return {
                "@context": "https://schema.org",
                "@graph": [
                    {
                        "@type": "Article",
                        headline: data.articleTitle,
                        description: data.description,
                        image: data.site.url + data.image,
                        datePublished: isoDate(data.page.date),
                        dateModified: isoDate(data.updated || data.page.date),
                        inLanguage: "da",
                        mainEntityOfPage: url,
                        author: authorLd(data),
                        publisher: { "@type": "Organization", name: data.site.name, logo: data.site.url + "/images/logos/logo.png", ...org },
                    },
                    {
                        "@type": "BreadcrumbList",
                        itemListElement: [
                            { "@type": "ListItem", position: 1, name: "Forside", item: data.site.url + "/" },
                            { "@type": "ListItem", position: 2, name: "Indblik", item: data.site.url + "/pages/facility/indblik/nyheder.html" },
                            { "@type": "ListItem", position: 3, name: data.articleTitle },
                        ],
                    },
                ],
            };
        },
    },
};
