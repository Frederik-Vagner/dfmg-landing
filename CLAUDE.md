# dfmg-landing

The public website for dfmg.dk: the cleaning and facility side (Danish) and the DFMG Platform side (English and Danish). Eleventy builds it into `_site/`. Netlify deploys `main` to production and builds a deploy preview for every pull request.

The rules under Scope and Branches are for the marketing agent: sessions on the Mac worker that push as dfmg-bot and start with `claude --settings .claude/agent-settings.json`. Those settings deny edits outside the content paths. In a session with Frederik, his instructions decide what may change. Facts, Voice and Images apply to everyone.

Read before writing copy:

- [docs/brief-facility.md](docs/brief-facility.md): cleaning and facility pages, articles, jobs
- [docs/brief-platform.md](docs/brief-platform.md): platform pages (EN + DA)

**The repository is public.** Everything here, every PR and every commit message can be read by anyone. Never write client names, internal numbers (task counts, revenue, employee counts), credentials or personal data into them unless the task says the information is public.

## Build

- `npm run build` is a clean build plus the checks: the front matter of every article and `_data/jobs.json` (checked as the build starts, see `tools/schemas.js`), `check-css` (classes, CSS debt, headings), `check-content` (titles, descriptions, links, alt, placeholders such as TODO, i18n parity, images, photo sources, form endpoints, facts) and the photo inventory. It must pass before you push. Netlify runs the same build.
- `npm run new` starts an article, case or job; `npm run photo` adds a photo. See below.
- `npm run check:paths` runs the PR guard locally on your branch.
- `npm run preview` builds and serves `_site` on port 8080.
- The checks compare against baselines (`tools/css-baseline.json`, `tools/content-baseline.json`). Never add to a baseline to make a check pass; fix the problem. If you fix a known problem, run `npm run content:baseline` (or `css:baseline`) so the fix stays fixed.

## Scope

`tools/check-paths.js` enforces this on your PRs (a required check).

You may edit:

- `index.html` and `pages/facility/**/*.html`: copy only, not structure, classes or scripts
- `pages/facility/indblik/artikler/**/*.md`: new articles and cases (made with `npm run new`) and edits to existing ones
- `pages/software/**/*.html`: front matter only (title, description, og)
- `_data/i18n/*.json`
- `_data/jobs.json`; `_data/faq.json` once it exists
- `images/**`: add new files only
- `tools/photo-candidates.json`

Read only: `_data/site.json`, `_data/facts.json` and `_data/authors.json`. A change to any of them is a separate PR that says so in its title, and Frederik makes it.

Never add a page. The only new files are articles, cases and images.

Never touch anything else, in particular:

- `_includes/**`, `css/**`, `js/**` (`js/prisberegner.js` holds the prices)
- `.eleventy.js`, `tools/**` (except `photo-candidates.json`), `netlify.toml`, `netlify/**`, `.github/**`
- `package*.json`, `sitemap.njk`, `robots.txt`, `.nvmrc`, `CLAUDE.md`, `docs/**`, `.claude/**`, `scaffolds/**`
- `pages/facility/components/*politik.html` (legal)
- `_assets-unused/**`

Never delete or rename images, pages or articles. A removal is a request in the PR description.

## Facts

- Never invent prices, discounts, client names, logos, testimonials, quotes, numbers, percentages, certifications, hours, response times or service areas.
- Use only `_data/facts.json` and `_data/site.json`, plus numbers given in the task with a source. In pages, write facts as `{{ facts.cleaningHours }}`, `{{ facts.area }}`, `{{ site.phoneDisplay }}` and so on, not as typed-out text.
- If a sentence needs a number you don't have, write it without the number, or leave `<!-- TODO(Frederik): … -->` and list it in the PR.
- The two existing case articles (`artikler/cases/`) are as Frederik left them. Don't copy their numbers into other pages.
- Open decisions are listed in the briefs. Don't resolve them in copy.

## Voice

