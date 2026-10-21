# Agent readiness: dfmg-landing

What should change before a marketing agent (Claude on the Mac worker) edits this site through branches and pull requests, with Netlify deploy previews and approval by merge.

Researched 2026-10-21 against `main` @ 6bfc438. Nothing in the repo was changed for this, apart from adding this file.

Effort: **S** = under an hour, **M** = half a day, **L** = one to two days.

---

## Summary

The codebase is in better shape for an agent than most: one build, existing quality gates (`check-css`), articles that are already a front-matter collection, EN/DA keys in exact parity, no broken internal links, and every `<img>` has an alt. The real gaps are **around** the code, not in it:

1. **Nothing stops the agent from pushing to `main`.** `main` has no protection, no PR has ever been opened, and if the agent uses your GitHub credentials, an "admins can bypass" rule would let it through too. It needs its own GitHub identity.
2. **No written rules.** There is no CLAUDE.md, no project `.claude/settings.json`, and no facility content brief. The platform brief is an asset to-do list, partly stale, and it contains an instruction that would be dangerous for an agent ("write your own testimonial").
3. **"Add one file" is nearly true for articles, but not for jobs.** Each article still carries about 40 lines of copied layout markup, and its excerpt is written twice (already out of sync in one article). Jobs are six hand-written HTML cards.
4. **Checks don't cover content.** The build checks CSS, BEM and heading order, but not front matter, SEO fields, links, alt text, image weight, i18n parity or HTML validity. Today they all happen to pass; nothing keeps them passing.

---

## 1. Content structure

### Findings

| Area | Where the copy lives | Notes |
|---|---|---|
| Cleaning side (`pages/facility/`, `index.html`) | Inline in HTML, about 5,500 lines across 25 pages | Each page has its own bespoke layout. SEO title and description are in front matter. |
| Platform side (`pages/software/`) | `_data/i18n/software*.json` (`en` / `da`), rendered by `_includes/software/*-content.njk` | Page files are 21-line stubs, **but** title, description, `og` and `jsonLd` are duplicated by hand in each EN and DA stub (65 lines on index), outside the i18n files. |
| Shared facts | `_data/site.json` (name, CVR, phone, email, address) | Business facts from the 2026-10-18 fact pass (hours 04–22, phone weekdays 8–16, "fast tilbud inden for 24 timer", start in 1–2 weeks, area "København og omegn") are repeated as literal text in about 22 places. |
| Prices | `js/prisberegner.js` (`RATES`) | The numbers in `prisberegner.html` are initial values that the JS overwrites. |
| Articles and cases | `pages/facility/indblik/artikler/<category>/<slug>.html` | Already `collections.artikel` (`artikler.11tydata.js`). Front matter: `title`, `description`, `articleTitle`, `publishDate` (Danish string, "18. november 2024"), `readTime`, `image`, `imageAlt`, `excerpt`. Category comes from the folder. Cards, related articles and JSON-LD all read from front matter. |
| Jobs | `pages/facility/indblik/jobs.html` | Six hard-coded cards; apply is a `mailto:` with a subject line. No date, no JobPosting structured data. |
| Forms | Formspree `xdkdrqkw` (contact, demo, chatbot callback, newsletter) | `_next` redirects are absolute `https://dfmg.dk/...`. |

Specific problems for an agent:

- **The excerpt is duplicated.** It appears in front matter and again in the body (`<div class="article-excerpt">`). In `indsigt/systematik-vs-talent.html` the two already differ.
- **Every article copies the layout shell.** The section and container markup, the hero `<img>` with its photo-slot attributes, the sidebar, share and footer includes all sit in each article file (see `_article-template.html`). An agent writing a new article has to reproduce that exactly.
- **`publishDate` is free text, parsed by hand.** A typo in the month name becomes an invalid date, which silently gives `NaN-NaN-NaN` in the JSON-LD and mis-sorts the lists. A missing date crashes with an unclear error.
- **No author field.** All 11 articles are attributed to the organisation in JSON-LD.
- **`.eleventyignore` excludes `**/*.md`.** That keeps CLAUDE.md and docs/ off the site, but it also means Markdown article bodies won't build until the rule is narrowed.

### Which model is better for an agent?

For **structured, repeating content** (articles, cases, jobs, FAQ items, testimonials, facts), **data or front matter wins**: fixed fields, checkable by a schema, one file per item, small diffs.

