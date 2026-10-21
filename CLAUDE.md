# dfmg-landing

The public website for dfmg.dk: the cleaning and facility side (Danish) and the DFMG Platform side (English and Danish). Eleventy builds it into `_site/`. Netlify deploys `main` to production and builds a deploy preview for every pull request.

The rules under Scope and Branches are for the marketing agent: sessions on the Mac worker that push as dfmg-bot and start with `claude --settings .claude/agent-settings.json`. Those settings deny edits outside the content paths. In a session with Frederik, his instructions decide what may change. Facts, Voice and Images apply to everyone.

Read before writing copy:

- [docs/brief-facility.md](docs/brief-facility.md): cleaning and facility pages, articles, jobs
- [docs/brief-platform.md](docs/brief-platform.md): platform pages (EN + DA)

**The repository is public.** Everything here, every PR and every commit message can be read by anyone. Never write client names, internal numbers (task counts, revenue, employee counts), credentials or personal data into them unless the task says the information is public.

## Build

- `npm run build` is a clean build plus the checks: `check-css` (classes, CSS debt, headings), `check-content` (titles, descriptions, links, alt, article front matter, i18n parity, images, facts) and the photo inventory. It must pass before you push. Netlify runs the same build.
- `npm run preview` builds and serves `_site` on port 8080.
- The checks compare against baselines (`tools/css-baseline.json`, `tools/content-baseline.json`). Never add to a baseline to make a check pass; fix the problem. If you fix a known problem, run `npm run content:baseline` (or `css:baseline`) so the fix stays fixed.

## Scope

`tools/check-paths.js` enforces this on your PRs (a required check).

You may edit:

- `index.html` and `pages/facility/**/*.html`: copy only, not structure, classes or scripts
- `pages/facility/indblik/artikler/**`: new and edited articles
- `pages/software/**/*.html`: front matter only (title, description, og)
- `_data/i18n/*.json`
- `_data/jobs.json`, `_data/faq.json` (once they exist)
- `images/**`: add new files only
- `tools/photo-candidates.json`

Read only: `_data/site.json` and `_data/facts.json`. A change to either is a separate PR that says so in its title, and Frederik makes it.

Never touch anything else, in particular:

- `_includes/**`, `css/**`, `js/**` (`js/prisberegner.js` holds the prices)
- `.eleventy.js`, `tools/**` (except `photo-candidates.json`), `netlify.toml`, `netlify/**`, `.github/**`
- `package*.json`, `sitemap.njk`, `robots.txt`, `.nvmrc`, `CLAUDE.md`, `docs/**`, `.claude/**`
- `pages/facility/components/*politik.html` (legal)
- `_assets-unused/**`

Never delete or rename images, pages or articles. A removal is a request in the PR description.

## Facts

- Never invent prices, discounts, client names, logos, testimonials, quotes, numbers, percentages, certifications, hours, response times or service areas.
- Use only `_data/facts.json` and `_data/site.json`, plus numbers given in the task with a source. In pages, write facts as `{{ facts.cleaningHours }}`, `{{ facts.area }}`, `{{ site.phoneDisplay }}` and so on, not as typed-out text.
- If a sentence needs a number you don't have, write it without the number, or leave `<!-- TODO(Frederik): … -->` and list it in the PR.
- Case articles (`artikler/cases/`) are as Frederik left them. Don't copy their numbers into other pages.
- Open decisions are listed in the briefs. Don't resolve them in copy.

## Voice

- **Facility side:** Danish with æ/ø/å (never "oe/aa" in visible text). Address the reader as "I/jer"; "du" is fine in jobs, forms and policies. Concrete, calm and practical, with no superlatives you can't back up.
- **Platform side:** outcome first, then the feature. Practitioner voice: built by people who run a cleaning company. Every EN change needs the matching DA change in the same PR, and the other way round.
- **Capitalisation, everywhere and in both languages:** sentence case, never Title Case. That covers headings, page titles, buttons, nav and footer links: "Se alle funktioner", "Hvorfor vælge DFMG?", "Book a demo", "Core operations". Only the first word and names keep a capital (DFMG, DFMG Platform, Bank Connect, Piccoline, Location Guides, København). In Danish, the pronoun "I" stays capital; "i" (in) is lower case. All-caps labels (eyebrows) stay as they are.
- **English:** British spelling (colour, organise, customise, centre, licence as a noun). The locale is `en_GB`. Exception: platform module names are written as the product's UI writes them ("Export Center").

## Images

1. Reuse an existing photo where it fits. The work queue is the photo inventory: run `npm run preview` and open `/internal/photos/`. It is built locally only and never deployed.
2. New photos come from Pexels. Reject photos with readable foreign-language text, a recognisably wrong city, face masks or delivery boxes, or people shown in a bad light.
3. webp, quality about 80, at most 1600 px wide (heroes) or 1200 px (cards and inline), under 200 KB. The build fails above 250 KB or 2000 px.
4. Save as `images/<section>/<danish-ascii-slug>.webp`, lowercase (æ→ae, ø→oe, å→aa).
5. Reference it through front matter `image`/`imageAlt`, or as `<img>` with `width="{{ src | imgWidth }}" height="{{ src | imgHeight }}"`, plus `loading="lazy"` below the fold and `decoding="async"`.
6. Alt text is in the page's language and says what is in the photo, not the marketing message.
7. Keep the slot's `data-photo-slot` and update its status, so the inventory stays right. Record the source in `tools/photo-candidates.json`.

## Branches and pull requests

- You work and push as the GitHub user **dfmg-bot**, never with Frederik's credentials.
- Branch names: `content/<area>-<slug>`, for example `content/artikel-vinduespudsning-vinter`, `content/jobs-oktober`, `content/platform-pricing-copy`.
- Never push to `main`, never force-push, never merge your own PR. Merging is Frederik's approval.
- One topic per PR. The description follows `.github/pull_request_template.md`.
- Never submit forms on a deploy preview: they post to the real inbox.