- **Facility side:** Danish with æ/ø/å (never "oe/aa" in visible text). Address the reader as "I/jer"; "du" is fine in jobs, forms and policies. Concrete, calm and practical, with no superlatives you can't back up.
- **Platform side:** outcome first, then the feature. Practitioner voice: built by people who run a cleaning company. Every EN change needs the matching DA change in the same PR, and the other way round.
- **Capitalisation, everywhere and in both languages:** sentence case, never Title Case. That covers headings, page titles, buttons, nav and footer links: "Se alle funktioner", "Hvorfor vælge DFMG?", "Book a demo", "Core operations". Only the first word and names keep a capital (DFMG, DFMG Platform, Bank Connect, Piccoline, Location Guides, København). In Danish, the pronoun "I" stays capital; "i" (in) is lower case. All-caps labels (eyebrows) stay as they are.
- **English:** British spelling (colour, organise, customise, centre, licence as a noun). The locale is `en_GB`. Exception: platform module names are written as the product's UI writes them ("Export Center").

## Articles, cases and jobs

**Article:** `npm run new -- article <indsigt|tips|baeredygtighed|innovation> "<name>"` writes `artikler/<category>/<name>.md` from `scaffolds/article.md`. Fill in the front matter and replace every `TODO`; the build fails while one is left.

- The file is front matter plus a Markdown body, nothing else: no layout markup, no `layout:` line, no excerpt in the body. The layout adds the header, photo, excerpt box, sidebar and footer.
- Body: paragraphs, `##` sections, `###` subsections, lists, `**bold**`, links. A boxed note is `{% callout %}…{% endcallout %}` (green: `{% callout "success" %}`); no other HTML or classes. Facts as `{{ facts.area }}` and so on, as everywhere.
- `date: YYYY-MM-DD` (no quotes) is the publication day. Add `updated: YYYY-MM-DD` only for a real change in content, never for a typo.
- `author: dfmg`, unless the task names another key from `_data/authors.json`.
- `excerpt` is the one summary: the cards and the box at the top of the article both show it.
- One article per PR.

**Case:** `npm run new -- case "<name>"`. Like an article, plus:

- `client`: the client's name, only when the task says the client has agreed in writing to be named. Then also `clientConsent: true`; without it the build fails. Without consent, leave both out and describe the client anonymously.
- `sources`: where every number in the case comes from (an ERP export, the client's own figures with date). At least one; the build fails without.
- A quote only when the task gives the exact wording and says the client approved it.

**Job:** `npm run new -- job "<id>"` adds an entry to `_data/jobs.json` with `published: false`. Fill in every field from the task, then set `published: true`. Each published job gets its own page with Google's job data, so `datePosted` and `employmentType` must be right. To close a job, set `published: false` (or `validThrough` to the last day); never delete it. The open decisions in the facility brief (driving licence, plumbing and electrical work) stay as they are.

## Images

1. Reuse an existing photo where it fits. The work queue is the photo inventory: run `npm run preview` and open `/internal/photos/`. It is built locally only and never deployed.
2. New photos come from Pexels. Reject photos with readable foreign-language text, a recognisably wrong city, face masks or delivery boxes, or people shown in a bad light.
3. Add it with `npm run photo -- <pexels-link> "<section>/<name>" --slot <slot-id> --kind hero|card`. It downloads, resizes (1600 px for heroes, 1200 px for cards), converts to webp under 200 KB, names the file in ASCII (æ→ae, ø→oe, å→aa), never overwrites, and records the source under the slot in `tools/photo-candidates.json`. An article's slot is `artikel-<file name>`.
4. Reference it through front matter `image`/`imageAlt`, or as `<img>` with `width="{{ src | imgWidth }}" height="{{ src | imgHeight }}"`, plus `loading="lazy"` below the fold and `decoding="async"`. Article photos get smaller copies (`srcset`) automatically.
5. Alt text is in the page's language and says what is in the photo, not the marketing message.
6. Keep the slot's `data-photo-slot` and update its status, so the inventory stays right.

## Branches and pull requests

- You work and push as the GitHub user **dfmg-bot**, never with Frederik's credentials.
- Branch names: `content/<area>-<slug>`, for example `content/artikel-vinduespudsning-vinter`, `content/jobs-oktober`, `content/platform-pricing-copy`.
- Never push to `main`, never force-push, never merge your own PR. Merging is Frederik's approval.
- One topic per PR. The description follows `.github/pull_request_template.md`.
- Size: at most 15 files, 600 changed lines (images and `photo-candidates.json` not counted), 6 new images and 1 new article per PR. The guard fails a bigger PR; split it, don't squeeze it.
- Forms are switched off on deploy previews (they say nothing was sent). Still never submit one.
