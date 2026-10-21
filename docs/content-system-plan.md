# Content system plan

Status: built on branch `content-system` (2026-10-21), one commit per item; not merged. See "As built" at the end for where the build differs from this plan. Builds on [agent-readiness.md](agent-readiness.md), sections 1, 3 and 4, which proposed these items. This document checks them against the code as it is on `main` (bcb8192) and against current documentation, and fixes the approach for each.

Readers: Frederik, and whoever builds phase 3. The marketing agent reads CLAUDE.md and the briefs, not this file.

**Assumptions** (no questions asked in phases 1–2; correct any of these before go):

- New articles are Markdown; the 11 existing ones are converted too, as long as their built HTML stays identical (section 3).
- Existing and agent-written articles stay attributed to the organisation. A personal author (Frederik, linked to `om.html`) is available but only used where you set it.
- Of the six jobs, only the two Rengøringsassistent jobs (deltid and fuldtid) are open (Frederik, 2026-10-21). The other four go into `jobs.json` with `published: false`: off the page, no job page, text kept for later. The open ones get `datePosted` = the day the jobs PR is merged, and no `validThrough`, unless you give real dates. All text is copied word for word, open decisions included.
- The two existing cases stay anonymised and are exempt from the new `sources` rule by name; every new case must list sources.
- One Formspree endpoint stays; it moves into `_data/site.json` as `formEndpoint`.
- Size ceilings (section 2.3) are starting values. Too tight means the agent splits a PR, not that the ceiling is raised by the agent.
- Versions are pinned exactly as of today: sharp 0.35.5, zod 4.6.7. Eleventy stays on ^3.1.5 (3.1.7 is available; a separate bump).

---

## 1. What is there today

### Articles

- 11 articles in `pages/facility/indblik/artikler/<category>/<slug>.html`, in 5 category folders: indsigt (3), tips (3), innovation (2), baeredygtighed (1), cases (2). Plus `_article-template.html`, which `.eleventyignore` excludes (`pages/**/artikler/_*.html`).
- Front matter, identical field set in all 11: `layout: base.html`, `title`, `description`, `articleTitle`, `publishDate` (Danish text, "15. december 2024"), `readTime`, `image`, `imageAlt`, `excerpt`. No author, no ISO date, no case fields.
- `artikler.11tydata.js` adds to every article:
  - `tags: ["artikel"]`, which makes `collections.artikel`
  - a fallback `image`/`imageAlt` (`/images/article/ipad.webp`) and the computed `imageIsFallback` (photo inventory)
  - `categoryKey` and `category` (label) from the folder name, through a fixed `CATEGORIES` map; an unknown folder throws
  - `sortDate`: `publishDate` parsed by hand (`parseDate`, Danish month names)
  - `jsonLd`: schema.org `Article`, `datePublished` as a date without time, author and publisher both the organisation (`@id` `/#organization`), `image` the article photo. `base.html` prints `jsonLd` instead of the site-wide `ProfessionalService` block.
- **Copied layout markup.** Each article carries about 40 lines of shell: `{% include "article-header.html" %}`, the `article-content` section, container, `content-layout`, `main-content`, the hero `<img>` (with `fetchpriority="high"`, `decoding="async"`, width/height from the `imgWidth`/`imgHeight` filters and the `data-photo-slot="artikel-{{ page.fileSlug }}"` marker), the `article-excerpt` box, the `article-body` div, then the share, sidebar and footer includes. Diffing that shell across all 11 files against the template: **identical in every article**; the only difference is one HTML comment, which htmlmin removes. So the shell can move into a layout with no per-article exceptions.
- **The excerpt is written twice.** Front matter `excerpt` feeds the cards; the body has its own copy in `<div class="article-excerpt">`. In 10 articles the two are the same text. In `indsigt/systematik-vs-talent.html` they differ (front matter 177 characters, body 215: the body adds "Men virkeligheden er, at … og dokumentation").
- **Bodies.** Only `p`, `h2`, `h3`, `ul`, `ol`, `li`, `strong`, `em`, `br`, `blockquote` and `div.callout` / `div.callout.callout--success`. No template tags, scripts or inline styles inside any body. Blockquotes are `"text"<br><em>- source</em>` with no `<p>` inside.
- **Lists and cards** (`_includes/partials/article-cards.njk`): `featuredCard`, `gridCard`, `relatedItem`, all reading `article.data.*`. Nyheder lists `collections.artikel | newestFirst` and picks featured articles by file name (`featured:` in its front matter, through `articleBySlug`, which throws on a missing slug). Indblik shows the newest 3. The sidebar's related list is `relatedArticles` (same category first, then newest). `newestFirst` sorts on `sortDate`.
- **Header** (`_includes/article-header.html`): breadcrumb Forside › Indblik › Artikel (no BreadcrumbList data), category badge, `h1` from `articleTitle`, `publishDate` printed as written, `readTime`.
- **Table of contents**: built in the browser by `js/components.js` from the `h2`/`h3` in `.article-body`.
- **Open Graph**: articles get the site defaults: `og:type` website and the site-wide `og-image.jpg` (with fixed 1200×630 width and height), not the article photo.
- **Sitemap** (`sitemap.njk`, `sitemapPages` filter): `lastmod` is the date of the file's last git commit.

### Cases

