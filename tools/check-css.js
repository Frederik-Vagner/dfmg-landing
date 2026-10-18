#!/usr/bin/env node
// CSS usage check. Runs after the Eleventy build (npm run build) and fails it
// when CSS use gets worse than the recorded baseline.
//
//   node tools/check-css.js            check _site against tools/css-baseline.json
//   node tools/check-css.js --update   rewrite the baseline to the current state
//
// What it checks, and why:
//   undefined   a class in the built HTML with no CSS rule and no JavaScript
//               referring to it. Usually a typo or a utility that was never
//               written (m-2, card-horizontal), so the element silently gets
//               no style.
//   unused      a class defined in CSS that no page or script uses.
//   unlayered   CSS outside an @layer block. Unlayered CSS outranks every
//               layer whatever its specificity, which defeats the layer order
//               declared in css/tokens.css.
//   counts      inline style="" attributes, !important and hard-coded colours
//               outside css/tokens.css. These may only go down.
//
// The baseline holds today's known debt so the check can be strict about
// anything new. Classes that are intentional (built by JavaScript, for
// example) go in "allow" with a reason instead. When you fix something, run
// --update so the baseline shrinks and the fix cannot quietly come back.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE = path.join(ROOT, "_site");
const BASELINE = path.join(__dirname, "css-baseline.json");
const SOURCE_DIRS = ["_includes", "pages"];
const SOURCE_FILES = ["index.html", "404.html"];

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
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");
const rel = (p) => path.relative(ROOT, p);

// Class names in rule selectors only, so "url(/images/a.webp)" or
// "rgba(0,0,0,.2)" inside a declaration are never mistaken for classes.
function selectorClasses(css) {
    const found = new Set();
    css = stripComments(css);
    let start = 0;
    for (let i = 0; i < css.length; i++) {
        const ch = css[i];
        if (ch === "{") {
            const prelude = css.slice(start, i);
            if (!prelude.trim().startsWith("@")) {
                for (const m of prelude.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) found.add(m[1]);
            }
            start = i + 1;
        } else if (ch === "}" || ch === ";") {
            start = i + 1;
        }
    }
    return found;
}

// Top-level CSS that is not inside an @layer block. @font-face and
// @view-transition describe the document rather than style elements, and
// statement at-rules (@layer a, b;) carry no rules, so they are allowed.
function unlayeredRules(css) {
    css = stripComments(css);
    const problems = [];
    let i = 0;
    while (i < css.length) {
        while (i < css.length && /\s/.test(css[i])) i++;
        if (i >= css.length) break;
        const brace = css.indexOf("{", i);
        const semi = css.indexOf(";", i);
        if (semi !== -1 && (brace === -1 || semi < brace)) { i = semi + 1; continue; }
        if (brace === -1) break;
        const prelude = css.slice(i, brace).trim();
        let depth = 1, j = brace + 1;
        while (depth && j < css.length) {
            if (css[j] === "{") depth++;
            else if (css[j] === "}") depth--;
            j++;
        }
        if (!/^@(layer|font-face|view-transition)\b/.test(prelude)) problems.push(prelude.slice(0, 60));
        i = j;
    }
    return problems;
}