For **bespoke marketing pages**, **copy-in-HTML is fine, even better**. The agent edits text in its visual context, and the existing checks catch broken markup. Moving 5,500 lines of one-language facility copy into JSON would make every edit a key hunt, and the diff would no longer show what changed on the page. The platform side uses JSON because it is bilingual; that reason doesn't apply to the facility side.

**Recommendation:** don't migrate the facility pages wholesale. Pull out only:

1. **Facts** that repeat or must never drift → `_data/facts.json` (hours, response times, service area, founding year, start time, which services go via a partner). Pages reference `{{ facts.hours }}`. This is also what makes "never invent facts" enforceable: the agent may use facts from this file and nothing else.
2. **Jobs** → `_data/jobs.json`.
3. **FAQ** (kontakt.html has 10 items) → `_data/faq.json`, optional and lower priority.
4. **Platform SEO meta** → into the same i18n JSON as the copy (`meta.title`, `meta.description`), so the EN/DA parity check covers it and the stubs stop duplicating it.

### Articles and cases as "add one file"

They are about 80% there. To finish:

- Add a layout `_includes/layouts/article.njk` holding everything that is now copied into each article. The article file becomes front matter plus body only. The body can stay HTML, or become Markdown with `markdownTemplateEngine: "njk"`; that needs a narrower `.eleventyignore` (`/*.md`, `docs/`, `pages/software/CONTENT-BRIEF.md`).
- Render the excerpt from front matter only, and delete the body copy.
- Replace `publishDate: "18. november 2024"` with `date: 2024-11-18` (ISO, Eleventy-native), and add a Danish date filter for display.
- Proposed fields, to be enforced by the content check in section 3:

```yaml
# article
title:        "SEO title | DFMG"       # ≤ 60 chars
description:  "Meta description"       # 70–160 chars
articleTitle: "On-page H1"
date:         2026-11-03
readTime:     5
author:       "DFMG"                   # or a key in _data/authors.json
image:        /images/article/<file>.webp   # must exist
imageAlt:     "Danish, what the photo shows"  # required, not empty
excerpt:      "1–2 sentences for cards"     # 80–220 chars
# case only (folder cases/), extra:
client:       "Anonymiseret: tech-virksomhed, København"  # or real name
clientConsent: true                    # required true if a real name or logo is used
sources:      ["ERP: opgaver 2025-02..2025-10"]  # where every number comes from
```

Cases should stay articles in `cases/` (the filter, cards and URLs already handle that), plus the three extra fields. A case with a client name and `clientConsent` not set to true should fail the build.

### Jobs as `_data/jobs.json`

Yes. Our ERP can produce the same file later (section 6). The jobs page loops over it, and each job also emits schema.org `JobPosting` JSON-LD, which is what Google for Jobs reads.

```json
[
  {
    "id": "rengoeringsassistent-deltid",
    "title": "Rengøringsassistent",
    "employmentType": "PART_TIME",
    "location": "København og omegn",
    "summary": "…",
    "requirements": ["Ansvarsfuldhed og pålidelighed", "…"],
    "datePosted": "2026-10-01",
    "validThrough": "2026-12-31",
    "published": true
  }
]
```

The apply link is built from `site.email` and the job title, as it is now.

Open content issue, still unresolved from the 2026-10 review: several jobs require "Kørekort og egen transport", while the site claims "100% bilfri" service. The agent must not resolve that on its own.

### Templates

- **Article:** `_article-template.html` exists, but it is in English and carries layout markup. Replace it with `scaffolds/article.html` (front matter plus a short Danish body skeleton) once the layout exists.
- **Case:** `scaffolds/case.html`, the article fields plus the case fields, with a body outline: udgangspunkt → løsning → resultat (with source) → citat (only if real and approved).
- **Job:** `scaffolds/job.json`, one object to paste into `jobs.json`.
- Optional: `npm run new -- article tips mit-slug` copies the scaffold into the right folder with today's date (S).

Folder names starting with `_` or a `scaffolds/` folder must be in `.eleventyignore`, as `_*.html` already is.

---

## 2. Rules and guardrails

### CLAUDE.md (none exists)

Proposed content, about one page:

**Scope**

