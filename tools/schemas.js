// Schemas for content the marketing agent writes, checked during the build.
// Articles and cases: eleventyDataSchema in artikler.11tydata.js (the build
// stops at the first bad article and names its file). _data/jobs.json:
// checked when the build starts (.eleventy.js), before anything renders.
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
    // (Not shown on the page, so a TODO left here is caught here.)
    sources: z.array(text(3, 300).refine((t) => !/\bTODO\b/.test(t), "replace the TODO with the real source")).optional(),
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

// ----------------------------------------------------------------- jobs.json
// One file the ERP can write later: an envelope with a version and a time
// stamp, and one object per job with a stable id. Field values follow what
// Google's JobPosting needs (employmentType uses its names).

const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "a date like 2026-11-03")
    .refine((d) => !Number.isNaN(Date.parse(d)), "not a real date");

const job = z.strictObject({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "lowercase a-z, 0-9 and -, e.g. rengoeringsassistent-deltid"),
    published: z.boolean(),
    title: text(3, 60),
    employmentType: z.enum(["FULL_TIME", "PART_TIME", "TEMPORARY", "CONTRACTOR", "INTERN", "OTHER"]),
    location: z.strictObject({
        // What the card shows; leave it out to show facts.area.
        label: text(2, 60).optional(),
        streetAddress: text(2, 100),
        postalCode: z.string().regex(/^\d{4}$/, "a Danish postal code"),
        locality: text(2, 60),
        country: z.literal("DK"),
    }),
    // Also the page's meta description, hence 70-160.
    summary: text(70, 160),
    requirements: z.array(text(3, 120)).min(1).max(10),
    datePosted: isoDay,
    validThrough: isoDay.nullable(),
    applySubject: text(5, 100),
}).refine((j) => !j.validThrough || j.validThrough >= j.datePosted, { message: "validThrough is before datePosted", path: ["validThrough"] });

const jobsFile = z.strictObject({
    "//": z.string().optional(),
    schemaVersion: z.literal(1),
    generatedAt: z.iso.datetime(),
    jobs: z.array(job),
}).refine((f) => new Set(f.jobs.map((j) => j.id)).size === f.jobs.length, { message: "two jobs have the same id", path: ["jobs"] });

// _data/jobs.json -> throws with a readable message.
function validateJobsFile(json) {
    const result = jobsFile.safeParse(json);
    if (!result.success) throw new Error("_data/jobs.json:\n" + z.prettifyError(result.error));
}

// The jobs to show: published and not past validThrough (by the build day).
const liveJobs = (json, today = new Date().toISOString().slice(0, 10)) =>
    json.jobs.filter((j) => j.published && (!j.validThrough || j.validThrough >= today));

module.exports = { validateArticle, validateJobsFile, liveJobs };
