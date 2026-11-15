# Brief: DFMG Platform pages

For anyone writing copy for `pages/software/**` (EN and DA). The copy lives in `_data/i18n/software*.json`; page titles and descriptions are in the front matter of each EN and DA page file. The rules in [CLAUDE.md](../CLAUDE.md) apply on top of this. Screenshots, video and other assets still to make: [platform-assets.md](platform-assets.md).

## Who we write for

The owner-led Danish service company whose people work at their clients' sites, with roughly 5 to 150 people in the field: facility service, cleaning, window cleaning, property service and caretaking, gardening, pest control, security and the like. The owner often still plans the week personally. They run the business from spreadsheets, group chats and several separate tools, and lose time copying data between them. They are practical and short on time, and wary of software built by people who have never run a service business.

The words and the demo are aimed at that company, but the site sets no upper size limit anywhere: no "for companies up to …", no size cut-off in forms or plans. A larger company is welcome; in pricing, Enterprise stays "Talk to us". Never claim SSO, an SLA, certifications or "enterprise-ready".

## Positioning

The platform is for every service company whose people do visits at their clients' sites. It is not a cleaning tool.

- **Built inside a facility service company** that runs on it every day: DFMG plans, runs and proves its own week on the platform.
- **Plan, run, prove**: the schedule, the employee app and the proof of every visit, connected, so what the office plans is what the team sees, and what the team does is what the office can show.
- **Three apps, one system**: the office (planning and follow-up), the employee app (the visit, from the phone) and the client portal (what the client sees). Home and the platform overview say this.
- **Where we are going**: one system to run the whole business. Say it in one line at most (the about page), never as a list of features that are not LIVE.

Wording:

- The buyer is "service companies", "companies whose people work at their clients' sites". The work is "visits at your clients' sites". Never "cleaning company" as the buyer, on any page but the cleaning industry page.
- Examples may mix industries: an office clean, a caretaker's round, a window round.
- DFMG itself is "a facility service company", not "a cleaning company".

## Industries

The header has an "Industries" menu. Three pages now: **Facility service**, **Cleaning** and **Property service**. They share one structure: the kinds of work, then the LIVE features shown with that industry's examples, then "built inside a facility service company", then links to the other industries. An industry page says nothing that is not true for the platform as a whole; it changes the examples, not the claims. Add another industry (window cleaning, gardening, pest control, security) only when a customer in it runs on the platform.

## Areas

The product is shown by area, in the same order as the platform's own sidebar. The product mega menu has the three apps on the left and the areas on the right.

| Area | Page | What goes on it |
|---|---|---|
| Operations | `operations.html` | Plan, run, prove: the schedule, recurring visits, crews, the map, the visit on the phone with its checklist in route order and the site's floor plan, check-in and check-out, photos, time on site. This story is also the home hero. |
| People | `people.html` | Staff records and access, availability, time off, tests. Hiring once it is LIVE. Never courses |
| Logistics | `logistics.html` | Stock by storage, movements, low-stock levels; purchase orders and deliveries once they are LIVE |
| Sales & CRM | `sales.html` | Leads, finding leads in the company register, the call log, notes from recorded calls and meetings, proposals, electronic signatures, tenders found |
| Communication | `communication.html` | The email inbox, WhatsApp, chat in the app, notifications |
| AI assistants | `assistants.html` | Call briefs, tenders found and analysed, the approval list; the advisory board, setup assistant, flows, lessons, verified facts and reports. A person approves every step |
| Finance | none | Not shown until the system is notified to Erhvervsstyrelsen |

An area with fewer than three LIVE blocks starts as a section on the platform overview, and the menu links to that section; it becomes a page when it has three. Never call an area "Outreach" on the site: it reads as mass mailing (Markedsføringsloven § 10). The area is "Sales & CRM" ("Salg og CRM").

## Voice

- Outcome first, then the feature: "Invoice the hours your team logged, without retyping them", not "Automated invoice module".
- Plain and specific. The reader knows the work better than any marketer; talk to them as a peer.
- **English is British:** colour, organise, customise, centre, licence (noun), programme (except software "program"). Module names follow the product's UI, even where it is American ("Export Center"; in Danish "Eksportcenter").
- **Sentence case** in both languages, for headings, titles, buttons and links: "Book a demo", "Core operations", "Se alle funktioner". Names keep their capitals (DFMG Platform, Bank Connect, eIndkomst).
- **Danish** has æ/ø/å and the same meaning as the English, not a word-for-word translation.
- Every EN change has its DA change in the same PR, and the other way round. The build fails if the keys differ.

## What we may say

Only what [platform-capabilities.md](platform-capabilities.md) marks LIVE. Today that is:

