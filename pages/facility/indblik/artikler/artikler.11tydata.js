// Shared data for every article in this folder.
//
// An article's own front matter is the one place its facts live: title,
// date, reading time, photo, alt text and card summary. The Nyheder and
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

const MONTHS = ["januar", "februar", "marts", "april", "maj", "juni", "juli",
    "august", "september", "oktober", "november", "december"];

const folderOf = (data) => data.page.filePathStem.split("/").slice(-2, -1)[0];

const FALLBACK_IMAGE = "/images/article/ipad.webp";

module.exports = {
    tags: ["artikel"],

    // Articles without a photograph of their own yet.
    image: FALLBACK_IMAGE,
    imageAlt: "Mand i skjorte læser på en tablet i et lyst kontor",

    eleventyComputed: {
        // Listed as a stand-in on /internal/photos/ (tools/photo-inventory.js).
        imageIsFallback: (data) => data.image === FALLBACK_IMAGE,
        categoryKey: (data) => CATEGORIES[folderOf(data)].key,
        category: (data) => CATEGORIES[folderOf(data)].label,
        // "15. december 2024" as a sortable date, for newest-first lists.
        sortDate: (data) => {
            const [day, month, year] = data.publishDate.replace(".", "").split(" ");
            return new Date(Number(year), MONTHS.indexOf(month.toLowerCase()), Number(day));
        },
    },
};
