# Brief: cleaning and facility side

For anyone writing copy for `index.html`, `pages/facility/**`, articles and jobs. The rules in [CLAUDE.md](../CLAUDE.md) apply on top of this.

## Who we write for

Businesses in the Copenhagen area that buy cleaning and facility services. They are not consumers. The reader is usually the person who has to make the building work: an office manager, a facility or property manager, a manager at a school or cultural institution, or the owner of a restaurant, shop or event venue.

What they care about: that the cleaners turn up when agreed, that the work is done the same way every time, that someone answers when something is wrong, and a price they know in advance. What they are tired of: suppliers who promise everything and then send someone new every week.

## What we offer

Each service has its own page; the page is the source for what is included.

| Service | Page | In one line |
|---|---|---|
| Erhvervsrengøring | `services/rengoering.html` | Daily and periodic cleaning of offices, schools, restaurants and event venues |
| Vinduespolering | `services/vinduespudsning.html` | Inside and outside; work at height via partner |
| Ejendomsservice | `services/ejendomsservice.html` | Stairwells, outdoor areas, caretaker tasks for properties |
| Handyman | `services/handyman.html` | Repairs, maintenance, furniture assembly |
| Supplies & produkter | `services/produkter.html` | Hygiene products and office supplies |
| Piccoline-ordning | `services/picoline.html` | An on-site helper for the office |
| Komplet facility service | `services/facility.html` | All of it as one agreement |

Some work is done by partners, never by our own staff. The list is `viaPartner` in `_data/facts.json` (electrical, plumbing, tiling, security, access control, HACCP, ventilation cleaning, facade work at height). Copy must say "via samarbejdspartner" for these.

Prices come only from the price calculator (`pages/facility/prisberegner.html`, rates in `js/prisberegner.js`). Copy never states a price, a discount or a "from" price.

## Approved facts

From the facility fact pass of 2026-10-18. They live in `_data/facts.json`; use the variables, not typed-out text.

| Fact | Variable | Value |
|---|---|---|
| Founded | `facts.founded.year` | 2024 (CVR registration) |
| Service area | `facts.area` | København og omegn |
| When we clean | `facts.cleaningHours` | alle dage kl. 04–22 |
| Phone hours | `facts.phoneHours` | hverdage 8–16 |
| Callback | `facts.callback` | samme dag |
| Fixed quote | `facts.quoteTime` | inden for 24 timer |
| Start | `facts.startTime` | typisk 1–2 uger |
| Urgent help | `facts.urgentHelp` | akut hjælp efter aftale |
| 24/7 service | `facts.support247` | no: never claim 24/7 |

Phone, email, CVR and address are in `_data/site.json`.

Everything else, including any count of tasks, clients, employees or years, is not approved. If a sentence needs it, write the sentence without it.

## Voice

- Danish with æ/ø/å. "I/jer" to the reader; "du" in jobs, forms and policies.
- Concrete and calm: what happens, when, and who does it. Short sentences.
- Danish words where they exist: "ruteplanlægning", not "route optimization".
- Sentence case everywhere, never Title Case: headings, titles, buttons, nav and footer links ("Få tilbud", "Hvorfor vælge DFMG?", "Book et møde med mig"). Names keep their capital; so does the pronoun "I".

## Words and claims to avoid

- Superlatives you can't prove: "bedst", "markedets førende", "revolutionerer", "verdensklasse", "garanteret".
- Percentages and results without a source. The numbers left in case articles are not to be reused.
- "24/7", "døgnet rundt", night work as a selling point.
- Any client name or logo, unless the task says the client agreed.
- ASCII Danish ("rengoering", "oe", "aa") in visible text. It belongs only in file names and URLs.

## What a good article looks like

- One question a facility or office manager actually has, answered in 600–1,200 words.
- Start from `npm run new` (`scaffolds/article.md`, or `scaffolds/case.md` for a case); `npm run build` checks every field. Markdown body only; a boxed note is `{% callout %}`.
- Structure: a short intro that names the problem, three to five sections with `h2`, a practical list or checklist, and a closing line that points to Kontakt.
- Examples are concrete but don't invent numbers. "En kunde ville have færre forstyrrelser i arbejdstiden, så vi flyttede rengøringen til morgentimerne" works without a figure.
- The excerpt says what the reader will learn, in one or two sentences.

## Open decisions

Frederik decides these. Don't resolve them in copy, don't add to either side, and leave the current wording alone unless the task is about exactly this.

- **Bilfri vs. jobs that need a car.** The sustainability pages and the bilfri article say the company runs 100% car-free. The open jobs in `_data/jobs.json` ask for "kørekort og egen transport" (and a closed one for "bil til rådighed"). The bilfri article also contains its own unsourced figures, which stay until this is decided.
- **The no-show wording.** The punctuality line on `services/rengoering.html` ("0 udeblivelser" with a period and a count) is waiting for approved wording.
- **The handyman job.** The handyman job (closed for now, `published: false` in `_data/jobs.json`) asks for experience with plumbing and electrical work, while the service pages say that work goes via a partner. Don't reopen it before this is decided.
