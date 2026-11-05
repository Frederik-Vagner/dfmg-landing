#!/usr/bin/env node
// Every logo file that cannot be logo.svg itself, drawn from it.
// A page paints logo.svg through a CSS mask (.logo-mark in css/header.css).
// logo.svg is a copy of static/logos/logo.svg in the platform repo, which is
// the source; these follow the platform's rules (scripts/build_brand_assets.py
// there): grey, on white where an icon needs a ground, on nothing in a tab.
//
//   node tools/build-brand-assets.js        icons
//   node tools/build-brand-assets.js --og   and the two Open Graph images
//
// The OG images need a browser, so they are a separate flag:
//   npm install --no-save playwright && npx playwright install chromium

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const LOGOS = path.join(ROOT, "images/logos");
const GREY = "#595959";
// The platform's --brand-logo in its dark theme.
const LIGHT = "#bfbfbf";
const WHITE = "#ffffff";

const source = fs.readFileSync(path.join(ROOT, "logo.svg"), "utf8");
const [, MARK_W, MARK_H] = source.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number);
const MARK_D = source.match(/ d="([^"]+)"/)[1];

// The logo's width as a share of an app icon, as on the platform.
const ICON_WIDTH = 0.62;
// In a tab every pixel counts: as tall as the canvas.
const TAB_WIDTH = MARK_W / MARK_H;

// An SVG of the logo centred on a square, `share` of the side wide.
function drawing(size, share, colour, ground) {
    const scale = (size * share) / MARK_W;
    const x = (size - MARK_W * scale) / 2;
    const y = (size - MARK_H * scale) / 2;
    const rect = ground ? `<rect width="${size}" height="${size}" fill="${ground}"/>` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${rect}<path transform="translate(${x.toFixed(3)} ${y.toFixed(3)}) scale(${scale.toFixed(5)})" fill="${colour}" d="${MARK_D}"/></svg>\n`;
}

const png = (svg) => sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();

// An .ico is a directory of PNGs.
function ico(images) {
    const head = Buffer.alloc(6 + 16 * images.length);
    head.writeUInt16LE(1, 2);
    head.writeUInt16LE(images.length, 4);
    let offset = head.length;
    images.forEach(({ size, data }, i) => {
        const entry = 6 + 16 * i;
        head.writeUInt8(size, entry);
        head.writeUInt8(size, entry + 1);
        head.writeUInt16LE(1, entry + 4);
        head.writeUInt16LE(32, entry + 6);
        head.writeUInt32LE(data.length, entry + 8);
        head.writeUInt32LE(offset, entry + 12);
        offset += data.length;
    });
    return Buffer.concat([head, ...images.map((image) => image.data)]);
}

async function icons() {
    const sizes = [16, 32, 48];
    const images = await Promise.all(sizes.map(async (size) => ({ size, data: await png(drawing(size, TAB_WIDTH, GREY)) })));
    fs.writeFileSync(path.join(ROOT, "favicon.ico"), ico(images));

    // An SVG icon can follow the browser's theme; grey alone is about 2:1 on a dark tab.
    fs.writeFileSync(
        path.join(ROOT, "favicon.svg"),
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MARK_W} ${MARK_H}"><style>path{fill:${GREY}}@media (prefers-color-scheme:dark){path{fill:${LIGHT}}}</style><path d="${MARK_D}"/></svg>\n`
    );

    // iOS paints a transparent icon black, so this one has a ground.
    fs.writeFileSync(path.join(LOGOS, "touch-icon-180.png"), await png(drawing(180, ICON_WIDTH, GREY, WHITE)));
    // The logo in the JSON-LD: a raster, at least 112 px, read on white.
    fs.writeFileSync(path.join(LOGOS, "logo-512.png"), await png(drawing(512, TAB_WIDTH, GREY)));
}

async function ogImages() {
    const { chromium } = require("playwright");
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    for (const [variant, out] of [["facility", "images/og-image.jpg"], ["platform", "images/platform/og-image.jpg"]]) {
        await page.goto(`file://${path.join(ROOT, "tools/generate-og-image.html")}#${variant}`);
        await page.reload({ waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        const shot = await page.screenshot({ type: "png" });
        await sharp(shot).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(ROOT, out));
    }
    await browser.close();
}

(async () => {
    await icons();
    if (process.argv.includes("--og")) await ogImages();
})();