function check() {
    if (!fs.existsSync(SITE)) {
        console.error("check-css: _site does not exist; run the Eleventy build first.");
        process.exit(2);
    }

    // --- Definitions: built stylesheets plus <style> blocks in built pages.
    const cssFiles = walk(path.join(SITE, "css"), ".css");
    const htmlFiles = walk(SITE, ".html");
    const pages = htmlFiles.map((f) => ({ file: f, html: read(f) }));
    const defined = new Set();
    for (const f of cssFiles) for (const c of selectorClasses(read(f))) defined.add(c);
    const styleBlocks = [];
    for (const p of pages) {
        for (const m of p.html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
            styleBlocks.push({ file: p.file, css: m[1] });
            for (const c of selectorClasses(m[1])) defined.add(c);
        }
    }

    // --- Words JavaScript mentions in strings: classes it adds, toggles or
    // queries. Includes inline <script> in the pages.
    const jsTexts = walk(path.join(SITE, "js"), ".js").map(read);
    for (const p of pages) for (const m of p.html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) jsTexts.push(m[1]);
    const jsWords = new Set();
    for (const t of jsTexts) {
        for (const s of t.matchAll(/(["'`])((?:\\.|(?!\1)[^\\])*)\1/g)) {
            for (const w of s[2].matchAll(/-?[_a-zA-Z][\w-]*/g)) jsWords.add(w[0]);
        }
    }

    // --- Classes the built pages use.
    const used = new Map();
    for (const p of pages) {
        const html = p.html.replace(/<script[\s\S]*?<\/script>/g, "");
        for (const m of html.matchAll(/\sclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
            for (const c of (m[1] ?? m[2] ?? m[3]).split(/\s+/).filter(Boolean)) {
                if (!used.has(c)) used.set(c, new Set());
                used.get(c).add(rel(p.file).replace(/^_site\//, ""));
            }
        }
    }

    const undefinedClasses = [...used.keys()].filter((c) => !defined.has(c) && !jsWords.has(c)).sort();
    const unusedClasses = [...defined].filter((c) => !used.has(c) && !jsWords.has(c)).sort();

    // --- Layering, in the source stylesheets and <style> blocks.
    const unlayered = [];
    for (const f of walk(path.join(ROOT, "css"), ".css")) {
        for (const r of unlayeredRules(read(f))) unlayered.push(`${rel(f)}: ${r}`);
    }
    const templates = SOURCE_DIRS.flatMap((d) => walk(path.join(ROOT, d), ".html").concat(walk(path.join(ROOT, d), ".njk")))
        .concat(SOURCE_FILES.map((f) => path.join(ROOT, f)).filter(fs.existsSync));
    for (const f of templates) {
        for (const m of read(f).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
            for (const r of unlayeredRules(m[1])) unlayered.push(`${rel(f)} <style>: ${r}`);
        }
    }

    // --- Counts, measured in the source people edit (a partial counts once,
    // not once per page that includes it).
    const sourceCss = walk(path.join(ROOT, "css"), ".css").map((f) => ({ f, css: stripComments(read(f)) }));
    const templateTexts = templates.map((f) => ({ f, t: read(f) }));
    for (const { f, t } of templateTexts) {
        for (const m of t.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) sourceCss.push({ f, css: stripComments(m[1]) });
    }
    const counts = {
        inlineStyles: templateTexts.reduce((n, { t }) => n + (t.match(/\sstyle\s*=\s*["']/g) || []).length, 0),
        important: sourceCss.reduce((n, { css }) => n + (css.match(/!important/g) || []).length, 0),
        hardcodedColours: sourceCss
            .filter(({ f }) => !f.endsWith(path.join("css", "tokens.css")))
            .reduce((n, { css }) => n + (css.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g) || []).length, 0),
    };

    return { undefinedClasses, unusedClasses, unlayered, counts, used };
}

function main() {
    const result = check();
    const current = {
        undefined: result.undefinedClasses,
        unused: result.unusedClasses,
        counts: result.counts,
    };

    const baseline = fs.existsSync(BASELINE)
        ? JSON.parse(read(BASELINE))
        : { allow: {}, known: { undefined: [], unused: [] }, counts: {} };

    if (process.argv.includes("--update")) {
        const allow = baseline.allow || {};
        const next = {
            "//": "Written by tools/check-css.js --update. 'allow' is edited by hand: classes that are intentional, with the reason. 'known' and 'counts' are today's debt, which may only shrink.",
            allow,
            known: {
                undefined: current.undefined.filter((c) => !(c in allow)),
                unused: current.unused.filter((c) => !(c in allow)),
            },
            counts: current.counts,
        };
        fs.writeFileSync(BASELINE, JSON.stringify(next, null, 2) + "\n");
        console.log(`check-css: baseline updated (${next.known.undefined.length} undefined, ${next.known.unused.length} unused; counts ${JSON.stringify(next.counts)}).`);
        return;
    }

    const allow = baseline.allow || {};
    const known = baseline.known || { undefined: [], unused: [] };
    const errors = [];
    const stale = [];

    const newUndefined = current.undefined.filter((c) => !(c in allow) && !known.undefined.includes(c));
    for (const c of newUndefined) {
        errors.push(`class "${c}" is used but has no CSS rule and no script refers to it (${[...result.used.get(c)].slice(0, 3).join(", ")})`);
    }
    const newUnused = current.unused.filter((c) => !(c in allow) && !known.unused.includes(c));
    for (const c of newUnused) errors.push(`class "${c}" is defined in CSS but nothing uses it`);
    for (const r of result.unlayered) errors.push(`CSS outside a layer: ${r}`);
    for (const [k, v] of Object.entries(current.counts)) {
        const was = (baseline.counts || {})[k];
        if (was !== undefined && v > was) errors.push(`${k} went up from ${was} to ${v}`);
        if (was !== undefined && v < was) stale.push(`${k} went down from ${was} to ${v}`);
    }
    for (const c of known.undefined) if (!current.undefined.includes(c)) stale.push(`"${c}" is no longer undefined`);
    for (const c of known.unused) if (!current.unused.includes(c)) stale.push(`"${c}" is no longer unused`);

    if (stale.length) {
        console.log(`check-css: ${stale.length} improvement(s) since the baseline. Run "npm run css:baseline" so they cannot come back:`);
        for (const s of stale) console.log("  + " + s);
    }
    if (errors.length) {
        console.error(`check-css: ${errors.length} problem(s):`);
        for (const e of errors) console.error("  - " + e);
        console.error('Fix them, or if one is intentional, add the class to "allow" in tools/css-baseline.json with the reason.');
        process.exit(1);
    }
    console.log(`check-css: OK (known debt: ${known.undefined.length} undefined, ${known.unused.length} unused classes; ${Object.entries(current.counts).map(([k, v]) => `${k} ${v}`).join(", ")}).`);
}

main();
