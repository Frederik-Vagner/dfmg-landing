// Schemas for content the marketing agent writes, checked during the build.
// Articles and cases: eleventyDataSchema in artikler.11tydata.js (the build
// stops at the first bad article and names its file). _data/jobs.json:
// tools/check-content.js.
//
// A field the schema doesn't know fails too, so a typo such as "exerpt" is
// caught instead of silently ignored.

const fs = require("fs");
const path = require("path");
const { z } = require("zod");
const matter = require("gray-matter");

const ROOT = path.resolve(__dirname, "..");

// The two cases published before sources were required. Every other case
// must say where its numbers come from.
const CASES_WITHOUT_SOURCES = [
    "case-20-procent-omkostningsreduktion-tech-virksomhed",
    "fra-5-leverandoerer-til-en-paalidelig-partner",
];

const text = (min, max) => z.string().trim().min(min, `at least ${min} characters`).max(max, `at most ${max} characters`);
const isoDate = z.date({ error: "an ISO date without quotes, like 2026-11-03" });
const localImage = z.string().regex(/^\/images\/[a-z0-9/._-]+$/, "a path under /images/, lowercase")
    .refine((p) => fs.existsSync(path.join(ROOT, p)), "no such file in images/");

const articleFields = {
    title: text(1, 65),
    description: text(70, 160),
    articleTitle: text(1, 120),
    date: isoDate,
    updated: isoDate.optional(),
    readTime: z.number().int().min(1).max(30),
    author: z.string(), // checked against _data/authors.json below
    image: localImage,
    imageAlt: text(1, 200),
    excerpt: text(80, 220),
};

const caseFields = {
    ...articleFields,
    // The client's name. Leave it out for an anonymised case.
    client: text(1, 120).optional(),
    // true only when the client has agreed in writing to be named.
    clientConsent: z.boolean().optional(),
    // Where each number in the case comes from.
    sources: z.array(text(3, 300)).optional(),
};

const article = z.object(articleFields);
const caseStudy = z.object(caseFields)
    .refine((d) => d.client === undefined || d.clientConsent === true, {
        message: "a named client needs clientConsent: true (written consent from the client); otherwise leave client out",
        path: ["clientConsent"],
    });

// The data Eleventy has for an article -> throws with a readable message.
function validateArticle(data) {
    const slug = data.page.fileSlug;
    const isCase = data.page.filePathStem.split("/").slice(-2, -1)[0] === "cases";
    const fields = isCase ? caseFields : articleFields;

    // Keys in the file's own front matter (not the folder's defaults).
    const own = Object.keys(matter(fs.readFileSync(data.page.inputPath, "utf8")).data);
    const unknown = own.filter((k) => !(k in fields));
    const problems = unknown.map((k) => `✖ "${k}" is not an article field${isCase ? "" : " (client, clientConsent and sources are for cases/ only)"}`);

    const values = Object.fromEntries(Object.keys(fields).filter((k) => data[k] !== undefined).map((k) => [k, data[k]]));
    const result = (isCase ? caseStudy : article).safeParse(values);
    if (!result.success) problems.push(z.prettifyError(result.error));

    if (!data.authors || !data.authors[data.author]) problems.push(`✖ author "${data.author}" is not a key in _data/authors.json`);
    if (data.updated && data.date && data.updated < data.date) problems.push("✖ updated is before date");
    if (isCase && !CASES_WITHOUT_SOURCES.includes(slug) && !(values.sources || []).length) {
        problems.push("✖ sources: a case lists where every number comes from (ERP export, the client's own figures …)");
    }
    if (problems.length) throw new Error(problems.join("\n"));
}

module.exports = { validateArticle };
