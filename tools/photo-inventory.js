#!/usr/bin/env node
// Photo inventory. Runs after the Eleventy build (npm run build) and lists
// every photo slot on the site at /internal/photos/, for the team.
//
// The inventory is built locally only. On Netlify (NETLIFY=true, so
// production and every deploy preview) it still strips the markers from the
// public pages, but writes nothing under /internal/: the overview, the CSV and
// the page copies are never deployed, so there is nothing online to protect.
// See it with npm run preview.
//
//   node tools/photo-inventory.js
//
// What counts as a slot:
//   marked      any element with data-photo-slot="id". data-photo-status says
//               "missing" or "stand-in" (a photo shows, but the wrong one);
//               without it the slot is real. data-photo-brief says what the
//               photo should show. {% photoSlot "id" %} (see .eleventy.js)
//               marks an empty slot without changing the page.
//   <img>       every other image is listed as real, except logos and images
//               marked data-photo-skip (thumbnails repeating a photo listed
//               elsewhere, such as article cards).
//   background  an element whose class sets a background-image photo in the
//               CSS (.panels__bg--cleaning, .hero__image--home) is listed as real.
//
// The markers are for this tool only, so it removes them from the public
// pages once it has read them.
//
// Briefs and stock-photo candidates can be added per slot id in
// tools/photo-candidates.json; candidates can be tried in the live preview.
//
// Writes:
//   _site/internal/photos/index.html    the overview, grouped by side and page
//   _site/internal/photos/shotlist.csv  missing and stand-in slots, for a
//                                       photographer or a spreadsheet

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE = path.join(ROOT, "_site");
const OUT = path.join(SITE, "internal", "photos");
const VIEW_URL = "/internal/photos/view";
// Netlify sets NETLIFY=true in every build it runs.
const LOCAL = process.env.NETLIFY !== "true";

function walk(dir, ext, out = []) {
    if (!fs.existsSync(dir)) return out;
    for (const name of fs.readdirSync(dir)) {
        const p = path.join(dir, name);
        if (fs.statSync(p).isDirectory()) walk(p, ext, out);
        else if (p.endsWith(ext)) out.push(p);
    }
    return out;
}

