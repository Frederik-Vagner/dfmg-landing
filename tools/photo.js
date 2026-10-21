#!/usr/bin/env node
// Add a photo to images/: download (Pexels only) or read a local file,
// resize, convert to webp, check the build's limits, and record where it
// came from in tools/photo-candidates.json.
//
//   npm run photo -- <source> <section>/<name> --slot <slot-id> [--kind hero|card] [--by "Photographer"]
//
//   source   a Pexels photo page   https://www.pexels.com/photo/<title>-<id>/
//            a Pexels image URL    https://images.pexels.com/photos/<id>/…
//            or a local file
//   section  an existing folder in images/ (article, service, sustainability …)
//   name     Danish words are fine: "Vådt gulv skilt" -> vaadt-gulv-skilt.webp
//   --slot   the photo slot on /internal/photos/, e.g. artikel-<article-file-name>
//   --kind   hero: at most 1600 px wide (default); card: at most 1200 px
//
// Never overwrites: images are add-only. Prints the lines to paste.

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const IMAGES = path.join(ROOT, "images");
const CANDIDATES = path.join(__dirname, "photo-candidates.json");
const MAX_WIDTH = { hero: 1600, card: 1200 };
const MAX_EDGE = 2000;           // tools/check-content.js fails above this
const TARGET_BYTES = 200 * 1024; // CLAUDE.md: under 200 KB (the build fails at 250)
const QUALITIES = [80, 75, 70];

function fail(message) {
    console.error(`photo: ${message}`);
    process.exit(1);
}

function parseArgs(argv) {
    const args = { _: [] };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i].startsWith("--")) args[argv[i].slice(2)] = argv[++i];
        else args._.push(argv[i]);
    }
    return args;
}

// "Vådt gulv skilt" -> "vaadt-gulv-skilt"
function slugify(text) {
    return text.toLowerCase()
        .replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa")
        .normalize("NFKD").replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// The source as a Buffer, and the Pexels page it came from (if any).
async function load(source) {
    if (!/^https?:/.test(source)) {
        if (!fs.existsSync(source)) fail(`no such file: ${source}`);
        return { buffer: fs.readFileSync(source), page: null, image: null };
    }
    const url = new URL(source);
    let image, page;
    if (url.hostname === "www.pexels.com" || url.hostname === "pexels.com") {
        const id = (url.pathname.match(/-(\d+)\/?$/) || url.pathname.match(/\/photo\/(\d+)\/?$/) || [])[1];
        if (!id) fail(`cannot find the photo id in ${source}`);
        page = source;
        image = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`;
    } else if (url.hostname === "images.pexels.com") {
        image = source.split("?")[0];
        const id = (url.pathname.match(/\/photos\/(\d+)\//) || [])[1];
        page = id ? `https://www.pexels.com/photo/${id}/` : null;
    } else {
        fail(`only Pexels photos (www.pexels.com, images.pexels.com) or a local file, not ${url.hostname}`);
    }
    // Ask for at most 2400 px so the download stays small.
    const res = await fetch(`${image}?auto=compress&w=2400`);
    if (!res.ok) fail(`download failed: ${res.status} ${image}`);
    return { buffer: Buffer.from(await res.arrayBuffer()), page, image };
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const [source, target] = args._;
    if (args._.length > 2) fail(`too many arguments: put a name with spaces in quotes ("${args._.slice(1).join(" ")}")`);
    if (!source || !target || !args.slot) {
        fail("usage: npm run photo -- <pexels-url | file> <section>/<name> --slot <slot-id> [--kind hero|card] [--by \"Photographer\"]");
    }
    const kind = args.kind || "hero";
    if (!MAX_WIDTH[kind]) fail(`--kind is hero or card, not "${kind}"`);

    const [section, ...rest] = target.split("/");
    const sections = fs.readdirSync(IMAGES).filter((d) => fs.statSync(path.join(IMAGES, d)).isDirectory());
    if (!sections.includes(section) || !rest.length) fail(`start the target with an existing folder in images/: ${sections.join(", ")}`);
    const name = slugify(rest.join("-").replace(/\.\w+$/, ""));
    if (!name) fail(`"${target}" has no usable file name`);
    const rel = `/images/${section}/${name}.webp`;
    const out = path.join(ROOT, rel);
    if (fs.existsSync(out)) fail(`${rel} already exists; images are never replaced. Pick another name.`);

    const { buffer, page, image } = await load(source);
    const pipeline = () => sharp(buffer).rotate().resize({
        width: MAX_WIDTH[kind], height: MAX_EDGE, fit: "inside", withoutEnlargement: true,
    });

    let data, info;
    for (const quality of QUALITIES) {
        ({ data, info } = await pipeline().webp({ quality }).toBuffer({ resolveWithObject: true }));
        info.quality = quality;
        if (data.length <= TARGET_BYTES) break;
    }
    if (data.length > TARGET_BYTES) {
        fail(`still ${Math.round(data.length / 1024)} KB at quality ${QUALITIES.at(-1)}; choose a calmer photo or --kind card`);
    }
    fs.writeFileSync(out, data);

    // Record the source with the slot, where the inventory reads it.
    const candidates = JSON.parse(fs.readFileSync(CANDIDATES, "utf8"));
    const slot = candidates[args.slot] || (candidates[args.slot] = { brief: "", candidates: [] });
    slot.chosen = {
        file: rel,
        ...(page ? { page } : {}),
        ...(image ? { image } : {}),
        ...(args.by ? { photographer: args.by } : {}),
        license: page || image ? "Pexels (https://www.pexels.com/license/)" : "own photo",
        date: new Date().toISOString().slice(0, 10),
    };
    fs.writeFileSync(CANDIDATES, JSON.stringify(candidates, null, 4) + "\n");

    console.log(`photo: wrote ${rel}  ${info.width}×${info.height}  ${Math.round(data.length / 1024)} KB  (webp q${info.quality})`);
    console.log(`photo: source recorded under "${args.slot}" in tools/photo-candidates.json`);
    console.log(`\nFront matter:\n  image: ${rel}\n  imageAlt: "<what the photo shows, in Danish>"`);
    console.log(`\nOr in a page:\n  <img src="${rel}" width="{{ '${rel}' | imgWidth }}" height="{{ '${rel}' | imgHeight }}" alt="…" loading="lazy" decoding="async" data-photo-slot="${args.slot}">`);
}

main().catch((e) => fail(e.message));