- May edit:
  - `pages/facility/**/*.html` (copy only, not structure or classes)
  - `pages/facility/indblik/artikler/**` (new and edited articles)
  - `_data/i18n/*.json`
  - `_data/jobs.json`
  - `_data/faq.json`
  - `images/**` (add only)
  - `tools/photo-candidates.json`
- Read only: `_data/site.json`, `_data/facts.json` (a change is a separate PR that says so in its title).
- Never touch:
  - `_includes/**` (layouts, partials, chatbot)
  - `css/**` and `js/**` (`js/prisberegner.js` holds the prices)
  - `.eleventy.js`, `tools/**` (except `photo-candidates.json`), `netlify.toml`, `netlify/**`
  - `package*.json`, `sitemap.njk`, `robots.txt`
  - `pages/facility/components/*politik.html` (legal)
  - `_assets-unused/**`, anything under `/internal/`
- Never delete images, pages or articles. A removal is a request in the PR description.

**Facts**

- Never invent prices, discounts, client names, logos, testimonials, quotes, numbers, percentages, certifications, hours, response times or service areas.
- Use only `_data/facts.json` and `_data/site.json`, plus numbers given in the task with a source.
- If a claim needs a number you don't have, write the sentence without it, or leave `<!-- TODO(Frederik): … -->` and list it in the PR.
- Known unbacked numbers already in non-case articles (60%, 98%, 99.5%, "Det er 2023") are not to be copied elsewhere.

**Voice**

- **Cleaning customers (Danish, B2B):** Danish with æ/ø/å, never "oe/aa" in visible text. Address the reader as "I/jer" (the site uses it about 200 times). It uses "du" about 90 times, mostly in jobs, forms and policies; that's fine there. Tone is concrete, calm and practical, with no superlatives that can't be backed.
- **Platform (EN + DA), for owners of cleaning and service companies:** outcome first, then feature. Practitioner voice ("built by people who run a cleaning company"). Every EN change needs the matching DA change in the same PR, and the other way round.
- Open choices for you, because the copy is currently mixed:
  - Title Case in Danish buttons ("Se Alle Funktioner") or normal Danish capitalisation
  - British or American English (the locale is `en_GB`, but the copy has both "color" and "colours")

**Images:** the rules in section 4.

**Branches and PRs**

- Branch names: `content/<area>-<slug>`, for example `content/artikel-vinduespudsning-vinter`, `content/jobs-oktober`, `content/platform-pricing-copy`.
- One topic per PR.
- Run `npm run build` (clean) before pushing. Never push to `main`, never force-push.
- The PR description follows the template (section 5).

Also add a project `.claude/settings.json` with deny rules: `Edit`/`Write` on the never-touch paths, and `Bash(git push*main*)`, `Bash(git push --force*)`. This is defence in depth on the worker; the server-side guard is in section 5.

### Content briefs

- **Platform:** `pages/software/CONTENT-BRIEF.md` exists, but it is a checklist of assets (screenshots, video, metrics), not a brief. It is also partly stale:
  - It suggests reusing client logos from case pages that have since been removed.
  - It says "update all 7 platform pages"; there are 9 per language.
  - Its OG-image section needs re-checking.
  - It tells the reader to "write your own [testimonial] as the first customer". An agent must never do that.

  **Missing:** audience, positioning, voice, approved claims and module list, competitors not to name, and what "Contact us" pricing means.
