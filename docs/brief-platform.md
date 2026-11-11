# Brief: DFMG Platform pages

For anyone writing copy for `pages/software/**` (EN and DA). The copy lives in `_data/i18n/software*.json`; page titles and descriptions are in the front matter of each EN and DA page file. The rules in [CLAUDE.md](../CLAUDE.md) apply on top of this. Screenshots, video and other assets still to make: [platform-assets.md](platform-assets.md).

## Who we write for

Owners and managers of Danish cleaning and service companies, from a handful of employees to a few hundred. They run the business from spreadsheets and several separate tools (scheduling, invoicing, payroll, email) and lose time copying data between them. They are practical and short on time, and wary of software built by people who have never run a service business.

## Positioning

One system for the whole operation, built by a service company that runs on it every day. Practitioner-built, Danish-first (eIndkomst, SKAT, holiday law, e-Faktura, NemKonto are native), and connected: hours logged once flow into invoicing, payroll and reports.

## Voice

- Outcome first, then the feature: "Invoice the hours your team logged, without retyping them", not "Automated invoice module".
- Plain and specific. The reader knows the work better than any marketer; talk to them as a peer.
- **English is British:** colour, organise, customise, centre, licence (noun), programme (except software "program"). Module names follow the product's UI, even where it is American ("Export Center"; in Danish "Eksportcenter").
- **Sentence case** in both languages, for headings, titles, buttons and links: "Book a demo", "Core operations", "Se alle funktioner". Names keep their capitals (DFMG Platform, Bank Connect, eIndkomst).
- **Danish** has æ/ø/å and the same meaning as the English, not a word-for-word translation.
- Every EN change has its DA change in the same PR, and the other way round. The build fails if the keys differ.

## What we may say

Only what [platform-capabilities.md](platform-capabilities.md) marks LIVE. Today that is:

- Plan the week: the schedule (every visit by client, employee and time), recurring visits planned ahead, time off asked for and answered in the app
- Run the visit: the employee app (browser and iPhone), check-in and check-out per person, chat, notifications
- Prove the work: before and after photos on every visit, time on site per person against the planned time
- Keep the team on board: notifications, chat, tests
- Stock: items by storage, stock movements, low-stock levels
- Sell: lead lists, the call log, meeting notes from recorded meetings, proposals sent as a link and seen when opened, electronic signatures

A feature marked BUILT or NOT MEASURED there waits until it is LIVE. When one changes status, update that file first, then the copy.

**Finance is on hold.** No bookkeeping, invoicing, e-invoicing, VAT, payroll, bank reconciliation or accounting claims, in any form, until Frederik decides otherwise. Bogføringsloven § 19 requires a digital bookkeeping system to be notified to Erhvervsstyrelsen before it is marketed; the reasons and sources are in [platform-capabilities.md](platform-capabilities.md#finance-hold-legal). The Bank Connect page is the one exception still standing, reduced to payments and statements, pending his decision.

**Screenshots** come from the platform's local test company (invented clients and people, marked "(FAKE)"), never from real company data. The features page says so.

The technology claims on the about page (multi-tenant with isolated schemas, EU-hosted, GDPR, real-time, mobile-ready, modular) are approved as worded there. Don't add new ones.

## What we never say

- **Prices.** All tiers say "Contact us" (Starter, Professional) or "Custom" (Enterprise). Don't write a price, a "from" price or a discount.
- **Metrics and testimonials.** There are none yet. The metrics bar and testimonial section were removed from the homepage because they held placeholders, and they stay removed until Frederik supplies real, sourced content. Never write a testimonial or quote, not even as a draft, and never put `[X]`-style placeholders in copy; the build fails on them.
- **Customer names or logos**, unless the task says the customer agreed.
- **Competitors or other products by name.** Describe the problem ("several separate tools"), not the brands.
- **Integrations.** None is named on the home or features page today; add one only once it is LIVE.

## Open questions

Frederik decides these; keep the current wording until he does.

- **Contact hours.** The platform contact page says "Mon–Fri, 08–17 CET"; the facility side says phone hours are weekdays 8–16.
- **Reply time.** The platform contact, demo and thank-you pages promise a reply "within 24 hours". This is not in the approved facts.
- **"Contact us" pricing.** What a prospect gets when they ask (a quote after a demo, a price list) isn't written down, so copy shouldn't describe it.
- **"40+ modules".** The about page says "From spreadsheets to 40+ modules". Keep the number as it is; don't raise it or reuse it elsewhere until it's confirmed.
