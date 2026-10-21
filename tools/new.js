#!/usr/bin/env node
// Start a new article, case or job from scaffolds/.
//
//   npm run new -- article <category> "<name>"   pages/facility/indblik/artikler/<category>/<name>.md
//   npm run new -- case "<name>"                 pages/facility/indblik/artikler/cases/<name>.md
//   npm run new -- job "<id>"                    a new entry in _data/jobs.json (published: false)
//
// category: indsigt, tips, baeredygtighed or innovation. Names in Danish are
// fine ("Vinduespudsning om vinteren" -> vinduespudsning-om-vinteren). It
// fills in today's date, never overwrites, and the TODO lines it leaves make
// the build fail until they are replaced.

const fs = require("fs");
const path = require("path");
const { slugify } = require("./slug");

const ROOT = path.resolve(__dirname, "..");
const ARTICLES = path.join(ROOT, "pages/facility/indblik/artikler");
const JOBS = path.join(ROOT, "_data/jobs.json");
const CATEGORIES = ["indsigt", "tips", "baeredygtighed", "innovation"];

function fail(message) {
    console.error(`new: ${message}`);
    process.exit(1);
}

// Today in Copenhagen, as 2026-11-03.
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Copenhagen" }).format(new Date());

const fill = (text, values) => text.replace(/__(\w+)__/g, (m, k) => (k in values ? values[k] : m));

function newArticle(kind, category, name) {
    const slug = slugify(name || "");
    if (!slug) fail(`give the ${kind} a name, e.g. npm run new -- ${kind === "case" ? "case" : "article tips"} "Vinduespudsning om vinteren"`);
    const file = path.join(ARTICLES, category, `${slug}.md`);
    const others = fs.readdirSync(ARTICLES, { withFileTypes: true }).filter((d) => d.isDirectory())
        .flatMap((d) => fs.readdirSync(path.join(ARTICLES, d.name)).map((f) => f.replace(/\.\w+$/, "")));
    // File names must be unique across folders: the related-articles box
    // and the photo slots find an article by its file name.
    if (others.includes(slug)) fail(`an article called ${slug} already exists; pick another name`);
    const scaffold = fs.readFileSync(path.join(ROOT, "scaffolds", `${kind}.md`), "utf8");
    fs.writeFileSync(file, fill(scaffold, { DATE: today(), SLUG: slug }));
    const rel = path.relative(ROOT, file);
    console.log(`new: wrote ${rel}`);
    console.log(`\nNext:\n  1. Replace every TODO (the build fails while one is left).`);
    console.log(`  2. Photo: npm run photo -- <pexels-link> "article/<name>" --slot artikel-${slug} --kind hero`);
    console.log(`  3. npm run build, then look at /${rel.replace(/\.md$/, ".html")} with npm run preview.`);
}

function newJob(name) {
    const id = slugify(name || "");
    if (!id) fail(`give the job an id, e.g. npm run new -- job "rengoeringsassistent-deltid"`);
    const jobs = JSON.parse(fs.readFileSync(JOBS, "utf8"));
    if (jobs.jobs.some((j) => j.id === id)) fail(`a job with id ${id} already exists in _data/jobs.json`);
    const job = JSON.parse(fill(fs.readFileSync(path.join(ROOT, "scaffolds/job.json"), "utf8"), { ID: id, DATE: today() }));
    jobs.jobs.push(job);
    jobs.generatedAt = new Date().toISOString().replace(/\.\d+Z$/, "Z");
    fs.writeFileSync(JOBS, JSON.stringify(jobs, null, 2) + "\n");
    console.log(`new: added "${id}" to _data/jobs.json with published: false.`);
    console.log(`\nNext: fill in every TODO, then set "published": true. Facts only from the task; no salary unless given.`);
}

const [kind, a, b] = process.argv.slice(2);
if (kind === "article") {
    if (!CATEGORIES.includes(a)) fail(`category is one of ${CATEGORIES.join(", ")} (cases: npm run new -- case "<name>")`);
    newArticle("article", a, b);
} else if (kind === "case") newArticle("case", "cases", a);
else if (kind === "job") newJob(a);
else fail(`usage: npm run new -- article <${CATEGORIES.join("|")}> "<name>" | case "<name>" | job "<id>"`);
