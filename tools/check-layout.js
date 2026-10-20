#!/usr/bin/env node
// Layout check: blocks that touch. Opens every built page at a phone and a
// desktop width and reports two stacked siblings with no space between them
// where one of them is a visible box (background, border, shadow, image) or
// a row of buttons. The base styles give text and blocks no margin above,
// so space between blocks has to come from a layout piece (.stack, a grid
// gap, a section's padding); this finds the places where none was used.
//
//   npm run build && npm run check:layout
//
// It needs a browser, so it is a local check, not part of the Netlify build:
//   npm install --no-save playwright && npx playwright install chromium

const fs = require("fs");
const path = require("path");
const http = require("http");

let chromium;
try { ({ chromium } = require("playwright")); }
catch { console.error('check-layout needs Playwright: npm install --no-save playwright && npx playwright install chromium'); process.exit(2); }

const SITE = path.resolve(__dirname, "..", "_site");
const WIDTHS = [390, 1280];
// Parts that touch on purpose: a card's photo and its text, table and list
// rows (also the related-article list), form labels and fields, slides, the
// calculator, the app mock-ups.
const INTENDED = /article-image|article-content|related-article|card__photo|card__image|card__body|price-list|schedule|slide\b|calc-|message|^label|^select|^input|^textarea|internal/;

function pages(dir, out = []) {
    for (const name of fs.readdirSync(dir)) {
        const p = path.join(dir, name);
        if (fs.statSync(p).isDirectory()) { if (name !== "internal") pages(p, out); }
        // A redirect stub (meta refresh) has no layout of its own.
        else if (name.endsWith(".html") && !/http-equiv=["']?refresh/i.test(fs.readFileSync(p, "utf8"))) out.push("/" + path.relative(SITE, p));
    }
    return out;
}

function serve() {
    const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".ico": "image/x-icon", ".xml": "application/xml" };
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            const file = path.join(SITE, decodeURIComponent(req.url.split("?")[0]));
            fs.readFile(file, (err, data) => {
                if (err) { res.writeHead(404); return res.end(); }
                res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
                res.end(data);
            });
        }).listen(0, () => resolve(server));
    });
}

(async () => {
    if (!fs.existsSync(SITE)) { console.error("check-layout: run the build first (_site is missing)."); process.exit(2); }
    const server = await serve();
    const base = `http://localhost:${server.address().port}`;
    const browser = await chromium.launch();
    const problems = [];
    for (const width of WIDTHS) {
        for (const page of pages(SITE)) {
            const p = await browser.newPage({ viewport: { width, height: 900 } });
            await p.goto(base + page, { waitUntil: "load" });
            const found = await p.evaluate(() => {
                const boxy = (e) => { const c = getComputedStyle(e); return e.tagName === "IMG" || !/^(rgba\(0, 0, 0, 0\)|transparent)$/.test(c.backgroundColor) || c.backgroundImage !== "none" || c.boxShadow !== "none" || parseFloat(c.borderTopWidth) > 0 || parseFloat(c.borderBottomWidth) > 0; };
                const buttons = (e) => e.matches(".btn, .cluster") || !!e.querySelector(":scope > .btn");
                const name = (e) => e.tagName.toLowerCase() + (typeof e.className === "string" && e.className.trim() ? "." + e.className.trim().split(/\s+/).slice(0, 3).join(".") : "");
                const out = [];
                document.querySelectorAll("main *, body > section *").forEach((parent) => {
                    const kids = [...parent.children].filter((k) => { const r = k.getBoundingClientRect(); const c = getComputedStyle(k); return r.height > 4 && r.width > 40 && !/absolute|fixed/.test(c.position) && c.display !== "none" && c.visibility !== "hidden"; });
                    for (let i = 1; i < kids.length; i++) {
                        const a = kids[i - 1], b = kids[i];
                        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
                        if (rb.top < ra.bottom - 2) continue; // side by side
                        // Space inside an unboxed block counts as space too.
                        const pad = (boxy(a) ? 0 : parseFloat(getComputedStyle(a).paddingBottom)) + (boxy(b) ? 0 : parseFloat(getComputedStyle(b).paddingTop));
                        if (rb.top - ra.bottom + pad < 6 && (boxy(a) || boxy(b) || buttons(b))) out.push(`${name(a)} -> ${name(b)}`);
                    }
                });
                return [...new Set(out)];
            });
            for (const f of found) if (!INTENDED.test(f.split(" -> ").map((s) => s.split(".").slice(1).join(".") || s).join(" "))) problems.push(`${width}px ${page}: ${f}`);
            await p.close();
        }
    }
    await browser.close();
    server.close();
    if (problems.length) {
        console.error(`check-layout: ${problems.length} place(s) where two blocks touch:`);
        for (const pr of problems) console.error("  - " + pr);
        console.error("Put a .stack (or a grid gap) around them, or add the pair to INTENDED in tools/check-layout.js if they touch on purpose.");
        process.exit(1);
    }
    console.log("check-layout: OK (no touching blocks)");
})();
