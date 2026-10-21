// Danish words to a file name: "Vådt gulv skilt" -> "vaadt-gulv-skilt"
// (æ -> ae, ø -> oe, å -> aa; lowercase a-z, 0-9 and -).
const slugify = (text) => String(text).toLowerCase()
    .replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

module.exports = { slugify };
