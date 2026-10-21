#!/usr/bin/env node
// Content check. Runs after the Eleventy build (npm run build) and fails it
// when the content gets worse than the recorded baseline.
//
//   node tools/check-content.js            check against tools/content-baseline.json
//   node tools/check-content.js --update   rewrite the baseline to the current state
//
// What it checks, and why:
//   pages      every built page has a <title> of at most 65 characters and a
//              meta description of 70–160, and no two indexable pages share
//              either. Longer ones are cut off in search results, shorter
//              descriptions get replaced by Google with text it picks itself.
//   links      every internal link, image (src and srcset), script and
//              stylesheet points at a file in the build (or a redirect in
//              netlify.toml), and every #anchor at an id on the target page.
//   alt        every <img> has an alt attribute. alt="" is allowed: it marks
//              a decorative image, such as a logo next to its name.
//   placeholders  no "[X]", "[Your …]", "Lorem ipsum", TODO or FIXME in the
//              visible text of a built page.
//   articles   every file in artikler/ is a .md or .html article in a
//              category folder. Its front matter is checked during the
//              Eleventy build (tools/schemas.js), which stops at the first
//              bad article.
//   i18n       in _data/i18n/*.json, "en" and "da" have the same keys and
//              list lengths, and no text is empty in one language only.
//   images     files in images/ are webp, jpg or png, at most 250 KB and
//              2000 px on the long edge, with a lowercase ASCII file name.
//   forms      the form endpoint (site.formEndpoint) is only in production
//              builds (CONTEXT=production on Netlify): anywhere else a test
//              submission would reach the real inbox. In production every
//              form posts to that endpoint or to a page of the site.
//   photos     every photo recorded as "chosen" in tools/photo-candidates.json
//              (npm run photo writes these) exists in images/.
//   facts      _data/facts.json has every approved fact, as text.
//
// The baseline holds today's known problems so the check can be strict about
// anything new. When you fix one, run --update so the baseline shrinks and
// the problem cannot quietly come back.

const fs = require("fs");
const path = require("path");
const { readSize } = require("./image-size");

const ROOT = path.resolve(__dirname, "..");
const SITE = path.join(ROOT, "_site");
const BASELINE = path.join(__dirname, "content-baseline.json");
const ARTICLES = path.join(ROOT, "pages/facility/indblik/artikler");
const I18N = path.join(ROOT, "_data/i18n");
const IMAGES = path.join(ROOT, "images");

const TITLE_MAX = 65;
const DESCRIPTION = [70, 160];
const IMAGE_MAX_BYTES = 250 * 1024;
const IMAGE_MAX_EDGE = 2000;
const IMAGE_TYPES = [".webp", ".jpg", ".jpeg", ".png"];
const FACTS = ["area", "cleaningHours", "phoneHours", "callback", "quoteTime", "startTime", "urgentHelp"];
const PLACEHOLDER = /\[(?:X|Your[^\]]*|Name|Company|Client[^\]]*)\]|\bLorem ipsum\b|\bTODO\b|\bFIXME\b/i;

function walk(dir, out = []) {
    if (!fs.existsSync(dir)) return out;
    for (const name of fs.readdirSync(dir)) {
        const p = path.join(dir, name);
        if (fs.statSync(p).isDirectory()) walk(p, out);
        else out.push(p);
    }
    return out;
}

const read = (p) => fs.readFileSync(p, "utf8");
const rel = (p, from = ROOT) => path.relative(from, p).split(path.sep).join("/");

