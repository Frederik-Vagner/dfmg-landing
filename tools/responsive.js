// Smaller copies of article photos, for srcset: a card shown 380 px wide
// downloads an 800 px file instead of the 1600 px original.
//
//   srcset="{{ image | srcset }}" sizes="…"
//
// The filter is synchronous (so it works inside Nunjucks macros): it reads
// the original's width from the file, names the copies, and remembers the
// photo. writeVariants() makes the copies after the build. The <img> keeps
// its src, width and height, so browsers without srcset, the photo
// inventory and the link check all see the original.

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { readSize } = require("./image-size");

const ROOT = path.resolve(__dirname, "..");
const WIDTHS = [480, 800, 1200];
const QUALITY = 75;
const used = new Set();

// /images/article/foo.webp -> /img/article/foo-800.webp
const variantPath = (src, w) => src.replace(/^\/images\//, "/img/").replace(/\.\w+$/, `-${w}.webp`);

function srcset(src) {
    if (!/^\/images\//.test(src)) throw new Error(`srcset: "${src}" is not a local /images/ path`);
    const [width] = readSize(path.join(ROOT, src));
    const smaller = WIDTHS.filter((w) => w < width);
    smaller.forEach(() => used.add(src));
    return [...smaller.map((w) => `${variantPath(src, w)} ${w}w`), `${src} ${width}w`].join(", ");
}

// After the build: write the copies the pages refer to into the output.
async function writeVariants(outDir) {
    let count = 0;
    for (const src of used) {
        const [width] = readSize(path.join(ROOT, src));
        for (const w of WIDTHS.filter((x) => x < width)) {
            const out = path.join(outDir, variantPath(src, w));
            fs.mkdirSync(path.dirname(out), { recursive: true });
            await sharp(path.join(ROOT, src)).resize({ width: w }).webp({ quality: QUALITY }).toFile(out);
            count++;
        }
    }
    return count;
}

module.exports = { srcset, writeVariants };
