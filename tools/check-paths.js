#!/usr/bin/env node
// Path guard for the marketing agent's pull requests (see CLAUDE.md, "Scope").
// Fails when a PR changes a file outside the content paths, changes or
// deletes an existing image, deletes or renames anything at all, adds a page
// that is not an article, is bigger than the limits below, or comes from a
// branch not named content/<area>-<slug>.
//
//   node tools/check-paths.js [base]     base defaults to origin/main
//
// The GitHub Action .github/workflows/path-guard.yml runs it on every PR, but
// only enforces it when the PR's author is the agent (AGENT below); other PRs
// pass with a note. It runs the copy of this file from the base branch, so a
// PR cannot loosen the rules it is checked against.

const { execFileSync } = require("child_process");

const AGENT = "dfmg-bot";

// Content the agent may add or edit. Everything else is off limits.
const EDITABLE = [
    /^index\.html$/,
    /^pages\/facility\/(?!components\/[^/]*politik\.html$).+\.html$/,
    /^pages\/facility\/indblik\/artikler\/.+\.md$/,
    /^pages\/software\/.+\.html$/,
    /^_data\/i18n\/[^/]+\.json$/,
    /^_data\/(jobs|faq)\.json$/,
    /^tools\/photo-candidates\.json$/,
];
// May be added, never changed or deleted.
const ADD_ONLY = [/^images\/.+\.(webp|jpe?g|png)$/];
// New files under pages/ are articles, nothing else.
const ARTICLE = /^pages\/facility\/indblik\/artikler\/[^/]+\/[^/]+\.(md|html)$/;
const PAGE = /^(pages\/.+|index)\.html$/;

// One topic per PR. A bigger change is several PRs, not a higher limit.
const LIMITS = {
    files: 15,           // changed files
    lines: 600,          // added + deleted lines, not counting images and photo-candidates.json
    newImages: 6,
    newArticles: 1,
};
const NOT_COUNTED = [/^images\//, /^tools\/photo-candidates\.json$/];
const BRANCH = /^content\/[a-z0-9]+(-[a-z0-9]+)+$/;

function main() {
    const author = process.env.PR_AUTHOR;
    if (author && author !== AGENT) {
        console.log(`check-paths: PR by ${author}, not ${AGENT}; nothing to enforce.`);
        return;
    }
    const base = process.argv[2] || "origin/main";
    const out = execFileSync("git", ["diff", "--name-status", "--no-renames", `${base}...HEAD`], { encoding: "utf8" });
    const changes = out.split("\n").filter(Boolean).map((line) => {
        const [status, file] = line.split("\t");
        return { status: status[0], file };
    });

    const errors = [];
    for (const { status, file } of changes) {
        if (status === "D") errors.push(`${file}: deleted. Removals are a request in the PR description, not part of the PR.`);
        else if (ADD_ONLY.some((r) => r.test(file))) {
            if (status !== "A") errors.push(`${file}: existing images are never changed; add a new file instead.`);
        } else if (!EDITABLE.some((r) => r.test(file))) errors.push(`${file}: outside the content paths in CLAUDE.md.`);
        else if (status === "A" && PAGE.test(file) && !ARTICLE.test(file)) errors.push(`${file}: a new page. The agent adds articles (artikler/<category>/<slug>.md), not pages.`);
    }

    // Size. Binary files show "-" in --numstat.
    const numstat = execFileSync("git", ["diff", "--numstat", "--no-renames", `${base}...HEAD`], { encoding: "utf8" });
    const lines = numstat.split("\n").filter(Boolean).reduce((n, line) => {
        const [added, deleted, file] = line.split("\t");
        if (added === "-" || NOT_COUNTED.some((r) => r.test(file))) return n;
        return n + Number(added) + Number(deleted);
    }, 0);
    const added = changes.filter((c) => c.status === "A");
    const size = {
        files: changes.length,
        lines,
        newImages: added.filter((c) => ADD_ONLY.some((r) => r.test(c.file))).length,
        newArticles: added.filter((c) => ARTICLE.test(c.file)).length,
    };
    for (const [k, limit] of Object.entries(LIMITS)) {
        if (size[k] > limit) errors.push(`too big: ${size[k]} ${k} (at most ${limit}). Split this into several PRs, one topic each.`);
    }

    // Branch name: from the workflow (HEAD_REF), or the checked-out branch.
    const branch = process.env.HEAD_REF || execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { encoding: "utf8" }).trim();
    if (!BRANCH.test(branch)) errors.push(`branch "${branch}": name it content/<area>-<slug>, e.g. content/artikel-vinduespudsning-vinter.`);

    if (errors.length) {
        console.error(`check-paths: ${errors.length} problem(s) in this agent PR:`);
        for (const e of errors) console.error("  - " + e);
        process.exit(1);
    }
    console.log(`check-paths: OK (${size.files} file(s), ${size.lines} line(s), ${size.newImages} new image(s), ${size.newArticles} new article(s); branch ${branch}).`);
}

main();