function decode(s) {
    return s
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
        .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
        .replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
        .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

// One problem: a stable id (what the baseline stores) and a message.
const problems = [];
const report = (id, message) => problems.push({ id, message });

// ---------------------------------------------------------------- built pages

// The URL a built file answers at: /index.html -> /, /a/b.html stays.
const urlOf = (file) => "/" + rel(file, SITE).replace(/(^|\/)index\.html$/, "$1");

function redirectSources() {
    const toml = path.join(ROOT, "netlify.toml");
    if (!fs.existsSync(toml)) return new Set();
    return new Set([...read(toml).matchAll(/^\s*from\s*=\s*"([^"]+)"/gm)].map((m) => m[1]));
}

// The built file a site path resolves to, as Netlify serves it: the file
// itself, a folder's index.html, or "/a" for "/a.html".
function resolveFile(p) {
    const file = path.join(SITE, decodeURIComponent(p));
    const tries = p.endsWith("/") ? [path.join(file, "index.html")] : [file, file + ".html", path.join(file, "index.html")];
    return tries.find((t) => fs.existsSync(t) && fs.statSync(t).isFile()) || null;
}

const idsCache = new Map();
function idsOf(file) {
    if (!idsCache.has(file)) {
        const html = read(file);
        idsCache.set(file, new Set([...html.matchAll(/\s(?:id|name)="([^"]+)"/g)].map((m) => m[1])));
    }
    return idsCache.get(file);
}

function checkPages() {
    const pages = walk(SITE).filter((f) => f.endsWith(".html") && !rel(f, SITE).startsWith("internal/"));
    const redirects = redirectSources();
    const titles = new Map();
    const descriptions = new Map();

    for (const file of pages) {
        const url = urlOf(file);
        const html = read(file);
        const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);
        // A redirect stub (meta refresh) is not a page of its own.
        const redirect = /<meta http-equiv="refresh"/i.test(html);

        // Title and description
        const title = decode(((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "").trim());
        const description = decode(((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "").trim());
        if (redirect) { /* only its links are checked */ }
        else if (!title) report(`title-missing:${url}`, `${url} has no <title>`);
        else if (title.length > TITLE_MAX) report(`title-length:${url}`, `${url}: title is ${title.length} characters, at most ${TITLE_MAX} ("${title}")`);
        if (redirect) { /* only its links are checked */ }
        else if (!description) report(`description-missing:${url}`, `${url} has no meta description`);
        else if (description.length < DESCRIPTION[0] || description.length > DESCRIPTION[1]) {
            report(`description-length:${url}`, `${url}: description is ${description.length} characters, should be ${DESCRIPTION[0]}–${DESCRIPTION[1]} ("${description}")`);
        }
        if (!noindex && !redirect) {
            if (title) titles.set(title, [...(titles.get(title) || []), url]);
            if (description) descriptions.set(description, [...(descriptions.get(description) || []), url]);
        }

        // Visible text only: no scripts, styles, inline SVG or inert templates.
        const body = html.replace(/<(script|style|svg|template)\b[\s\S]*?<\/\1>/g, " ");

        // Images need an alt attribute.
        for (const m of body.matchAll(/<img\b[^>]*>/g)) {
            if (!/\salt(=|\s|>)/.test(m[0])) {
                const src = (m[0].match(/\ssrc="([^"]*)"/) || [])[1] || "?";
                report(`img-alt:${url}:${src}`, `${url}: <img src="${src}"> has no alt attribute`);
            }
        }

        // Placeholder text
        const text = decode(body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
        const attrs = [...body.matchAll(/\s(?:alt|title|placeholder|aria-label)="([^"]*)"/g)].map((m) => decode(m[1]));
        for (const t of [text, ...attrs]) {
            const m = t.match(PLACEHOLDER);
            if (m) { report(`placeholder:${url}:${m[0]}`, `${url}: placeholder "${m[0]}" in the page text`); break; }
        }

        // Internal links and assets
        // (srcset: every URL in the list, before its width.)
        const refs = [
            ...[...html.matchAll(/\s(?:href|src)="([^"]*)"/g)].map((m) => m[1]),
            ...[...html.matchAll(/\ssrcset="([^"]*)"/g)].flatMap((m) => m[1].split(",").map((c) => c.trim().split(/\s+/)[0])),
        ];
        for (const raw of refs) {
            const ref = decode(raw);
            if (!ref || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(ref)) continue; // https:, mailto:, tel:, data:, //cdn
            const [beforeHash, hash] = ref.split("#");
            const target = beforeHash.split("?")[0];
            let file2 = file;
            if (target) {
                const abs = target.startsWith("/") ? target : path.posix.join(path.posix.dirname(url.endsWith("/") ? url + "x" : url), target);
                file2 = resolveFile(abs);
                if (!file2) {
                    if (!redirects.has(abs) && !redirects.has(abs.replace(/\/$/, ""))) report(`link:${url}:${abs}`, `${url} links to ${abs}, which is not in the build`);
                    continue;
                }
            }
            if (hash && file2.endsWith(".html") && !idsOf(file2).has(decodeURIComponent(hash))) {
                const where = target ? urlOf(file2) : url;
                report(`anchor:${url}:${where}#${hash}`, `${url} links to ${where}#${hash}, but that page has no id "${hash}"`);
            }
        }
    }

    for (const [title, urls] of titles) if (urls.length > 1) report(`title-duplicate:${urls.join(",")}`, `same title on ${urls.join(", ")}: "${title}"`);
    for (const [d, urls] of descriptions) if (urls.length > 1) report(`description-duplicate:${urls.join(",")}`, `same description on ${urls.join(", ")}: "${d}"`);
    return pages.length;
}

// ------------------------------------------------------------------- articles

// The categories are the folders in artikler.11tydata.js; an article
// outside them would not get a label or a filter.
const ARTICLE_FOLDERS = ["indsigt", "tips", "baeredygtighed", "innovation", "cases"];

function checkArticles() {
    const files = walk(ARTICLES).filter((f) => !/\.11tydata\.js$/.test(f) && !path.basename(f).startsWith("_"));
    for (const file of files) {
        const name = rel(file);
        const folder = path.basename(path.dirname(file));
        if (!/\.(md|html)$/.test(file)) report(`article-type:${name}`, `${name}: articles are .md (or .html) files`);
        else if (!ARTICLE_FOLDERS.includes(folder)) report(`article-folder:${name}`, `${name}: put the article in one of ${ARTICLE_FOLDERS.join(", ")}`);
    }
    return files.length;
}

// ----------------------------------------------------------------------- i18n

function shape(a, b, where, file) {
    if (Array.isArray(a) !== Array.isArray(b) || typeof a !== typeof b) {
        report(`i18n-type:${file}:${where}`, `${file}: ${where} is a different kind of value in "en" and "da"`);
        return;
    }
    if (typeof a === "string") {
        // Empty in both languages is a deliberate "none" (a tier without a
        // badge); empty in one means a translation is missing.
        if (!a.trim() && b.trim()) report(`i18n-empty:${file}:en${where}`, `${file}: en${where} is empty, but da has text`);
        if (!b.trim() && a.trim()) report(`i18n-empty:${file}:da${where}`, `${file}: da${where} is empty, but en has text`);
        return;
    }
    if (Array.isArray(a)) {
        if (a.length !== b.length) report(`i18n-length:${file}:${where}`, `${file}: ${where} has ${a.length} items in "en" and ${b.length} in "da"`);
        for (let i = 0; i < Math.min(a.length, b.length); i++) shape(a[i], b[i], `${where}[${i}]`, file);
        return;
    }
    if (a && typeof a === "object") {
        for (const k of Object.keys(a)) {
            if (!(k in b)) report(`i18n-key:${file}:da${where}.${k}`, `${file}: "${k}" at ${where || "top"} is in "en" but not in "da"`);
            else shape(a[k], b[k], `${where}.${k}`, file);
        }
        for (const k of Object.keys(b)) if (!(k in a)) report(`i18n-key:${file}:en${where}.${k}`, `${file}: "${k}" at ${where || "top"} is in "da" but not in "en"`);
    }
}

function checkI18n() {
    const files = fs.readdirSync(I18N).filter((f) => f.endsWith(".json"));
    for (const f of files) {
        const name = `_data/i18n/${f}`;
        let json;
        try { json = JSON.parse(read(path.join(I18N, f))); }
        catch (e) { report(`i18n-json:${name}`, `${name} is not valid JSON (${e.message})`); continue; }
        if (!json.en || !json.da) { report(`i18n-lang:${name}`, `${name} needs both "en" and "da"`); continue; }
        shape(json.en, json.da, "", name);
    }
    return files.length;
}

// --------------------------------------------------------------------- images

function checkImages() {
    const files = walk(IMAGES).filter((f) => !path.basename(f).startsWith("."));
    for (const file of files) {
        const name = rel(file);
        const ext = path.extname(file).toLowerCase();
        if (!/^[a-z0-9][a-z0-9._-]*$/.test(path.basename(file))) report(`image-name:${name}`, `${name}: file name should be lowercase a–z, 0–9, "-" (æ→ae, ø→oe, å→aa)`);
        if (!IMAGE_TYPES.includes(ext)) { report(`image-type:${name}`, `${name}: only ${IMAGE_TYPES.join(", ")} go in images/`); continue; }
        const bytes = fs.statSync(file).size;
        if (bytes > IMAGE_MAX_BYTES) report(`image-bytes:${name}`, `${name} is ${Math.round(bytes / 1024)} KB, at most ${IMAGE_MAX_BYTES / 1024} KB`);
        let size;
        try { size = readSize(file); } catch { report(`image-unreadable:${name}`, `${name}: cannot read its size; is it a real ${ext} file?`); continue; }
        if (Math.max(...size) > IMAGE_MAX_EDGE) report(`image-edge:${name}`, `${name} is ${size.join("×")} px, at most ${IMAGE_MAX_EDGE} px on the long edge`);
    }
    return files.length;
}

// ---------------------------------------------------------------------- forms

function checkForms() {
    const production = process.env.CONTEXT === "production";
    const endpoint = JSON.parse(read(path.join(ROOT, "_data/site.json"))).formEndpoint;
    if (!endpoint) { report("forms-endpoint", "_data/site.json has no formEndpoint"); return; }
    const host = new URL(endpoint).host;
    for (const file of walk(SITE).filter((f) => /\.(html|js)$/.test(f) && !rel(f, SITE).startsWith("internal/"))) {
        const url = urlOf(file);
        const text = read(file);
        if (!production && text.includes(host)) {
            report(`forms-preview:${url}`, `${url}: contains the form endpoint (${host}) in a non-production build; forms would post to the real inbox`);
        }
        for (const m of text.matchAll(/<form\b[^>]*\saction="([^"]*)"/g)) {
            const action = decode(m[1]);
            const ok = production ? action === endpoint || action.startsWith("/") : !/^(?:[a-z]+:)?\/\//i.test(action);
            if (!ok) report(`forms-action:${url}:${action}`, `${url}: <form action="${action}"> ${production ? `should be site.formEndpoint or a page of the site` : `posts off the site in a non-production build`}`);
        }
    }
}

// --------------------------------------------------------------- photo sources

function checkPhotoSources() {
    const file = path.join(__dirname, "photo-candidates.json");
    let slots;
    try { slots = JSON.parse(read(file)); }
    catch (e) { report("photo-candidates-json", `tools/photo-candidates.json is not valid JSON (${e.message})`); return; }
    for (const [slot, entry] of Object.entries(slots)) {
        const chosen = entry && entry.chosen;
        if (!chosen) continue;
        if (!chosen.file || !fs.existsSync(path.join(ROOT, chosen.file))) {
            report(`photo-chosen:${slot}`, `tools/photo-candidates.json: "${slot}" records ${chosen.file || "no file"}, which is not in images/`);
        }
    }
}

// ---------------------------------------------------------------------- facts

function checkFacts() {
    const file = path.join(ROOT, "_data/facts.json");
    let facts;
    try { facts = JSON.parse(read(file)); }
    catch (e) { report("facts-json", `_data/facts.json is missing or not valid JSON (${e.message})`); return; }
    for (const k of FACTS) if (typeof facts[k] !== "string" || !facts[k].trim()) report(`facts-field:${k}`, `_data/facts.json: "${k}" should be a non-empty text`);
    if (!facts.founded || !Number.isInteger(facts.founded.year) || !/^\d{4}-\d{2}-\d{2}$/.test(facts.founded.date || "")) {
        report("facts-field:founded", `_data/facts.json: "founded" needs a year and an ISO date`);
    }
    if (!Array.isArray(facts.viaPartner)) report("facts-field:viaPartner", `_data/facts.json: "viaPartner" should be a list`);
}

// ----------------------------------------------------------------------- main

function main() {
    if (!fs.existsSync(SITE)) {
        console.error("check-content: no _site; run the Eleventy build first.");
        process.exit(2);
    }
    const counts = {
        pages: checkPages(),
        articles: checkArticles(),
        i18n: checkI18n(),
        images: checkImages(),
    };
    checkForms();
    checkPhotoSources();
    checkFacts();

    const current = [...new Set(problems.map((p) => p.id))].sort();
    const baseline = fs.existsSync(BASELINE) ? JSON.parse(read(BASELINE)) : { known: [] };

    if (process.argv.includes("--update")) {
        const next = {
            "//": "Written by tools/check-content.js --update. Today's known content problems, which may only shrink: fix one, then run npm run content:baseline.",
            known: current,
        };
        fs.writeFileSync(BASELINE, JSON.stringify(next, null, 2) + "\n");
        console.log(`check-content: baseline updated (${current.length} known problem(s)).`);
        return;
    }

    const known = new Set(baseline.known || []);
    const fresh = problems.filter((p) => !known.has(p.id));
    const fixed = [...known].filter((id) => !current.includes(id));

    if (fixed.length) {
        console.log(`check-content: ${fixed.length} improvement(s) since the baseline. Run "npm run content:baseline" so they cannot come back:`);
        for (const id of fixed) console.log("  + " + id);
    }
    if (fresh.length) {
        console.error(`check-content: ${fresh.length} problem(s):`);
        for (const p of fresh) console.error("  - " + p.message);
        console.error("Fix them. The baseline (tools/content-baseline.json) is for problems that existed before this check, not new ones.");
        process.exit(1);
    }
    console.log(`check-content: OK (${counts.pages} pages, ${counts.articles} articles, ${counts.i18n} i18n files, ${counts.images} images; known debt: ${known.size - fixed.length}).`);
}

main();