The two files in `cases/` are ordinary articles; the folder gives them the "CASE STUDY" label and the `cases` filter. Both are anonymised (no client name). Per CLAUDE.md their numbers stay as Frederik left them.

### Jobs

`pages/facility/indblik/jobs.html` has six hand-written cards (badge Deltid/Fuldtid, `h2` title, location, a paragraph, a "Vi forventer" checklist of four items, a `mailto:` apply button whose subject names the job), then a benefits block and a CTA. Location is `{{ facts.area }}` in four jobs and typed text in two ("København (hybrid)", "København"). No dates, no structured data. `_data/jobs.json` does not exist yet, although CLAUDE.md and `check-paths.js` already list it as editable. The open decisions in the facility brief (driving licence vs. car-free; the handyman job's plumbing and electrical work) sit in this text, so the migration must copy it word for word.

### Images

- 55 files in `images/`, all under the 250 KB / 2000 px limits. Width and height come from `tools/image-size.js` (reads the file header). No pipeline, no `srcset`, no AVIF.
- Article hero: `fetchpriority="high"`, no `loading` (correct for the LCP image). Cards and related thumbnails: `loading="lazy"`, `data-photo-skip`.
- CSS relies on the `<img>` being a direct child in one place: `.main-content > .article-image` (`css/components/article-listing.css:227,241`). Wrapping the hero in `<picture>` would break that rule.
- `tools/photo-inventory.js` runs after the build, reads the `data-photo-*` markers from `_site`, writes `/internal/photos/` and then **rewrites the built pages** to strip the markers. Its "try a candidate" preview swaps an `<img>`'s `src`.
- Photo sources are recorded per slot as candidates in `tools/photo-candidates.json`; nothing records which candidate became which file.

### Forms

Five places post to the same Formspree endpoint, on every deploy preview as on production:

| Where | How |
|---|---|
| `pages/facility/kontakt.html` | `<form action>` |
| `_includes/software/contact-content.njk` (EN and DA pages) | `<form action>` |
| `_includes/software/demo-content.njk` (EN and DA pages) | `<form action>` |
| chatbot callback (`js/components.js`, `submitCallbackRequest`) | `fetch` |
| newsletter (`js/components.js`, `initNewsletterForm`) | `fetch`; on failure opens a `mailto:` |

Today the only protection is the sentence in CLAUDE.md and the PR template checkbox.

### Checks and guards

- `npm run build` = `rm -rf _site && eleventy && check-css && check-content && photo-inventory`. Netlify runs the same. It passes on `main` today (55 files written; 11 articles; content debt 13).
- `check-content.js` checks articles by reading the **source files** with gray-matter (only `*.html` in `artikler/`, skipping `_*`): required fields, the Danish `publishDate` pattern, integer `readTime`, image exists, alt not empty, excerpt 80–220 characters. It also checks built pages (title ≤ 65, description 70–160, duplicates, links and anchors, alt, placeholders), i18n parity, image limits and `facts.json`. Problems are compared with `content-baseline.json`. gray-matter is not a direct dependency; it comes with Eleventy.
- `check-paths.js` (GitHub Action `path-guard`, enforced only when the PR author is `dfmg-bot`, run from the base branch's copy): allow-list of editable paths, images add-only, no deletions. No limit on size. It allows any `.html` under `pages/facility/` (except the policies), so the agent can add new pages, not only articles. It does not allow `.md` anywhere.
- `.claude/agent-settings.json` denies edits to `_includes`, `css`, `js`, `.eleventy.js`, `tools/*.js`, baselines, `docs/**`, `.claude/**` and the read-only data files.
- `check-css.js` counts classes and inline styles in the built HTML and in the source templates under `_includes` and `pages` (`.html` and `.njk`); it skips `artikler/` when it collects page names.

### What would break if changed

| Change | Breaks | Handle by |
|---|---|---|
| Renaming `publishDate` | `artikler.11tydata.js` (`sortDate`, `jsonLd`), `article-header.html`, `check-content.js` (field list and pattern) | change all four in the same commit |
| Article files `.html` → `.md` | `.eleventyignore` (`*.md`, `**/*.md`) skips them; `_data/eleventyComputed.js` only sets `.html` permalinks, so a `.md` article would move to `/slug/index.html`; `check-content.js` and `check-paths.js` only look at `.html`; `sitemap` `lastmod` (git date of the new path) | narrow the ignore, set the permalink in `artikler.11tydata.js`, extend both tools, take `lastmod` from front matter |
| Moving the shell into a layout | `layout: base.html` in each article's front matter overrides a directory-data layout | remove that line from all 11 |
| `articleBySlug`, `featured:` | throws on an unknown file name | file names stay the same |
| Wrapping images in `<picture>` | `.main-content > .article-image`; the inventory's `src` swap | use `srcset` on the existing `<img>` instead |
| Job detail pages from a `.njk` pagination template | `_data/eleventyComputed.js` returns `filePathStem + ".html"` for `.html` inputs only; a `.njk` template keeps its own `permalink` | write the template as `.njk` |
| New files under `pages/` | `check-css` page-name list reads `pages/**/*.html` file names | job pages are generated, not files under `pages/`, so no new page words |
| Anything in `check-paths.js` | the Action runs the **base** branch's copy, so a new rule only applies to PRs opened after it is merged | merge the guard change before the agent's first article PR |
| `photo-inventory.js` strips markers from `_site` after the build | a built-output diff taken before it runs differs from the final output | diff the output of the full `npm run build` |

---

## 2. Chosen approach per item

### 2.1 Article layout; front matter plus body; excerpt from front matter

**Options**

| | Body format | For | Against |
|---|---|---|---|
| A | HTML body, shell moved to a layout | No conversion; zero risk to the 11 | The agent still writes tags and classes; it can invent classes (check-css catches undefined ones, not wrong ones); noisy diffs |
| B | Markdown body (markdown-it, as Eleventy ships it), callouts through a paired shortcode | Little markup to get wrong; readable diffs; the shortcode limits callouts to the two variants that exist; `{{ facts.* }}` still works because Markdown is preprocessed with Nunjucks (`markdownTemplateEngine: "njk"` is already set) | The 11 have to be converted and proven identical; `.eleventyignore` and the permalink rule need changes |
| C | Markdown with `markdown-it-container` (`::: callout`) or `markdown-it-attrs` (`{.callout}`) | Pure Markdown syntax | One more dependency each; container has had no release since 2023; attrs lets the agent put any class on any element, which is what we want to prevent |

**Chosen: B.** One layout, Markdown bodies, callouts as `{% callout %}…{% endcallout %}` and `{% callout "success" %}…{% endcallout %}`. The shortcode emits `<div class="callout">`, a blank line, the content, a blank line and `</div>`; markdown-it then renders the content as Markdown inside the HTML block, which gives exactly today's `<div class="callout"><p>…</p></div>`. An unknown variant throws. Raw HTML stays allowed (`html: true` is Eleventy's default), so a conversion that can't be expressed in Markdown keeps that block as HTML. The layout also works for `.html` bodies, so an article that can't be converted identically stays HTML without blocking the rest.

**Files**

- `_includes/layouts/article.njk` (new): front matter `layout: base.html`; contents are today's shell: header include, section/container/content-layout/main-content, the hero `<img>` with its photo-slot attributes, `<div class="article-excerpt">{{ excerpt }}</div>`, `<div class="article-body">{{ content | safe }}</div>`, share, sidebar and footer includes. The `article-header.html`, `article-share.html` and `article-footer.html` includes stay where they are.
- `artikler.11tydata.js`: add `layout: "layouts/article.njk"`; add `eleventyComputed.permalink` = `filePathStem + ".html"` (so a `.md` article keeps its URL; `_data/eleventyComputed.js` only covers `.html`).
- `.eleventy.js`: `addPairedShortcode("callout", …)`.
- `.eleventyignore`: replace `*.md` and `**/*.md` with explicit entries: `CLAUDE.md`, `docs/`, `.github/`, `_assets-unused/`, `scaffolds/`. Negation (`!pattern`) is not supported by Eleventy, so a narrow list is the only way. Verify: the build still writes the same 55 files, and nothing new.
- The 11 articles: `.html` → `.md`, `layout:` line removed, wrapper and in-body excerpt removed, body converted (section 3).
- `systematik-vs-talent`: keep the front matter excerpt (177 characters, what the cards already show). The article page's excerpt box becomes that text; this is the one intended visible change.
- Delete `_article-template.html` (replaced by `scaffolds/article.md`, item 2.6).
- `check-content.js`: article files are `*.md` or `*.html` (its article front-matter checks move to the schema in 2.7). `check-paths.js`: allow `pages/facility/indblik/artikler/**/*.md`.

### 2.2 ISO dates, Danish display, author, structured data

**Dates.** `date: 2024-12-15` in front matter: Eleventy's own field, which sets `page.date` and the default collection order. A YAML date without time is midnight UTC, so the display filter formats in UTC, or a Danish reader sees the right date while the build machine's time zone could shift it by a day (the Eleventy dates page warns about exactly this). The dates must always be explicit: without `date`, Eleventy falls back to the file's creation time, which resets on CI, so the schema makes `date` required. `git Last Modified` is not used: it is slow, and a layout refactor would count as an edit.

- Filter `danishDate`: `Intl.DateTimeFormat("da-DK", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })`. Checked on Node 24/25: `2024-12-15` → "15. december 2024", the exact text the header prints today. No Luxon needed.
- Filter `isoDate` (`YYYY-MM-DD`, UTC) for JSON-LD and the sitemap.
- Optional `updated:` (ISO), only for a real content revision. It feeds `dateModified` and the sitemap's `lastmod`.
- `sortDate`, `parseDate` and `MONTHS` go; `newestFirst` sorts on `page.date`. Ties (same date) keep today's tie-break by sorting on the input path second.

**Author.** `_data/authors.json` (read only for the agent, like `site.json`):

```json
{
  "dfmg":     { "type": "Organization", "name": "DFMG", "url": "https://dfmg.dk" },
  "frederik": { "type": "Person", "name": "Frederik Vagner Pedersen", "url": "https://dfmg.dk/pages/facility/indblik/om.html" }
}
```

Front matter `author: dfmg` (the default from the directory data); an unknown key fails the schema. Google recommends `Person` for people and `Organization` for organisations, with `author.url` pointing to a page that identifies the author: `om.html` already does for Frederik, and his name is already public there. The header shows the author only when it is a person ("Af Frederik Vagner Pedersen"), so the 11 articles look the same.

**JSON-LD.** Keep `@type: Article` (Google treats Article, BlogPosting and NewsArticle the same; changing it gains nothing). Changes:

- `datePublished` from `date`, `dateModified` from `updated` or `date`. Both stay as dates without time, which schema.org allows; adding a made-up time of day would be invented data.
- `author` from `authors.json`; `publisher` stays the organisation `@id`.
- Wrap in `@graph` with a `BreadcrumbList` matching the visible breadcrumb: Forside (`/`) → Indblik (`/pages/facility/indblik/nyheder.html`) → the article title (last item without `item`, which Google allows).
- `image`: the article photo, as now. Google suggests several aspect ratios at 50K pixels or more; ours is one photo, which is fine.

**Open Graph** (small `base.html` change): articles set `og.type: article` and `og.image` to the article photo; `base.html` prints `og:image:width/height` from the image (the `imgWidth`/`imgHeight` filters) when `og.image` is set, and the fixed 1200×630 only for the default image. Today every article shares the site image on LinkedIn.

**Sitemap**: `sitemapPages` uses `updated` or `date` for pages that have one (articles, job pages), git otherwise. Without this, the `.html` → `.md` rename would date all 11 articles to the migration day.

### 2.3 Guardrails for agent PRs

**Size ceiling in `check-paths.js`.** After the path checks, when the author is `dfmg-bot`:

| Measure | Ceiling | From |
|---|---|---|
| Changed files | 15 | `git diff --name-status` |
| Changed text lines (added + deleted), excluding images and `photo-candidates.json` | 600 | `git diff --numstat` (binary files report `-`) |
| New images | 6 | status `A` under `images/` |
| New articles (`.md`/`.html` under `artikler/`) | 1 | status `A` |
| New pages anywhere else under `pages/` | 0 | status `A`; the agent writes articles, not new pages |
| Branch name | `content/<area>-<slug>` | `GITHUB_HEAD_REF`, passed in by the workflow |

Message on failure: "split this into several PRs". There is no override label, because the bot can label its own PR. For a bigger change, Frederik opens or takes over the PR; PRs by anyone else are not enforced, as now. Ceilings are constants at the top of the file. One article of 1,200 words in Markdown is about 60–120 lines, so 600 lines leaves room for an article plus its photo record and a small copy fix, not for a rewrite of a page.

The new rules only take effect for PRs opened after the change is on `main`, because the Action runs the base branch's copy. So this item must be merged before the agent's first article PR.

**Forms never submit outside production.** Options:

| | How | Verdict |
|---|---|---|
| A | Only the CLAUDE.md rule and the checkbox (today) | Relies on behaviour; the deploy preview is also opened by people |
| B | Browser check of the hostname (`*.netlify.app`) in JavaScript | Doesn't cover `<form action>` without JS; a hostname list goes stale |
| C | Build-time: the endpoint is written into the output only when `CONTEXT=production` | Netlify sets `CONTEXT` for the build command (`production`, `deploy-preview`, `branch-deploy`, `dev`); a local build has no `CONTEXT` and is treated as non-production, which also protects `npm run preview` |

**Chosen: C, plus a check.**

- `_data/site.json`: `"formEndpoint": "https://formspree.io/f/…"` (a separate, labelled change to a read-only file, made by Frederik).
- `.eleventy.js`: global data `isProduction = process.env.CONTEXT === "production"`. The three `<form action>`s become `action="{{ site.formEndpoint if isProduction else '#preview' }}"`, plus `data-preview-form` outside production. `base.html` puts `preview: true` into `window.DFMG` outside production.
- `js/components.js`: the two `fetch` calls read the endpoint from `window.DFMG.formEndpoint` (set only in production). One capture-phase `submit` listener: when `DFMG.preview`, cancel the submit and show the existing notification "Formularer er slået fra på preview-sider. Intet blev sendt." The newsletter's `mailto:` fallback is skipped on previews too.
- `check-content.js`: outside production, fail if the string `formspree.io` appears anywhere in `_site`; in production, fail if any `<form action>` is an external URL other than `site.formEndpoint`. That also stops a stray form being added to a page.
- Belt and braces, optional (Frederik, in the Formspree dashboard): restrict the form to the `dfmg.dk` domain, if the plan allows it (not verified).
- Netlify already sends `X-Robots-Tag: noindex` on deploy previews, so no robots change is needed.

### 2.4 Photo tool and responsive images

**Photo tool: `tools/photo.js`, `npm run photo`**, with `sharp` pinned exactly (0.35.5) as a dev dependency, so the worker doesn't depend on what is installed on the Mac.

```
npm run photo -- <pexels-page-url | local-file> <section>/<slug> --kind hero|card --slot <slot-id> --alt "…"
```

- Input: a Pexels photo page (it reads the image URL from the page's `og:image`), a direct `images.pexels.com` URL, or a local file. Other hosts are refused.
- Resize to at most 1600 px wide (hero) or 1200 px (card), never upscale; webp at quality 80, stepping down to 70 until the file is under 200 KB; fail if it still isn't, or if it would be over 2000 px on the long edge or 250 KB (the build limits).
- File name: lowercase, æ→ae, ø→oe, å→aa, `[a-z0-9-]` only; refuse to overwrite an existing file (images are add-only).
- Records the source in `tools/photo-candidates.json` under the slot: `"chosen": { "file": "/images/…", "page": "<pexels page>", "photographer": "…", "license": "Pexels", "date": "YYYY-MM-DD" }`. That file is the only place the agent may record it: `images/**` is add-only, so a shared `images/CREDITS.json` would be an edit to an existing file and fail the path guard.
- Prints the result: size, dimensions, and the `<img>` or front matter lines to paste.
- `check-content.js`: every `chosen.file` exists. The inventory shows the source when it has one.

**Responsive images.** Today every card downloads the full 1200–1600 px photo to show it at about 350 CSS px; on Nyheder that is 11 of them.

| | How | Verdict |
|---|---|---|
| A | `@11ty/eleventy-img` 7.1 HTML Transform (the recommended Eleventy way) | Rewrites every `<img>` on the site: new hashed `src`, `<picture>` for AVIF. That breaks `.main-content > .article-image`, the photo inventory (which identifies a photo by its `src` and swaps `src` for candidates), and touches every page's output. v7 is ESM only. Its shortcode form is async, and Nunjucks async shortcodes don't work inside the card macros |
| B | Netlify Image CDN (`/.netlify/images?url=…&w=…`) in `srcset` | No build cost and nothing to store, but without `fm` it prefers WebP over AVIF anyway, it doesn't work under `npm run preview` (only `netlify dev`), and it uses plan credits whose cost per transform we could not verify |
| C | Own small step: a synchronous `srcset` filter plus generation with the same `sharp` | Keeps the original `src` (inventory, link check and `imgWidth` keep working), no `<picture>`, works inside macros, only the images that are used |

**Chosen: C, scoped to the article hero, the three card macros and nothing else.**

- `tools/responsive.js`: `srcset(src)` returns `/img/<name>-480.webp 480w, /img/<name>-800.webp 800w, /img/<name>-1200.webp 1200w` for the widths smaller than the original, plus the original at its own width; it records `src` in a set. In `eleventy.after`, sharp writes the variants to `_site/img/` (webp quality 75). About 30 images × 3 widths: a few seconds, so no build cache is needed.
- Markup: `srcset="{{ image | srcset }}" sizes="…"` on the existing `<img>`; `src`, `width`, `height`, `loading="lazy"` on cards, and `fetchpriority="high"` with no `loading` on the hero (the LCP image) stay as they are. The `sizes` values are measured in phase 3 from the real layout at 390, 768 and 1280 px, not guessed.
- AVIF is left out: it needs `<picture>` (or content negotiation), and the CSS and the inventory depend on the bare `<img>`. Revisit when those change.
- `check-content.js` already checks `src`/`href`; extend it to the `srcset` URLs.

### 2.5 Jobs as `_data/jobs.json` with JobPosting

Google's rules decide the shape: JobPosting markup goes only on a page for **one** job, never on a list page; required fields are `title`, `description`, `datePosted`, `hiringOrganization`, `jobLocation`; an expired job must lose the markup or the page (or carry a past `validThrough`), and a stale posting can lead to a manual action. Denmark is a supported country; support for Danish-language postings isn't documented either way.

**Options**: (A) list page only, no structured data: simple, but no Google job search; (B) list page plus JobPosting on the list page: against Google's rules; (C) list page plus one generated page per job with JobPosting. **Chosen: C.**

**File** (`_data/jobs.json`, shaped so the ERP can write it later):

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-10-21T10:00:00Z",
  "jobs": [
    {
      "id": "rengoeringsassistent-deltid",
      "published": true,
      "title": "Rengøringsassistent",
      "employmentType": "PART_TIME",
      "location": { "label": "{{ facts.area }}", "locality": "København", "postalCode": "2200", "country": "DK" },
      "summary": "Vi søger en rengøringsassistent til deltidsarbejde. …",
      "requirements": ["Interesse for rengøringsarbejde", "…"],
      "datePosted": "2026-10-28",
      "validThrough": null,
      "applySubject": "Ansøgning: Rengøringsassistent (deltid)"
    }
  ]
}
```

- `employmentType` uses Google's values (`FULL_TIME`, `PART_TIME`, …); the badge text (Fuldtid/Deltid) is derived from it.
- `location.label` is what the card shows. It may be `{{ facts.area }}`, which the template renders, so the area is never typed out; `locality`/`postalCode`/`country` feed `jobLocation`. The office address is used where a job has no single site.
- No `baseSalary`: we have no approved figures, and it's only recommended.
- `published: false` and a `validThrough` in the past hide a job at build time: it disappears from the list and its page is no longer built (404).
- The envelope (`schemaVersion`, `generatedAt`) lets the ERP replace the whole file in one PR; `id` is stable across exports.

**Files**

- `pages/facility/indblik/jobs.html`: the six cards become one loop over the live jobs; the benefits and CTA sections stay as they are. "Ingen ledige stillinger lige nu" when the list is empty.
- `pages/facility/indblik/jobs/job.njk` (new, `.njk` so its own `permalink` applies): `pagination: { data: jobs.jobs, size: 1, alias: job }` over the live jobs, `permalink: /pages/facility/indblik/jobs/{{ job.id }}.html`. Content: the same card content on its own page, existing classes only (`intro`, `card`, `checklist`, `btn`), a "Tilbage til stillinger" link, and `jsonLd` = JobPosting (`description` is the summary plus the requirements as an HTML list; `hiringOrganization` is the organisation `@id`; `directApply: false`, since applying is by email) plus a BreadcrumbList.
- Each card's title links to its page; "Ansøg nu" stays a `mailto:`.
- The job pages are not files under `pages/`, so check-css's page-name list doesn't change.
- Expiry only takes effect when the site is rebuilt. Optional: a daily Netlify build hook from a scheduled GitHub Action (Frederik's, since `.github/` is out of the agent's scope). Until then, a job with a `validThrough` drops out at the next deploy.

### 2.6 Scaffolds and `npm run new`

- `scaffolds/article.md`: every front matter field with a one-line Danish comment, and a body outline following the facility brief: intro that names the problem, three to five `##` sections, a practical list, a closing line to Kontakt, and one `{% callout %}` example. In Danish, because the agent copies it.
- `scaffolds/case.md`: the article fields plus `client`, `clientConsent`, `sources`, and the outline udgangspunkt → løsning → resultat (with source) → citat (only if real and approved).
- `scaffolds/job.json`: one job object.
- `npm run new -- article <category> <slug>` / `-- case <slug>` (`tools/new.js`): checks the category against the folder list, makes the slug ASCII and lowercase, refuses an existing file, copies the scaffold and fills in `date` with today and `author: dfmg`. `npm run new -- job <id>` prints the object to paste into `jobs.json`.
- `scaffolds/` is ignored by Eleventy, not editable by the agent (outside the content paths, and added to `agent-settings.json`), and the schema check doesn't see it.

### 2.7 Case fields and front matter schema

**Options**

| | Where | Verdict |
|---|---|---|
| A | Hand-written checks in `check-content.js` (today) | Runs after the whole build; reads the source file again with gray-matter (an undeclared dependency); every rule is custom code |
| B | Ajv 8 + JSON Schema files | Language-neutral, so the ERP could use it; but YAML dates arrive as JS `Date` objects, which JSON Schema doesn't know, and conditional rules (`if/then`) are clumsy to read |
| C | zod 4 in `eleventyDataSchema` (Eleventy 3's own hook) | The documented Eleventy way; runs on the final data after computed values, per page; fails the build with the file path and a readable message (`z.prettifyError`); `z.date()` fits YAML dates; `z.toJSONSchema()` can still export a JSON Schema for the ERP |

**Chosen: C.** zod pinned at 4.6.7.

- `tools/schemas.js` (new, read only for the agent): `articleSchema`, `caseSchema` (extends article), `jobsFileSchema`.
- Article: `title` ≤ 65; `description` 70–160; `articleTitle`; `date` (Date, required); `updated` optional and not before `date`; `readTime` an integer 1–30; `author` a key in `authors.json`; `image` under `/images/` and the file exists; `imageAlt` not empty; `excerpt` 80–220; unknown keys rejected, so a typo like `exerpt` fails instead of being ignored.
- Case (folder `cases/`): `client` optional (a name; leave it out for an anonymised case); `clientConsent` must be `true` whenever `client` is set, otherwise the build fails with "a named client needs clientConsent: true"; `sources`: at least one entry ("ERP-eksport opgaver 2025-02–2025-10", "kundens egne tal, mail 2026-03-02"). The two existing cases are exempt from `sources` by file name, in a list in `tools/schemas.js` that the agent can't edit.
- `sources` and `clientConsent` are not printed on the page. They are the record for review in the PR. Whether consent is real is Frederik's to confirm; the build can only check that someone stated it.
- `artikler.11tydata.js`: `eleventyDataSchema: (data) => (isCase ? caseSchema : articleSchema).parse(pick(data))`, where `pick` takes only the front matter keys (not `page`, `collections` or computed data).
- `jobs.json`: validated by `jobsFileSchema` in `check-content.js`, because global data has no page to hang `eleventyDataSchema` on, and the job pages don't exist when the list is empty.
- `check-content.js`: the article section shrinks to "every file in `artikler/` is `.md` or `.html` and in a known category folder"; the rest lives in the schema. The baseline has no article entries, so nothing in it changes.

### 2.8 What the agent's instructions must say afterwards

**CLAUDE.md**

- Scope: may edit `pages/facility/indblik/artikler/**/*.md` (new articles are Markdown; existing ones too after the migration); new pages elsewhere are not allowed. `_data/jobs.json` is editable; `_data/authors.json` and `scaffolds/` are read only.
- New article: `npm run new -- article <category> <slug>`, then fill in front matter and body. No layout markup, no `layout:` line, no excerpt in the body. Callouts only through `{% callout %}`. Facts as `{{ facts.* }}`, as now.
- Dates: `date: YYYY-MM-DD`, the publication day. `updated:` only for a real content change, never for a typo fix.
- `author: dfmg`, always, unless the task names another author key.
- Cases: `client` only with written consent that the task states; then `clientConsent: true`; `sources` for every number. Without consent: anonymised and no `client`.
- Jobs: edit `_data/jobs.json` only; open decisions stay as they are.
- Images: `npm run photo -- …` instead of the manual conversion steps; it records the source.
- Size: one article per PR; the guard's ceilings, and "split, don't squeeze".
- Forms: they are disabled on previews; the rule "never submit" stays.

**`docs/brief-facility.md`**: "What a good article looks like" points to `scaffolds/article.md` instead of `_article-template.html`, and mentions the callout shortcode and the case fields. **`docs/brief-platform.md`**: unchanged (platform pages aren't articles).

**`.claude/agent-settings.json`**: add `Edit(/scaffolds/**)` and `Edit(/_data/authors.json)` to `deny`.

**`.github/pull_request_template.md`**: "New images: made with `npm run photo`, source recorded"; "Case: client consent and sources stated, or anonymised".

**`tools/check-paths.js`**: the `.md` rule, the size ceilings, the branch name and the no-new-pages rule (2.3).

**`tools/check-content.js`**: the form check (2.3), `srcset` URLs (2.4), the photo `chosen` files (2.4), `jobs.json` (2.5); the article front matter checks move to the schema (2.7).

---

## 3. Migrating the 11 articles

**Front matter**, scripted (`tools/migrate-articles.js`, run once and not committed):

- remove `layout`
- `publishDate: "15. december 2024"` → `date: 2024-12-15`
- add nothing else: `author` comes from the directory data, and the two cases get no `client`

**Body**:

1. Cut everything outside `<div class="article-body">…</div>`, and the excerpt box.
2. Convert the body with `turndown` (run with `npx` from the scratch folder; not a dependency), set up for ATX headings and `-` list markers, with rules that turn `div.callout` and `div.callout.callout--success` into the shortcode and keep `<blockquote>` as raw HTML (today's blockquotes have no `<p>`; Markdown's `>` would add one).
3. Escape check: text containing `*`, `_`, `<`, `{{` or `{%` (none found today) is reviewed by hand.

**Verification, per article and for the whole site:**

1. Before anything changes: `npm run build` on `main`; copy `_site` to the scratch folder as the reference.
2. After each commit: a clean `npm run build`, then a diff script that normalises both trees (splits minified HTML at tag boundaries, ignores the `sitemap.xml` `lastmod` values, which are expected to change) and lists every file that differs, with the changed lines.
3. Expected differences, item by item, and nothing else:
   - 2.1: only `systematik-vs-talent.html` (the excerpt box text).
   - 2.2: articles' JSON-LD (`@graph`, `dateModified`, breadcrumb), `og:type`/`og:image` on articles, sitemap `lastmod` for articles. The visible header text must be identical.
   - 2.4: `srcset`/`sizes` attributes on the hero and cards; new files under `_site/img/`.
   - 2.5: `jobs.html` shows only the two open jobs (the other four are unpublished); the two remaining cards are identical apart from the title links; two new job pages.
   - 2.3: on a local build, form actions become `#preview` (expected); with `CONTEXT=production npm run build`, identical to `main` apart from the inline `window.DFMG` object.
4. Visual check of three articles (a long one, one with an `ol`, one case) at 390 and 1280 px with `npm run check:layout`, and the TOC still lists the same headings.
5. If an article can't be made identical, it stays `.html` (front matter plus HTML body, layout applied) and the doc records why.

---

## 4. Order, effort, commits

Branch `content-system` from `main`, one commit per item, a clean `npm run build` and the output diff after each. Not pushed.

| # | Commit | Effort |
|---|---|---|
| 1 | Article layout, Markdown bodies, callout shortcode, excerpt from front matter, ignore list, permalink; 11 articles migrated (2.1, 3) | M |
| 2 | ISO `date`, `danishDate`/`isoDate`, `updated`, `authors.json`, JSON-LD with breadcrumb, article Open Graph, sitemap dates (2.2) | S–M |
| 3 | zod schema in `eleventyDataSchema`, case fields and consent rule; article checks moved out of `check-content.js` (2.7) | M |
| 4 | `jobs.json`, list loop, job pages with JobPosting, `jobs.json` schema check (2.5) | M |
| 5 | `npm run photo` (sharp), source recorded; `srcset` for hero and cards (2.4) | M |
| 6 | Size ceilings, branch name and new-page rule in `check-paths.js`; form endpoint from `site.json`, preview guard and form check (2.3) | M |
| 7 | Scaffolds, `npm run new`, `_article-template.html` removed (2.6) | S |
| 8 | CLAUDE.md, briefs, PR template, `agent-settings.json` (2.8) | S |

The order differs from the numbering in the request: the schema (3) comes right after the field changes it validates, jobs reuse it, and the scaffolds come last so they match the final fields. Commit 6 changes `site.json`, which CLAUDE.md asks to keep as a separate, labelled change; it is labelled in its own commit message here, and can be split into its own PR if you prefer.

Total: about two working days, most of it in 1, 4 and 5.

After merge: one dry run with the agent (an article PR from `npm run new`), and a deliberate bad PR (two articles, or a CSS edit) to see the guard fail.

---

## 5. Risks

| Risk | Mitigation |
|---|---|
| Markdown conversion changes an article's HTML in ways that are hard to see (an extra `<p>`, lost `<br>`) | Normalised diff of the built output per article; fall back to an HTML body for that article |
| Nunjucks preprocessing of Markdown: a `{{` or `{%` in copy breaks the build | None in the 11; the agent's text is checked by the build anyway. Eleventy's `{% raw %}` if ever needed |
| `.eleventyignore` narrowed: some `.md` file starts being published | Build file count before and after; `check-content` lists all pages; CLAUDE.md and docs are explicitly ignored |
| `date` at midnight UTC shown a day off | All formatting in UTC (`danishDate`, `isoDate`); verified against today's printed dates |
| The new guard only applies from the base branch | Merge before the agent's first article PR (section 4) |
| A size ceiling blocks a legitimate change | Frederik's PRs aren't enforced; numbers are constants and easy to tune after the first weeks |
| Preview guard depends on `CONTEXT`; if Netlify stopped setting it, production would ship without a form endpoint | The production form check in `check-content.js` fails the production build when an action isn't the endpoint, so it fails loudly, not silently |
| `sharp` is a native module (Mac worker, Linux on Netlify and Actions) | Prebuilt binaries for both; pinned exactly; `npm ci` on Netlify as now |
| Job postings stay up after `validThrough` until the next deploy | `validThrough` is in the JSON-LD so Google drops them itself; optional daily build hook |
| Google may not show Danish-language JobPostings | No cost: the pages are useful without the rich result |
| The job migration resolves an open decision by accident (driving licence, handyman plumbing/electrical) | Text copied word for word; the diff of `jobs.html` shows only markup changes |
| `photo-inventory` rewrites built HTML after Eleventy | All output diffs are taken after the full `npm run build` |
| Consent can't be verified by a build | The build enforces that consent is stated; the PR template asks for its source; merging is the review |

---

## 6. Sources

- Eleventy: data validation (`eleventyDataSchema`, v3.0+): https://www.11ty.dev/docs/data-validate/ ; runs after computed data, per `src/TemplateMap.js` in 3.1.5 (`runDataSchemas`)
- Eleventy: dates (YAML dates are UTC; `git Last Modified`; creation dates reset on CI): https://www.11ty.dev/docs/dates/
- Eleventy: collections sort by date: https://www.11ty.dev/docs/collections/
- Eleventy: layout chaining: https://www.11ty.dev/docs/layout-chaining/ ; directory data: https://www.11ty.dev/docs/data-template-dir/
- Eleventy: Markdown defaults (`html: true`, indented code disabled): https://www.11ty.dev/docs/languages/markdown/
- Eleventy: ignores (no negation patterns): https://www.11ty.dev/docs/ignores/
- Eleventy Image 7.1 (HTML Transform, ESM, Node 22+): https://www.11ty.dev/docs/plugins/image/
- Google: Article structured data: https://developers.google.com/search/docs/appearance/structured-data/article
- Google: JobPosting (single-job pages only, required fields, expiry, supported countries): https://developers.google.com/search/docs/appearance/structured-data/job-posting
- Google: BreadcrumbList: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- web.dev: responsive images: https://web.dev/learn/images/descriptive ; lazy loading: https://web.dev/articles/browser-level-image-lazy-loading ; LCP: https://web.dev/articles/optimize-lcp ; AVIF: https://web.dev/learn/images/avif
- Netlify: build environment variables (`CONTEXT`): https://docs.netlify.com/build/configure-builds/environment-variables/
- Netlify: deploy previews (`X-Robots-Tag: noindex`): https://docs.netlify.com/deploy/deploy-types/deploy-previews/
- Netlify Image CDN: https://docs.netlify.com/build/image-cdn/overview/
- Ajv (draft 2020-12): https://ajv.js.org/json-schema.html ; zod 4: https://zod.dev/v4
- Versions checked with `npm view` on 2026-10-21: @11ty/eleventy 3.1.7, @11ty/eleventy-img 7.1.0, sharp 0.35.5, markdown-it 15.0.3 (Eleventy 3 bundles 14.1), markdown-it-attrs 5.0.1, markdown-it-container 4.0.0 (2023), ajv 8.20.0, zod 4.6.7

Not verified: whether the Netlify Image CDN works on deploy previews and what it costs per transform; whether Netlify keeps `.cache` without a plugin; a typical AVIF saving figure; Danish-language support in Google job search; whether Formspree's domain restriction is on your plan.

---

## As built (2026-10-21)

Where the build differs from the plan above:

- **Jobs:** only the two Rengøringsassistent jobs are open; the other four are in `jobs.json` with `published: false`. `jobs.json` is validated when the build starts (`eleventy.before` in `.eleventy.js`), not in `check-content.js`: it fails before anything renders, and also when the list is empty. The job page's data and JobPosting live in `pages/facility/indblik/jobs/jobs.11tydata.js`, because Eleventy 3's JS front matter isn't CommonJS. The list uses two columns when there are fewer than three jobs, and the card buttons sit in a `.cluster` (check-layout found them touching).
- **Markdown:** markdown-it writes `"` in text as `&quot;`. The browser shows the same text, so the conversion counts as identical; the diff script treats the two as equal.
- **Photo inventory:** it already removed `srcset` when it tries a candidate, so it needed no change.
- **Article schema:** strictness (unknown keys) is checked against the file's own front matter, values against the merged data, so directory defaults (`author`, the fallback photo) still count. A TODO left in a case's `sources` fails, because `sources` isn't rendered and the placeholder check can't see it.
- **Open jobs' `datePosted`** is 2026-10-21; set it to the merge day.

Verification after each commit: a clean `npm run build`, then a diff of the full `_site` against `main` (or the previous commit). The differences were the expected ones listed in section 3. Also run: check-layout (no touching blocks), browser checks of `srcset` choices, a preview build in which none of the five forms sent anything (all requests to the endpoint counted), and a production build (`CONTEXT=production`) whose forms match `main`.
