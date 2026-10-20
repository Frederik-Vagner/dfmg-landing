// Width and height of a local image, read from its file header (WebP, JPEG,
// PNG), for <img width height>: the browser keeps the space while it loads.
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const cache = new Map();

function readSize(file) {
    const b = fs.readFileSync(file);
    if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
        const chunk = b.toString("ascii", 12, 16);
        if (chunk === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
        if (chunk === "VP8L") { const n = b.readUInt32LE(21); return [1 + (n & 0x3fff), 1 + ((n >> 14) & 0x3fff)]; }
        if (chunk === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    }
    if (b.readUInt32BE(0) === 0x89504e47) return [b.readUInt32BE(16), b.readUInt32BE(20)];
    if (b[0] === 0xff && b[1] === 0xd8) {
        for (let i = 2; i < b.length;) {
            if (b[i] !== 0xff) { i++; continue; }
            const marker = b[i + 1];
            const len = b.readUInt16BE(i + 2);
            if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
            i += 2 + len;
        }
    }
    throw new Error(`image-size: cannot read the size of ${file}`);
}

// Size of a local image ("/images/a.webp"), cached; null for anything else.
function size(src) {
    if (!src || !String(src).startsWith("/images/")) return null;
    if (!cache.has(src)) cache.set(src, readSize(path.join(ROOT, src)));
    return cache.get(src);
}

// width="{{ src | imgWidth }}" height="{{ src | imgHeight }}"
const imgWidth = (src) => (size(src) || [""])[0];
const imgHeight = (src) => (size(src) || ["", ""])[1];

module.exports = { imgWidth, imgHeight, readSize };