- Operations: the schedule (every visit by client, employee and time), several recurring tasks per client, each with its own rule, planned ahead; crews; the map; the employee app with check-in and check-out per person; checklists in route order; floor plans per site; before and after photos on every visit; time on site per person against the planned time
- People: staff records and access by position, employee availability, time off asked for and answered in the app, tests
- Logistics: items by storage, stock movements, low-stock levels
- Sales & CRM: lead lists, finding leads in the company register, the call log, notes from recorded calls and meetings, proposals sent as a link and seen when opened, electronic signatures on documents, public tenders found
- Communication: the email inbox, WhatsApp with employees, chat between office and employees, notifications
- Client portal: the client sees their visits and the photos from them (shown by Frederik's decision; production does not record views, so say only what it does)
- AI assistants: call briefs, tenders found and analysed, the approval list, the advisory board, the setup assistant, flows and templates, lessons, verified facts, assistant reports; a person approves every step
- The office: personal calendar with Google sync, the audit log

**Proof is photos and times, never ticked checklists.** Crews rarely tick checklist items. Show the checklist as the order of the work, never as proof: no "every task ticked off", no "see what was done, task by task". Proof is before and after photos and check-in and check-out time per person.

**Never mention courses.** They are broken.

A property is a site: an address under a client (a property administrator is the client, each building is an address with its own floor plans and photos). Write "properties" or "sites", not "clients", when you mean the buildings.

A feature marked BUILT or NOT MEASURED there waits until it is LIVE. When one changes status, update that file first, then the copy.

**Finance is on hold.** No bookkeeping, invoicing, e-invoicing, VAT, payroll, bank reconciliation or accounting claims, in any form, until Frederik decides otherwise. Bogføringsloven § 19 requires a digital bookkeeping system to be notified to Erhvervsstyrelsen before it is marketed; the reasons and sources are in [platform-capabilities.md](platform-capabilities.md#finance-hold-legal). The Bank Connect page was removed for the same reason; its URLs redirect to the features page.

**Screenshots** come from the platform's local test company (invented clients and people, marked "(FAKE)"), never from real company data. The features page says so.

**Screenshot placeholders** are allowed while a page is reviewed on its deploy preview: a clearly marked box with the shot's number and what it will show ("Screenshot S10: before and after photos of one visit"), numbered as in [platform-assets.md](platform-assets.md). Use one of the real shots in `/images/platform/` wherever it fits. A page merges to the live site only when every placeholder is replaced by a real shot or removed (text only is fine); the build's placeholder check is the guard.

The technology claims on the about page (multi-tenant with isolated schemas, hosted in the EU, two-step login, real-time, mobile-ready, modular) are approved as worded there. Don't add new ones. In particular, until the product changes:

- **"All data stays in the EU"** is not true today: not every copy of the data, and not every service that processes it, is in the EU. Write "the application, the database and photos run in EU data centres".
- **GDPR and data processing agreements**: no DPA exists yet. Don't say "GDPR compliant" or "DPA included".
- **Languages**: the system is in English, and the Danish translation is under way. Don't call it "Danish-first" or "Danish and English side by side".
- **The employee app** runs in the phone's browser: write exactly that, never "iPhone app", until Frederik confirms Apple has approved it. The second wording is ready behind one switch in the site data: "an iPhone app, or in the phone's browser on any phone". It is an unlisted App Store app, so never "search for us in the App Store" or an App Store badge: employees get the link from their company. Android is the browser.
- **Plan limits** (employees, users) and contract terms (notice, billing period, setup fees) are not decided. Don't write them.

The security page (`pages/software/security.html`, copy in `_data/i18n/softwareSecurity.json`) says only what the platform does today, and lists what is not done yet under "What we are working on". When one of those lands, or a service in its table changes, update both languages in the same PR, and check the claim in the platform's code first.

## What we never say

- **Prices.** All tiers say "Contact us" (Starter, Professional) or "Custom" (Enterprise). Don't write a price, a "from" price or a discount.
- **Metrics and testimonials.** There are none yet. The metrics bar and testimonial section were removed from the homepage because they held placeholders, and they stay removed until Frederik supplies real, sourced content. Never write a testimonial or quote, not even as a draft, and never put `[X]`-style placeholders in copy; the build fails on them.
- **Customer names or logos**, unless the task says the customer agreed.
- **Competitors or other products by name.** Describe the problem ("several separate tools"), not the brands.
- **Integrations.** None is named on the home or features page today; add one only once it is LIVE.

## Decided (15 Nov 2026)

- **Contact hours**: weekdays 8–16 ("Hverdage 8–16"), on both sides of the site.
- **Reply time**: "We reply within one working day" ("Vi svarer inden for 1 arbejdsdag").
- **Pricing**: no prices. Every plan is priced per company and agreed after a demo. Starter covers plan, run and prove; Professional adds stock, tests, the sales tools and the AI assistants; Enterprise has everything in Professional and terms agreed with the customer. The client portal is in every plan. Don't mention that assistants cost per run.
- **After the demo**: a paid pilot. There is no free trial.
- **"40+ modules"**: removed. Don't count modules.
- **Floor plans**: the page was removed (its URLs redirect to features) until the feature is LIVE. Floor plans are LIVE since the 15 Nov audit: they appear on the operations page; the old page and its redirect stay as they are unless Frederik decides otherwise.
- **Contact**: the demo page is also the contact page (one form for a demo or a question, with phone, email and hours). `contact.html` redirects there.
- **Lead with plan, run and prove** on the overview and features pages; team, stock and sales follow.
- **Buyer and positioning**: the platform is for all service companies whose people work at their clients' sites, not for cleaning only. DFMG is described as a facility service company. See "Who we write for" and "Positioning".
- **Industries**: an "Industries" menu with three pages (facility service, cleaning, property service). More only as customers come.
- **About page**: "Built inside a facility service company that runs on it every day", plus one line on where we are going: one system to run the whole business.
- **Three apps, one system** (office, employee app, client portal) on home and the platform overview. The client portal is shown, with its own block and a menu entry.
- **AI assistants are shown**: a menu entry and a section on the platform overview, never in the hero.
- **Structure by area**, matching the app's sidebar (see "Areas"), not by job. Plan, run, prove stays the home hero and the story of the operations page.
- **Size**: no upper limit on the site; words aimed at roughly 5–150 people in the field.