- **Facility:** no brief at all. **Missing:**
  - The audience (offices, property managers, institutions)
  - The service list and what each includes
  - Approved facts (from the 2026-10-18 fact pass)
  - Open decisions (no-show wording, bilfri vs. driving licence, the handyman job's VVS/el work)
  - Words to avoid, and what a good article looks like

Recommendation: `docs/brief-facility.md` and a rewritten `docs/brief-platform.md`, with CLAUDE.md pointing to both. Keep the asset checklist as `docs/platform-assets.md`.

The repo is **public**, so briefs, CLAUDE.md and PR descriptions are visible to anyone. Don't put anything confidential in them, such as customer names without consent or internal numbers.

---

## 3. Checks

### Today

`npm run build` = `rm -rf _site && eleventy && check-css && photo-inventory`. It runs on Netlify for every deploy.

- **check-css:** undefined and unused classes, unlayered CSS, counts that may only go down (inline styles, `!important`, raw colours, off-scale sizes and spacing), BEM nesting, heading order and one h1 per page.
- **photo-inventory:** writes `/internal/photos/` and `shotlist.csv`, then strips the photo markers from the public pages. It reports; it doesn't fail the build.
- **`articleBySlug`** throws if a featured slug in `nyheder.html` doesn't exist.
- **`check-layout`** (Playwright, touching blocks at 390 and 1280 px) exists but is manual only.
- **htmlmin** only warns and skips the page when the HTML can't be parsed, so broken markup ships unminified without failing.

An ad-hoc audit of a fresh build (54 pages) found:

- 0 broken internal links or anchors
- 0 `<img>` without alt; the empty alts are the logo next to its text and repeated card thumbnails, which is correct
- 0 duplicate titles; one duplicate description (`/` and `services.html`)
- 9 descriptions outside 70–160 characters (privacy, picoline, both tak pages, both demo pages, DA floor-plans)
- EN/DA i18n keys identical in all 9 files

### Proposed additions

| Check | How | Fails build? | Effort |
|---|---|---|---|
| Article and case front matter schema (fields, ISO date, image exists, alt not empty, lengths, case consent) | `tools/check-content.js` on Eleventy data, or a validation in `artikler.11tydata.js` | yes | M |
| Every page has title (≤ 65) and description (70–160); no duplicates | same script, on `_site` | yes (warn-only for the existing 9 at first, baseline like check-css) | S |
| Internal links and `#anchors` resolve; images referenced exist | same script, on `_site` | yes | S |
| `<img>` has alt; non-decorative alt not empty and not English | same | yes | S |
| i18n: every key in `en` exists in `da` and vice versa; no empty strings; no `[X]`/`TODO`/`Lorem` in rendered output | same | yes | S |
| `jobs.json` / `facts.json` schema | same | yes | S |
| Image limits: webp/jpg/png only, ≤ 250 KB, ≤ 2000 px long edge, lowercase ASCII filename | same, on `images/` | yes | S |
| Changed-path guard (agent PRs touch only the allowed paths) | GitHub Action, `git diff --name-only origin/main...` | yes, required check | S |
| HTML validity | `html-validate` on `_site`, a few rules at first (no duplicate ids, valid nesting, no unclosed elements); also make htmlmin parse errors fatal | yes | M |
| Danish and English spelling | `cspell` with `@cspell/dict-da-dk` plus a project word list (DFMG, Picoline, e-Faktura…) | **no**, comment on the PR first; turn on later | M |
| Touching blocks | `check-layout` in a GitHub Action with Playwright | no, report only | S–M |

### Where they run

- **Put the blocking checks in `npm run build`.** Netlify already runs it on every deploy preview. A failed build means a failed deploy-preview check on the PR and no preview link, so a bad PR is red before you open it. It also means the same check runs locally, on the preview and on production. One place, no second CI to keep in sync.
- **GitHub Actions** only for what the Netlify build can't or shouldn't do:
  - the changed-path guard (needs the PR diff)
  - the spell check (noisy at first, so it should comment, not block)
  - `check-layout` (needs a browser)
- Pin Node so the Mac worker, Actions and Netlify build the same way: `.nvmrc` plus `NODE_VERSION` in `netlify.toml`. Nothing is pinned today; the local Node is 25 (S).

---

## 4. Images

### Findings

- 55 files in `images/` (2.9 MB): 50 webp, 2 jpg, 3 png, in folders `article/`, `service/`, `sustainability/`, `people/`, `platform/`, `logos/`. The largest is 189 KB, and most photos are 1280 px wide or less.
- There is no image pipeline: no `eleventy-img`, no `srcset`. Width and height are read from the file by the `imgWidth`/`imgHeight` filters. The conversion and resizing happened outside the repo.
- `_assets-unused/` (9.2 MB) holds originals and unpublished files, including material for a possible future case.
- Stock photos come from Pexels (the licence is noted in `tools/photo-candidates.json`). There is no record of which Pexels photo each file in `images/` came from.
- The photo inventory marks slots with `data-photo-slot`, `data-photo-status` (missing/stand-in) and `data-photo-brief`, or with `{% photoSlot "id", "brief" %}`. HTML comments don't work as markers because htmlmin strips them. Source today has 13 `missing` and 12 `stand-in` markers; that counts template occurrences, not pages.

### How the agent should add an image

1. Prefer an existing photo: check the inventory and `images/`, and reuse only where it fits.
2. If it needs a new photo, pick it from Pexels. Reject photos with:
   - readable foreign-language text
   - a recognisably wrong city
   - face masks or delivery boxes
   - people shown in a bad light, which the licence forbids
3. Convert to **webp, quality about 80, 1600 px wide or less (heroes) or 1200 px (cards and inline), under 200 KB**.
4. Save to `images/<section>/<danish-ascii-slug>.webp`, for example `vinduespolering-stang.webp` (æ→ae, ø→oe, å→aa).
5. Reference it via front matter `image`/`imageAlt`, or as an `<img>` with `width="{{ src | imgWidth }}" height="{{ src | imgHeight }}"`, `loading="lazy"` below the fold, and `decoding="async"`.
6. Alt text in the page's language describes what is in the photo, not the marketing message.
7. Replace the slot's `missing`/`stand-in` marker with a real one, keeping `data-photo-slot`, so the inventory stays right.
8. Record the source: add `"chosen": {"page": "...", "file": "..."}` to the slot in `photo-candidates.json`, or keep an `images/CREDITS.json`.

Needed for this: a small `tools/add-image.js` that resizes, converts and reports size, using `sharp` as a dev dependency, so the agent doesn't depend on whatever is installed on the worker (M).

### Is the photo inventory useful for the agent?

Yes. It is effectively the agent's photo work queue: every slot, its status, a brief and stock candidates. But it only exists in a local build (`_site/internal/photos/index.html` plus `shotlist.csv`); since 2026-10-21 it is never deployed. Have the tool also write `_site/internal/photos/slots.json` (id, page, status, brief, current src, candidates) so the agent can read it without scraping HTML (S).

---

## 5. Netlify and GitHub

### Current state

- The repo is **public**. `main` is unprotected, there are no rulesets, 0 PRs ever, and "delete branch on merge" is off.
- `netlify.toml` has the build command, publish dir and redirects, but no `[context.*]` blocks. The latest commit has no GitHub checks or statuses. Whether Netlify posts deploy-preview checks on PRs can only be confirmed in the Netlify UI or with a first test PR.
- `/internal/` (the photo inventory) is no longer deployed: Netlify builds skip it, and the edge-function login is gone (2026-10-21). No env vars are needed for it.

### Needed

**Netlify** (S):

- Site configuration → Build & deploy → Branches and deploy contexts: Deploy Previews set to "Any pull request against your production branch".
- Branch deploys: "none" or "let me add individual branches". Previews per PR are enough.
- Turn on GitHub PR comments and commit checks, so each PR gets its preview link and a pass/fail check.
- Because the repo is public, set PRs from forks to require approval before Netlify builds them.
- Previews post to the real Formspree form, so a test submission from a preview lands in the real inbox and redirects to dfmg.dk. Tell the agent never to submit forms on previews. Optionally, swap the endpoint per context later.

**The agent's identity** (S, and it matters):

Branch protection with an admin bypass doesn't stop an agent that pushes as you. Give the agent its own GitHub identity: a machine-user account, or a GitHub App with **Write** (not Admin) access to this repo only. Its token is the only one on the worker.

**Branch protection on `main`**, as a ruleset (S):

- Require a pull request before merging. 0 required approvals is fine, since merging is the approval; or 1 if the PR author is the bot, because then you can approve it.
- Require status checks: the Netlify deploy-preview check and the path guard.
- Block force pushes and deletion.
- Bypass list: **Repository admin (you), mode "always"**. Your direct pushes keep working; the agent's don't.
- Also turn on "Automatically delete head branches".

**PR template**, `.github/pull_request_template.md` (S):

```markdown
## What and why
<!-- one or two sentences: what the reader will see differently -->

## Pages
<!-- links to the changed pages on the deploy preview -->

## Facts used
<!-- every number, price, client name or claim, and where it comes from
     (facts.json, the task, ERP export). "None" if no new facts. -->

## Open questions for Frederik
<!-- TODOs left in the copy, wording choices -->

## Checklist
- [ ] `npm run build` passes locally (clean build)
- [ ] EN and DA both changed (platform pages)
- [ ] New images: webp, < 200 KB, alt text, source noted
- [ ] Only content paths changed
```

---

## 6. Links to the ERP

The platform (Django, per the brief) already holds most of what the site states by hand.

| Feed | What it could contain | Value |
|---|---|---|
| **Jobs** | Open positions from HR: title, type, area, summary, requirements, posted and closing dates, published flag | High, and the easiest. It replaces hand-edited cards and gives `JobPosting` SEO. |
| **Facts and metrics** | Completed tasks, no-shows, active clients, employees, years in operation | High. The platform brief's missing metrics and the facility no-show line become sourced, dated numbers. |
| **Cases** | Per client with consent: period, scope, task counts, quality-check results, before/after photos from task uploads, approved quote | Medium. It needs a consent flag stored in the ERP. |
| **Prices** | Rates the price calculator uses, from the same model the offer builder uses | Medium. It keeps the calculator and offers in sync, but it needs a JS change, so it's for you, not the agent. |
| **Platform features and changelog** | Module list ("40+ moduler"), release notes | Medium. It feeds the features page and "nyheder". |
| **Testimonials and reviews** | Ratings and comments collected in the client portal, with publish consent | Later. |

**Format:** versioned JSON files in `_data/erp/` (`jobs.json`, `metrics.json`, `cases.json`). Each file carries `schemaVersion`, `generatedAt` (ISO) and per-item `id` and `published`, and is validated by the build check.

**Delivery:** the ERP commits the files to a branch and opens a PR through the same bot identity, so every change is reviewed by merge like the agent's. The alternative, fetching from an ERP API at build time (`@11ty/eleventy-fetch` plus a Netlify build hook), publishes without review. It is only acceptable later, for low-risk feeds like jobs, if you decide to auto-merge those.

---

## Prioritised changes

| # | Change | Effort |
|---|---|---|
| **Before the agent starts** | | |
| 1 | Agent gets its own GitHub identity (machine user or App, Write only) | S |
| 2 | Ruleset on `main`: PR required, Netlify check required, no force push, admin bypass for you; auto-delete branches | S |
| 3 | Netlify: deploy previews on PRs, PR comments and checks on, fork PRs need approval; confirm with one test PR | S |
| 4 | CLAUDE.md (scope, facts, voice, branches, PRs) plus `.claude/settings.json` deny rules | M |
| 5 | Facility brief plus rewritten platform brief, with the stale lines and the "write your own testimonial" instruction removed | M |
| 6 | `_data/facts.json` with the approved facts; replace the about 22 literal repeats | M |
| 7 | `tools/check-content.js` in the build: front matter, SEO fields, links, alt, i18n parity and placeholders, image limits | M |
| 8 | Path-guard GitHub Action (required check) | S |
| 9 | PR template | S |
| 10 | Pin Node (`.nvmrc` plus `NODE_VERSION`) | S |
| **First weeks** | | |
| 11 | Article layout; article files become front matter plus body; excerpt from front matter only (fixes `systematik-vs-talent`) | M |
| 12 | ISO `date` instead of `publishDate` string; `author` field | S |
| 13 | Case fields (`client`, `clientConsent`, `sources`) plus the build rule | S |
| 14 | `_data/jobs.json` plus loop plus `JobPosting` JSON-LD | M |
| 15 | Scaffolds for article, case and job (plus optional `npm run new`) | S |
| 16 | Platform SEO meta moved into the i18n JSON | M |
| 17 | `tools/add-image.js` (sharp) plus photo source recorded per image | M |
| 18 | Photo inventory also writes `slots.json` | S |
| **Later** | | |
| 19 | `html-validate` in the build; htmlmin errors fatal | M |
| 20 | cspell (da and en) as a PR comment, then blocking | M |
| 21 | `check-layout` in a GitHub Action | S–M |
| 22 | ERP → `_data/erp/*.json` via PR, starting with jobs, then metrics | L |
| 23 | Responsive images (`eleventy-img`, `srcset`); not urgent, every photo is under 200 KB | L |

## Before the marketing agent starts

Items 1–10 above, then one dry run:

1. Ask the agent for a small real change (for example, fix the 9 meta descriptions that are too short or too long).
2. Check that it gets a `content/…` branch, a PR in the template format, a Netlify preview link and green checks.
3. Check that a deliberate bad push fails: a direct push to `main` is rejected, and a CSS edit fails the path guard.
4. Merge, and confirm production deploys.

Decisions only you can make, and which the agent should not guess:

- Danish button capitalisation, and British vs. American English on the platform side
- Bilfri vs. driving-licence requirements in jobs
- The no-show wording
- Whether the unbacked percentages in existing articles stay
- Whether ERP feeds may ever auto-merge