const read = (p) => fs.readFileSync(p, "utf8");
const url = (file) => "/" + path.relative(SITE, file).split(path.sep).join("/");

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };
const decode = (s) => s.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, e) => ENTITIES[e]);
const text = (html) => decode(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

// An opening tag, allowing ">" inside quoted attribute values.
const TAG = /<([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const ATTR = /([^\s=/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

function attrs(src) {
    const out = {};
    for (const m of src.matchAll(ATTR)) out[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? "");
    return out;
}

// Script and style bodies blanked out, keeping every offset, so markup-like
// strings inside them are never read as tags.
const blankCode = (html) =>
    html.replace(/(<(script|style)\b[^>]*>)([\s\S]*?)(<\/\2>)/gi, (_, open, _t, body, close) => open + " ".repeat(body.length) + close);

// Single-class CSS rules that set a photo as background: class -> image url.
function backgroundPhotos() {
    const map = new Map();
    const rule = /\.([\w-]+)\s*\{[^{}]*?background(?:-image)?\s*:[^;{}]*url\((['"]?)(\/images\/[^'")]+)\2\)/g;
    for (const file of walk(path.join(SITE, "css"), ".css")) {
        for (const m of read(file).matchAll(rule)) map.set(m[1], m[3]);
    }
    return map;
}

function side(pageUrl) {
    return pageUrl.startsWith("/pages/software/") ? "Platform" : "Facility";
}

// EN and DA platform pages share their slots, so they are listed once.
function groupKey(pageUrl) {
    if (pageUrl.includes("/indblik/artikler/")) return "/pages/facility/indblik/artikler/";
    return pageUrl.replace("/pages/software/da/", "/pages/software/");
}

function collect(file, bgMap, slots) {
    const html = read(file);
    const scan = blankCode(html);
    const pageUrl = url(file);
    const title = text((html.match(/<title>([\s\S]*?)<\/title>/i) || [, ""])[1]).replace(/\s*[|—-]\s*DFMG.*$/, "").replace(/^DFMG(?: Platform)?\s*[—-]\s*/, "");
    const lang = pageUrl.startsWith("/pages/software/da/") ? "DA" : pageUrl.startsWith("/pages/software/") ? "EN" : "";

    // Headings, and the divs styled as one (<div class="title ...">).
    const headings = [...scan.matchAll(/<(h[1-4])\b[^>]*>([\s\S]*?)<\/\1>|<div\b[^>]*class="(?:[^"]*\s)?title(?:\s[^"]*)?"[^>]*>([^<]*)<\/div>/gi)]
        .map((m) => ({ at: m.index, end: m.index + m[0].length, text: text(m[2] ?? m[3]) }))
        .filter((h) => h.text);
    const paragraphs = [...scan.matchAll(/<(p|div)\b[^>]*class="[^"]*\b(?:body|slide-body)\b[^"]*"[^>]*>([\s\S]*?)<\/\1>|<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
        .map((m) => ({ at: m.index, text: text(m[2] ?? m[3]) }))
        .filter((p) => p.text.length > 30);

    const context = (at, end, ownHeadingAfter) => {
        // A background photo's heading sits just after it, inside the same card.
        const close = ownHeadingAfter && headings.find((h) => h.at > end && h.at - end < 600);
        if (close) return { section: close.text, snippet: "" };
        const before = headings.filter((h) => h.at < at).pop();
        const heading = before || headings.find((h) => h.at > at);
        const from = heading ? heading.end : at;
        const para = paragraphs.find((p) => p.at >= from) || paragraphs.filter((p) => p.at < at).pop();
        return { section: heading ? heading.text : title, snippet: para ? clip(para.text, 180) : "" };
    };

    let auto = 0;
    let listed = 0;
    const inserts = [];
    for (const m of scan.matchAll(TAG)) {
        const tag = m[1].toLowerCase();
        const a = attrs(m[2]);
        const bgClass = (a.class || "").split(/\s+/).find((c) => bgMap.has(c));
        const isImg = tag === "img" && a.src && !a.src.startsWith("data:");

        let id = a["data-photo-slot"];
        if (!id) {
            if (isImg && !("data-photo-skip" in a) && !a.src.includes("/images/logos/")) id = "img-" + path.basename(a.src).replace(/\.\w+$/, "") + "-" + ++auto;
            else if (bgClass) id = "bg-" + bgClass + "-" + ++auto;
            else continue;
            // So the preview copy can find this slot too.
            inserts.push({ at: m.index + 1 + m[1].length, text: ` data-photo-slot="${id}"` });
        }

        const src = isImg ? a.src : bgClass ? bgMap.get(bgClass) : "";
        const status = a["data-photo-status"] || (src ? "real" : "missing");
        const key = groupKey(pageUrl) + "#" + id;
        const known = slots.get(key);
        if (known) {
            if (lang && !known.langs.includes(lang)) known.langs.push(lang);
            continue;
        }
        const ctx = context(m.index, m.index + m[0].length, !isImg && !!bgClass);
        listed++;
        slots.set(key, {
            id, status, src,
            view: VIEW_URL + pageUrl,
            brief: a["data-photo-brief"] || "",
            label: a.alt || "",
            side: side(pageUrl),
            group: groupKey(pageUrl),
            pageTitle: pageUrl.includes("/indblik/artikler/") ? "Artikler" : title,
            pageUrl: pageUrl.replace("/pages/software/da/", "/pages/software/"),
            articleTitle: pageUrl.includes("/indblik/artikler/") ? title : "",
            langs: lang ? [lang] : [],
            ...ctx,
        });
    }

    // A copy of the page with its markers kept, for the live previews (local
    // builds only). The public page loses its markers in strip().
    if (listed && LOCAL) {
        let copy = html;
        for (const ins of inserts.reverse()) copy = copy.slice(0, ins.at) + ins.text + copy.slice(ins.at);
        const dest = path.join(OUT, "view", ...pageUrl.split("/").filter(Boolean));
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, copy);
    }
}

// Remove the markers from a public page once read.
function strip(file) {
    const html = read(file);
    const out = html
        .replace(/<template\b[^>]*\bdata-photo-slot\b[^>]*>\s*<\/template>/g, "")
        .replace(TAG, (tag) =>
            tag.includes("data-photo-")
                ? tag.replace(/\s+data-photo-(?:slot|status|brief|skip)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?/g, "")
                : tag);
    if (out !== html) fs.writeFileSync(file, out);
}

function csvCell(s) {
    s = String(s ?? "");
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

// Pexels serves any width on request; ask for what each use needs.
const sized = (u, w) => /^https:\/\/images\.pexels\.com\//.test(u) ? u + (u.includes("?") ? "&" : "?") + "auto=compress&cs=tinysrgb&w=" + w : u;

function candidates(s) {
    if (!s.candidates || !s.candidates.length) return "";
    const items = s.candidates.map((c, i) => {
        const letter = String.fromCharCode(65 + i);
        return `<li><button type="button" class="cand" data-try="${esc(sized(c.image, 1600))}" data-try-label="${esc("Option " + letter + ": " + c.title)}" aria-label="Try option ${letter} on the page: ${esc(c.title)}"><img src="${esc(sized(c.image, 320))}" alt="" loading="lazy"><span>${letter}</span></button><a href="${esc(c.page)}" target="_blank" rel="noopener">Source</a></li>`;
    }).join("");
    return `<div class="cands"><p class="cands__label">Candidates · click one to try it on the page</p><ul>${items}</ul></div>`;
}

const STATUS = {
    missing: { label: "Missing", order: 0 },
    "stand-in": { label: "Stand-in", order: 1 },
    real: { label: "Real", order: 2 },
};

function card(s) {
    const st = STATUS[s.status] ? s.status : "missing";
    const thumb = s.src
        ? `<img src="${esc(s.src)}" alt="" loading="lazy">${st === "stand-in" ? '<span class="thumb__tag">Stand-in</span>' : ""}`
        : `<div class="thumb__missing"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18M9.5 5h5l1.5 2H19a2 2 0 0 1 2 2v8.5M17 19H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2"/><path d="M9.9 10.9a3 3 0 0 0 4.2 4.2"/></svg><span>${st === "stand-in" ? "Stand-in" : "Missing"}</span></div>`;
    // A real photo is named by its alt text; the heading above it is context.
    const title = s.articleTitle || (s.status === "real" && s.label) || s.section;
    const sub = title !== s.section ? "Section: " + s.section : "";
    const brief = s.brief
        ? `<p class="card__brief"><strong>Brief:</strong> ${esc(s.brief)}</p>`
        : st === "missing" ? `<p class="card__brief card__brief--none">No brief written yet</p>` : "";
    const link = s.pageUrl + (s.section ? "#:~:text=" + encodeURIComponent(s.section) : "");
    return `<article class="card" data-status="${st}" data-side="${s.side.toLowerCase()}" data-search="${esc((s.id + " " + title + " " + s.snippet + " " + s.brief).toLowerCase())}">
<div class="preview" data-view="${esc(s.view)}" data-slot="${esc(s.id)}" data-status="${st}" data-title="${esc(title)}" data-live="${esc(s.pageUrl)}">
<div class="preview__fallback"><div class="thumb">${thumb}</div><span class="preview__note">Loading the page…</span></div>
<button type="button" class="preview__open" aria-label="Open a large preview of ${esc(title)}"><span class="preview__chip"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9"/></svg>View on page</span></button>
</div>
<div class="card__body">
<div class="card__head"><h3>${esc(title)}</h3><span class="pill pill--${st}">${STATUS[st].label}</span></div>
${sub ? `<p class="card__sub">${esc(sub)}</p>` : ""}${s.snippet ? `<p class="card__snippet">${esc(s.snippet)}</p>` : ""}${brief}${candidates(s)}
<div class="card__foot"><code>${esc(s.id)}</code>${s.langs.length > 1 ? `<span class="tag tag--lang">${s.langs.join(" + ")}</span>` : ""}<a href="${esc(link)}" target="_blank" rel="noopener">Open on page</a></div>
</div>
</article>`;
}

function page(slots, built) {
    const count = (st, sd) => slots.filter((s) => s.status === st && (!sd || s.side === sd)).length;
    const groups = new Map();
    for (const s of slots) {
        if (!groups.has(s.group)) groups.set(s.group, { side: s.side, title: s.pageTitle, url: s.group, slots: [] });
        groups.get(s.group).slots.push(s);
    }
    const ordered = [...groups.values()].sort((a, b) =>
        a.side.localeCompare(b.side) ||
        Math.min(...a.slots.map((s) => STATUS[s.status]?.order ?? 0)) - Math.min(...b.slots.map((s) => STATUS[s.status]?.order ?? 0)) ||
        a.title.localeCompare(b.title, "da"));

    const sections = ordered.map((g) => {
        g.slots.sort((a, b) => (STATUS[a.status]?.order ?? 0) - (STATUS[b.status]?.order ?? 0));
        const langs = g.slots.some((s) => s.langs.length > 1) ? "shown on EN + DA" : "";
        return `<section class="group" data-side="${g.side.toLowerCase()}">
<div class="group__head"><span class="side side--${g.side.toLowerCase()}">${g.side}</span><h2>${esc(g.title)}</h2><code>${esc(g.url)}</code><span class="group__count" data-count></span><span class="group__langs">${langs}</span></div>
<div class="grid">${g.slots.map(card).join("\n")}</div>
</section>`;
    }).join("\n");

    const chip = (st, label, n) =>
        `<button type="button" class="chip chip--${st}" data-filter-status="${st}" aria-pressed="false"><span class="chip__dot"></span>${label} <strong>${n}</strong></button>`;

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Photo inventory · DFMG internal</title>
<link rel="icon" href="/favicon.ico">
<style>
@font-face{font-family:Montserrat;font-weight:400;font-display:swap;src:url(/fonts/montserrat-latin-400.woff2) format("woff2")}
@font-face{font-family:Montserrat;font-weight:500;font-display:swap;src:url(/fonts/montserrat-latin-500.woff2) format("woff2")}
@font-face{font-family:Montserrat;font-weight:600;font-display:swap;src:url(/fonts/montserrat-latin-600.woff2) format("woff2")}
@font-face{font-family:Montserrat;font-weight:700;font-display:swap;src:url(/fonts/montserrat-latin-700.woff2) format("woff2")}
:root{--ink:#1b2433;--muted:#4a5568;--faint:#5b6678;--line:#e2e8f0;--bg:#f6f8fb;--blue:#1a5fd0;--miss:#c2410c;--miss-bg:#fff1e6;--stand:#8a5a00;--stand-bg:#fdf3dc;--real:#344767;--real-bg:#e8edf5}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:Montserrat,system-ui,sans-serif}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:var(--faint);overflow-wrap:anywhere;min-width:0}
a{color:var(--blue)}
.top{background:var(--ink);color:#fff}
.top__in,.main{max-width:1360px;margin:0 auto;padding:18px 24px}
.top__in{display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between}
.top__brand{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.top__brand b{font-size:18px}.top__brand span{color:#c4cdda;font-size:15px}
.badge{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;padding:4px 8px;border-radius:6px;background:#344767;color:#e6edf7}
.top code{color:#c4cdda}
.main{padding-top:32px;padding-bottom:64px;display:flex;flex-direction:column;gap:28px}
.intro{display:flex;flex-wrap:wrap;gap:20px;align-items:flex-end;justify-content:space-between}
h1{margin:0 0 8px;font-size:34px;letter-spacing:-.01em}
.intro p{margin:0;color:var(--muted);line-height:1.5;max-width:680px}
.btn{display:inline-flex;gap:8px;align-items:center;min-height:44px;padding:0 18px;border-radius:10px;border:1px solid var(--ink);background:#fff;color:var(--ink);font-weight:600;font-size:14px;text-decoration:none}
.bar{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{min-height:44px;padding:0 16px;border-radius:10px;border:1px solid var(--line);background:#fff;color:var(--ink);font:500 14px Montserrat,system-ui,sans-serif;display:inline-flex;align-items:center;gap:4px;cursor:pointer}
.chip__dot{width:8px;height:8px;border-radius:4px;margin-right:6px;background:var(--ink)}
.chip--missing .chip__dot{background:var(--miss)}.chip--stand-in .chip__dot{background:var(--stand)}.chip--real .chip__dot{background:var(--real)}
.chip[aria-pressed=true]{border-width:2px}
.chip--missing[aria-pressed=true]{border-color:var(--miss);background:var(--miss-bg);color:var(--miss)}
.chip--stand-in[aria-pressed=true]{border-color:var(--stand);background:var(--stand-bg);color:var(--stand)}
.chip--real[aria-pressed=true]{border-color:var(--real);background:var(--real-bg);color:var(--real)}
.chip--all[aria-pressed=true]{border-color:var(--ink);background:#f1f5f9}
.seg{display:flex;gap:4px;background:#f1f5f9;border-radius:10px;padding:4px}
.seg button{min-height:40px;padding:0 16px;border:0;border-radius:8px;background:transparent;color:var(--muted);font:600 14px Montserrat,system-ui,sans-serif;cursor:pointer}
.seg button[aria-pressed=true]{background:#fff;color:var(--ink);box-shadow:0 1px 2px rgba(16,24,40,.12)}
.search{min-height:44px;padding:0 14px;border:1px solid var(--line);border-radius:10px;font:14px Montserrat,system-ui,sans-serif;min-width:220px;flex:1;max-width:320px}
button:focus-visible,a:focus-visible,.search:focus-visible{outline:3px solid #4285f4;outline-offset:2px}
.group{display:flex;flex-direction:column;gap:14px}
.group__head{display:flex;flex-wrap:wrap;gap:12px;align-items:baseline;border-bottom:1px solid var(--line);padding-bottom:10px}
.group__head h2{margin:0;font-size:20px}
.group__count{margin-left:auto;font-size:13px;color:var(--muted);font-weight:500}
.group__langs{font-size:13px;color:var(--muted)}
.side{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:3px 8px;border-radius:6px}
.side--platform{background:#eef4ff;color:var(--blue)}.side--facility{background:var(--real-bg);color:var(--real)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,380px),1fr));gap:16px}
.card{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;display:flex;flex-direction:column}
.thumb{flex:0 0 132px;width:132px;height:104px;border-radius:10px;overflow:hidden;position:relative;background:#f1f5f9}
.thumb img{width:100%;height:100%;object-fit:cover;display:block}
.thumb__tag{position:absolute;left:6px;bottom:6px;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:3px 6px;border-radius:5px;background:var(--stand-bg);color:var(--stand)}
.thumb__missing{width:100%;height:100%;border:2px dashed #e8a37a;background:#fff6ef;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:var(--miss);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.card[data-status=stand-in] .thumb__missing{border-color:#d9b25c;background:#fdf8ea;color:var(--stand)}
.card__body{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;padding:14px}
.preview{position:relative;height:250px;background:#e9edf3;overflow:hidden;border-bottom:1px solid var(--line)}
.preview iframe{position:absolute;top:0;left:0;width:1280px;border:0;transform-origin:0 0;pointer-events:none;opacity:0;transition:opacity .25s}
.preview.is-ready iframe{opacity:1}
.preview.is-ready .preview__fallback{display:none}
.preview__fallback{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}
.preview__note{font-size:12px;color:var(--faint)}
.preview__open{position:absolute;inset:0;width:100%;border:0;padding:0;background:transparent;cursor:zoom-in}
.preview__chip{position:absolute;right:10px;bottom:10px;display:inline-flex;gap:6px;align-items:center;min-height:36px;padding:0 12px;border-radius:9px;background:rgba(27,36,51,.88);color:#fff;font:600 13px Montserrat,system-ui,sans-serif}
.preview__open:hover .preview__chip,.preview__open:focus-visible .preview__chip{background:var(--ink)}
.preview__open:focus-visible{outline-offset:-3px}
.viewer{width:min(1400px,96vw);height:92vh;max-width:none;max-height:none;padding:0;border:0;border-radius:14px;overflow:hidden;box-shadow:0 24px 64px rgba(16,24,40,.35)}
.viewer[open]{display:flex;flex-direction:column}
.viewer::backdrop{background:rgba(16,24,40,.6)}
.viewer__bar{display:flex;flex-wrap:wrap;gap:12px;align-items:center;padding:12px 16px;border-bottom:1px solid var(--line);background:#fff}
.viewer__bar h2{margin:0;font-size:16px;flex:1;min-width:200px}
.viewer__link{font-weight:600;font-size:14px}
.viewer__try{font-size:13px;font-weight:600;color:var(--stand);background:var(--stand-bg);padding:6px 10px;border-radius:8px}
.cands{display:flex;flex-direction:column;gap:6px;margin-top:4px}
.cands__label{font-size:12px;font-weight:600;color:var(--faint)}
.cands ul{list-style:none;margin:0;padding:0;display:flex;gap:10px;flex-wrap:wrap}
.cands li{display:flex;flex-direction:column;gap:2px;align-items:center;font-size:12px}
.cands a{padding:2px 4px}
.cand{position:relative;width:88px;height:66px;padding:0;border:2px solid var(--line);border-radius:8px;overflow:hidden;cursor:pointer;background:#f1f5f9}
.cand:hover{border-color:var(--blue)}
.cand img{width:100%;height:100%;object-fit:cover;display:block}
.cand span{position:absolute;left:4px;top:4px;background:rgba(27,36,51,.85);color:#fff;font-size:11px;font-weight:700;border-radius:4px;padding:1px 5px}
.viewer__close{width:44px;height:44px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--ink);cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.viewer__stage{flex:1;background:#e9edf3;display:flex;justify-content:center;min-height:0}
.viewer__stage iframe{border:0;width:100%;height:100%;background:#fff}
.viewer__stage.is-phone iframe{width:390px;border-left:1px solid var(--line);border-right:1px solid var(--line)}
.card__head{display:flex;gap:8px;align-items:flex-start;justify-content:space-between}
.card h3{margin:0;font-size:15px;font-weight:600;line-height:1.35}
.card p{margin:0;font-size:13px;line-height:1.45}
.card__sub{color:var(--faint)}
.card__snippet{color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card__brief--none{color:var(--miss);font-style:italic}
.card__foot{margin-top:auto;display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:13px}
.card__foot a{margin-left:auto;font-weight:600}
.pill{flex:none;font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px}
.pill--missing{background:var(--miss-bg);color:var(--miss)}.pill--stand-in{background:var(--stand-bg);color:var(--stand)}.pill--real{background:var(--real-bg);color:var(--real)}
.tag{font-size:11px;font-weight:600;padding:2px 6px;border-radius:5px}.tag--lang{background:#eef4ff;color:var(--blue)}
.empty{padding:48px;text-align:center;color:var(--muted);background:#fff;border:1px dashed #cbd5e1;border-radius:14px}
.foot{font-size:12px;color:var(--faint);border-top:1px solid var(--line);padding-top:16px;line-height:1.6}
[hidden]{display:none!important}
</style>
</head>
<body>
<header class="top"><div class="top__in">
<div class="top__brand"><b>DFMG</b><span>Photo inventory</span><span class="badge">Internal</span></div>
<code>generated ${esc(built)}</code>
</div></header>
<main class="main">
<div class="intro">
<div><h1>Every photo slot on dfmg.dk</h1>
<p>One card per slot, with the section it sits in. Rebuilt on every deploy from the live pages. Platform: ${count("missing", "Platform")} missing, ${count("real", "Platform")} real. Facility: ${count("missing", "Facility")} missing, ${count("stand-in", "Facility")} stand-in, ${count("real", "Facility")} real.</p></div>
<a class="btn" href="shotlist.csv" download><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v8M4.5 6.5 8 10l3.5-3.5M2.5 13.5h11"/></svg>Download shot list (CSV)</a>
</div>
<div class="bar">
<div class="chips" role="group" aria-label="Status">
${chip("missing", "Missing", count("missing"))}
${chip("stand-in", "Stand-in", count("stand-in"))}
${chip("real", "Real", count("real"))}
${chip("all", "All", slots.length)}
</div>
<input class="search" type="search" placeholder="Search slots" aria-label="Search slots">
<div class="seg" role="group" aria-label="Side">
<button type="button" data-filter-side="all" aria-pressed="true">All</button>
<button type="button" data-filter-side="facility" aria-pressed="false">Facility</button>
<button type="button" data-filter-side="platform" aria-pressed="false">Platform</button>
</div>
</div>
<p class="empty" hidden>Nothing matches these filters.</p>
${sections}
<dialog class="viewer" aria-label="Page preview">
<div class="viewer__bar">
<h2 class="viewer__title"></h2>
<span class="viewer__try" hidden></span>
<div class="seg" role="group" aria-label="Device">
<button type="button" data-device="desktop" aria-pressed="true">Desktop</button>
<button type="button" data-device="phone" aria-pressed="false">Phone</button>
</div>
<a class="viewer__link" href="/" target="_blank" rel="noopener">Open live page</a>
<button type="button" class="viewer__close" aria-label="Close preview"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 4l10 10M14 4 4 14"/></svg></button>
</div>
<div class="viewer__stage"><iframe title="Page preview"></iframe></div>
</dialog>
<p class="foot">Mark a slot in a template with <code>data-photo-slot="id"</code>, plus <code>data-photo-status="missing"</code> or <code>"stand-in"</code> and a <code>data-photo-brief</code>. For a slot with nothing on the page, use <code>{% photoSlot "id", "brief" %}</code>. Other images and CSS background photos are found on their own. Built by tools/photo-inventory.js.</p>
</main>
<script>
(function () {
    var state = { status: "missing", side: "all", q: "" };
    var cards = [].slice.call(document.querySelectorAll(".card"));
    var groups = [].slice.call(document.querySelectorAll(".group"));
    function apply() {
        cards.forEach(function (c) {
            c.hidden = !((state.status === "all" || c.dataset.status === state.status) &&
                (state.side === "all" || c.dataset.side === state.side) &&
                (!state.q || c.dataset.search.indexOf(state.q) !== -1));
        });
        var any = false;
        groups.forEach(function (g) {
            var n = g.querySelectorAll(".card:not([hidden])").length;
            g.hidden = n === 0;
            g.querySelector("[data-count]").textContent = n + (n === 1 ? " slot" : " slots");
            any = any || n > 0;
        });
        document.querySelector(".empty").hidden = any;
        document.querySelectorAll("[data-filter-status]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.filterStatus === state.status)); });
        document.querySelectorAll("[data-filter-side]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.filterSide === state.side)); });
    }
    document.addEventListener("click", function (e) {
        var b = e.target.closest("[data-filter-status],[data-filter-side]");
        if (!b) return;
        if (b.dataset.filterStatus) state.status = b.dataset.filterStatus;
        if (b.dataset.filterSide) state.side = b.dataset.filterSide;
        apply();
    });
    document.querySelector(".search").addEventListener("input", function (e) { state.q = e.target.value.trim().toLowerCase(); apply(); });
    apply();

    // Live previews: the page copy under /internal/photos/view/, scrolled to
    // the slot, with the slot outlined. An empty slot gets a box where the
    // photo belongs.
    var COLOR = { missing: "#c2410c", "stand-in": "#b7791f", real: "#1a5fd0" };
    var PREVIEW_CSS =
        ".chatbot-container{display:none!important}" +
        "*,*::before,*::after{transition:none!important;animation:none!important}" +
        ".pi-target{outline:5px solid var(--pi-color)!important;outline-offset:-5px!important}" +
        ".pi-slot{box-sizing:border-box;width:100%;min-height:220px;aspect-ratio:4/3;max-height:420px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;" +
        "border:4px dashed #c2410c;border-radius:12px;background:repeating-linear-gradient(45deg,#fff4ec 0 14px,#ffe6d5 14px 28px);color:#c2410c;" +
        "font:700 18px Montserrat,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;text-align:center}" +
        ".pi-slot small{font:500 13px ui-monospace,Menlo,monospace;letter-spacing:0;text-transform:none}";

    function highlight(frame, slot, status) {
        try {
            var win = frame.contentWindow, doc = win.document;
            var el = doc.querySelector('[data-photo-slot="' + CSS.escape(slot) + '"]');
            if (!el) return false;
            if (!doc.getElementById("pi-style")) {
                var style = doc.createElement("style");
                style.id = "pi-style";
                style.textContent = PREVIEW_CSS;
                doc.head.appendChild(style);
            }
            // Load every photo now; lazy ones off to the side would stay grey.
            [].forEach.call(doc.querySelectorAll('img[loading="lazy"]'), function (img) { img.loading = "eager"; });
            var target = el;
            if (el.tagName === "TEMPLATE") {
                target = el.previousElementSibling && el.previousElementSibling.classList.contains("pi-slot") ? el.previousElementSibling : null;
                if (!target) {
                    target = doc.createElement("div");
                    target.className = "pi-slot";
                    target.innerHTML = "Photo goes here<small></small>";
                    target.querySelector("small").textContent = slot;
                    el.parentNode.insertBefore(target, el);
                }
            }
            // Trying a candidate: put it where the slot's photo goes.
            var tryUrl = frame.dataset.try;
            if (tryUrl) {
                if (el.tagName === "IMG") {
                    el.removeAttribute("srcset");
                    if (el.src !== tryUrl) el.src = tryUrl;
                } else if (el.tagName === "TEMPLATE") {
                    if (!target.querySelector("img")) {
                        target.textContent = "";
                        target.style.border = "0";
                        target.style.background = "none";
                        var img = doc.createElement("img");
                        img.src = tryUrl;
                        img.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;border-radius:12px";
                        target.appendChild(img);
                    }
                } else {
                    el.style.setProperty("background", 'center / cover no-repeat url("' + tryUrl + '")', "important");
                    [].forEach.call(el.children, function (c) { c.style.visibility = "hidden"; });
                }
            }
            // A carousel photo that isn't showing: switch to it with its dot.
            if (el.tagName === "IMG" && el.parentElement && (!(el.offsetWidth && el.offsetHeight) || win.getComputedStyle(el).opacity === "0")) {
                var photos = el.parentElement.querySelectorAll("img");
                var dots = el.parentElement.querySelectorAll(".photo-dot");
                var d = dots[[].indexOf.call(photos, el)];
                if (d) d.click();
            }
            // A card in a sliding carousel (the homepage services) that sits
            // past the visible ones: press the carousel's own "next" button.
            var carousel = el.closest && el.closest("[data-carousel]");
            if (carousel && !carousel.hasAttribute("data-pi-moved")) {
                carousel.setAttribute("data-pi-moved", "");
                var track = carousel.querySelector(".carousel-track");
                var card = track && [].find.call(track.children, function (c) { return c.contains(el); });
                var next = (carousel.closest("section") || carousel.parentElement).querySelector("[data-carousel-next]");
                if (card && next) {
                    var w = card.offsetWidth + (parseInt(win.getComputedStyle(track).columnGap) || 20);
                    var visible = Math.max(1, Math.floor((carousel.offsetWidth + w - card.offsetWidth) / w));
                    var clicks = [].indexOf.call(track.children, card) - visible + 1;
                    var before = track.style.transform;
                    for (var c = 0; c < clicks; c++) next.click();
                    // The carousel attaches its buttons a moment after load;
                    // if nothing moved yet, try again on the next pass.
                    if (clicks > 0 && track.style.transform === before) carousel.removeAttribute("data-pi-moved");
                }
            }
            // Still hidden: outline the nearest visible box.
            while (target.parentElement && target !== doc.body && !(target.offsetWidth && target.offsetHeight)) target = target.parentElement;
            // Slide decks (the sustainability pages) show one slide at a time:
            // switch to the slot's slide with its navigation dot.
            var slide = target.closest(".slide");
            if (slide) {
                var index = [].indexOf.call(doc.querySelectorAll(".slide"), slide);
                var dot = doc.querySelectorAll(".slide-dot")[index];
                if (dot && !dot.classList.contains("active")) dot.click();
            }
            target.style.setProperty("--pi-color", COLOR[status] || COLOR.missing);
            if (el.tagName !== "TEMPLATE") target.classList.add("pi-target");
            center(win, target);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Centre the slot inside the preview only. scrollIntoView would also
    // scroll this page, since the preview is same-origin. Pages may scroll in
    // an inner box (the sustainability slides) or sideways (carousels), so
    // every scrolling box around the slot is moved, innermost first.
    function center(win, target) {
        for (var p = target.parentElement; p && p !== win.document.documentElement; p = p.parentElement) {
            var cs = win.getComputedStyle(p);
            var pr = p.getBoundingClientRect(), tr = target.getBoundingClientRect();
            if (/auto|scroll/.test(cs.overflowX) && p.scrollWidth > p.clientWidth) {
                p.scrollLeft += tr.left - pr.left - (p.clientWidth - Math.min(tr.width, p.clientWidth)) / 2;
            }
            if (/auto|scroll/.test(cs.overflowY) && p.scrollHeight > p.clientHeight) {
                p.scrollTop += tr.top - pr.top - (p.clientHeight - Math.min(tr.height, p.clientHeight)) / 2;
            }
        }
        var r = target.getBoundingClientRect();
        win.scrollTo(0, Math.max(0, r.top + win.scrollY - (win.innerHeight - Math.min(r.height, win.innerHeight)) / 2));
    }

    function whenLoaded(frame, slot, status, done) {
        frame.addEventListener("load", function () {
            var found = highlight(frame, slot, status);
            // Fonts and images move the layout once they arrive; centre again.
            setTimeout(function () { highlight(frame, slot, status); }, 900);
            setTimeout(function () { highlight(frame, slot, status); }, 1800);
            done(found);
        }, { once: true });
    }

    function size(preview) {
        var frame = preview.querySelector("iframe");
        if (!frame) return;
        var scale = preview.clientWidth / 1280;
        frame.style.transform = "scale(" + scale + ")";
        frame.style.height = Math.ceil(preview.clientHeight / scale) + "px";
    }

    function mount(preview) {
        if (preview.querySelector("iframe")) return;
        var frame = document.createElement("iframe");
        frame.setAttribute("aria-hidden", "true");
        frame.tabIndex = -1;
        frame.title = "";
        whenLoaded(frame, preview.dataset.slot, preview.dataset.status, function (found) {
            if (found) preview.classList.add("is-ready");
            else preview.querySelector(".preview__note").textContent = "Couldn't find this slot on the page";
        });
        frame.src = preview.dataset.view;
        preview.insertBefore(frame, preview.firstChild);
        size(preview);
    }

    var previews = [].slice.call(document.querySelectorAll(".preview"));
    if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { mount(e.target); io.unobserve(e.target); }
            });
        }, { rootMargin: "300px 0px" });
        previews.forEach(function (p) { io.observe(p); });
    } else {
        previews.forEach(mount);
    }
    window.addEventListener("resize", function () { previews.forEach(size); });

    // Large preview.
    var viewer = document.querySelector(".viewer");
    var stage = viewer.querySelector(".viewer__stage");
    var big = stage.querySelector("iframe");
    var current = null;
    function load() {
        whenLoaded(big, current.dataset.slot, current.dataset.status, function () {});
        big.src = current.dataset.view;
    }
    function openViewer(preview, tryUrl, tryLabel) {
        current = preview;
        big.dataset.try = tryUrl || "";
        var tag = viewer.querySelector(".viewer__try");
        tag.hidden = !tryUrl;
        tag.textContent = tryUrl ? "Trying " + tryLabel : "";
        viewer.querySelector(".viewer__title").textContent = current.dataset.title;
        viewer.querySelector(".viewer__link").href = current.dataset.live;
        if (!viewer.open) viewer.showModal();
        load();
        // A link to this exact slot (and candidate), to send to someone:
        // #slot=<id> or #slot=<id>&try=B
        history.replaceState(null, "", "#slot=" + encodeURIComponent(current.dataset.slot) + (tryUrl ? "&try=" + tryLabel.charAt(7) : ""));
    }
    document.addEventListener("click", function (e) {
        var open = e.target.closest(".preview__open");
        if (open) openViewer(open.closest(".preview"));
        var candidate = e.target.closest(".cand");
        if (candidate) openViewer(candidate.closest(".card").querySelector(".preview"), candidate.dataset.try, candidate.dataset.tryLabel);
        var device = e.target.closest("[data-device]");
        if (device && current) {
            stage.classList.toggle("is-phone", device.dataset.device === "phone");
            viewer.querySelectorAll("[data-device]").forEach(function (b) { b.setAttribute("aria-pressed", String(b === device)); });
            load();
        }
        if (e.target.closest(".viewer__close") || e.target === viewer) viewer.close();
    });
    viewer.addEventListener("close", function () {
        big.src = "about:blank";
        history.replaceState(null, "", location.pathname + location.search);
    });
    var linked = /^#slot=([^&]+)(?:&try=([A-Z]))?$/.exec(location.hash);
    if (linked) {
        var target = document.querySelector('.preview[data-slot="' + CSS.escape(decodeURIComponent(linked[1])) + '"]');
        var option = target && linked[2] && target.closest(".card").querySelectorAll(".cand")[linked[2].charCodeAt(0) - 65];
        if (option) openViewer(target, option.dataset.try, option.dataset.tryLabel);
        else if (target) openViewer(target);
    }
})();
</script>
</body>
</html>
`;
}

function main() {
    if (!fs.existsSync(SITE)) {
        console.error("photo-inventory: no _site; run the Eleventy build first");
        process.exit(1);
    }
    fs.rmSync(path.join(SITE, "internal"), { recursive: true, force: true });

    const bgMap = backgroundPhotos();
    const slots = new Map();
    // English first, so a shared platform slot takes its headings from the EN page.
    const pages = walk(SITE, ".html").sort((a, b) => a.includes("/software/da/") - b.includes("/software/da/"));
    for (const file of pages) collect(file, bgMap, slots);
    // The markers are stripped after a run, so a second run on the same build
    // would report every slot as real.
    if (![...slots.values()].some((s) => s.status !== "real")) {
        console.error("photo-inventory: no slot markers in _site; it was already processed. Rebuild with npm run build.");
        process.exit(1);
    }
    for (const file of pages) strip(file);

    const list = [...slots.values()];
    const n = (st) => list.filter((s) => s.status === st).length;
    if (!LOCAL) {
        console.log(`photos: ${n("real")} real · ${n("stand-in")} stand-in · ${n("missing")} missing  (Netlify build: /internal/ not published)`);
        return;
    }

    // Briefs and stock candidates kept by hand in tools/photo-candidates.json.
    const candFile = path.join(__dirname, "photo-candidates.json");
    const extra = fs.existsSync(candFile) ? JSON.parse(read(candFile)) : {};
    for (const [id, c] of Object.entries(extra)) {
        if (id.startsWith("_")) continue;
        const s = list.find((s) => s.id === id);
        if (!s) {
            console.warn(`photo-inventory: photo-candidates.json names "${id}", which is no slot on the site`);
            continue;
        }
        if (c.brief) s.brief = c.brief;
        s.candidates = c.candidates || [];
    }
    const built = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";
    fs.mkdirSync(OUT, { recursive: true });
    fs.writeFileSync(path.join(OUT, "index.html"), page(list, built));

    const rows = [["id", "status", "side", "page", "section", "brief", "languages", "current image", "candidates"]];
    for (const s of list.filter((s) => s.status !== "real")) {
        rows.push([s.id, s.status, s.side, s.pageUrl, s.articleTitle || s.section, s.brief, s.langs.join("+"), s.src, (s.candidates || []).map((c) => c.page).join(" ")]);
    }
    fs.writeFileSync(path.join(OUT, "shotlist.csv"), rows.map((r) => r.map(csvCell).join(",")).join("\n") + "\n");

    console.log(`photos: ${n("real")} real · ${n("stand-in")} stand-in · ${n("missing")} missing  → /internal/photos/`);
}

main();
