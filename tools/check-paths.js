#!/usr/bin/env node
// Path guard for the marketing agent's pull requests (see CLAUDE.md, "Scope").
// Fails when a PR changes a file outside the content paths, changes or
// deletes an existing image, or deletes or renames anything at all.
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
    }

    if (errors.length) {
        console.error(`check-paths: ${errors.length} file(s) the agent may not change:`);
        for (const e of errors) console.error("  - " + e);
        process.exit(1);
    }
    console.log(`check-paths: OK (${changes.length} changed file(s), all content).`);
}

main();
