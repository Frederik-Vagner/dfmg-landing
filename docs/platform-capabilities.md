# Platform capabilities: what the site may claim

What a customer can do with DFMG Platform today, grouped by the job they hire it for. The copy brief ([brief-platform.md](brief-platform.md)) takes its "What we may say" list from here.

- **LIVE**: the feature's purpose has happened in production, recently. Only LIVE goes on the site.
- **BUILT**: the feature exists and works in the code, but its purpose has not happened in production yet (never used, paused, or used too little to count). It goes on the site once it is LIVE.
- **NOT MEASURED**: nobody has checked production yet. Treat as BUILT until a check says otherwise.
- **HOLD (legal)**: bookkeeping features. They stay off the site whatever their status, until the system is notified to Erhvervsstyrelsen (see "Finance" below).

Source: the platform's own production audit of 8 November 2026 (counts and dates per feature, read-only). The counts are internal and are not repeated here. Update this file when a feature changes status, with the date.

## Plan the week

| Capability | Status |
|---|---|
| Schedule: every visit on one calendar, by client and by employee | LIVE |
| Recurring visits: the coming weeks are planned automatically from a client's rules | LIVE |
| Time off: employees ask in the app, the office decides | LIVE |
| Shift offers: an employee hands a shift on, a colleague takes it | BUILT |
| Bookings: a client books extra work | BUILT |

## Run the visit

| Capability | Status |
|---|---|
| Employee app (web and iPhone): today's visits, the team's schedule | LIVE |
| Check-in and check-out per person, per visit | LIVE |
| Chat between office and employees | LIVE |
| Notifications to employees | LIVE |
| Stock: items, storages and movements, low-stock levels | LIVE |
| Issue reports from the site to the office | BUILT (used before, not recently) |
| GPS position at check-in | BUILT (not working since June; fix in the platform's backlog) |
| Location guides, checklists in route order, floor plans | NOT MEASURED |
| Purchase orders to suppliers | BUILT (not used recently) |

## Prove the quality

| Capability | Status |
|---|---|
| Before and after photos on every visit | LIVE |
| Time on site per person against the planned time | LIVE |
| Tests: training checked in the app | LIVE |
| Inspections and facility status | BUILT |
| Premises status reports to clients | BUILT |
| Guide acknowledgement (employee confirms they read a guide) | BUILT |
| Courses | BUILT (not working end to end) |

## Keep clients informed

| Capability | Status |
|---|---|
| Client portal: visits, photos, reports | BUILT (few clients invited yet) |
| Client feedback, client reports, surveys | BUILT |
| Email inbox inside the platform | NOT MEASURED |

## Sell

| Capability | Status |
|---|---|
| Lead lists | LIVE |
| Call log: every call on record | LIVE |
| Meeting recording turned into a summary and notes | LIVE |
| Proposals sent as a link, and seen when the client opens them | LIVE |
| Electronic signatures on documents | LIVE |
| Deals pipeline (won and lost) | BUILT (stages do not yet close a deal) |
| Lead to client conversion | BUILT |
| Reminders and follow-ups | BUILT (made, not closed) |
| Public tenders found for you | BUILT |
| Yearly price adjustment letters | BUILT |
| Email sequences | BUILT. Never market: unsolicited electronic marketing is forbidden (Markedsføringsloven § 10) |

## Assistants

| Capability | Status |
|---|---|
| AI assistants that propose work; a person decides every step | LIVE (internal; not on the site until Frederik decides how to present it) |

## Finance: HOLD (legal)

Not on the site, whatever the status, until Frederik decides otherwise.

**Why.** Bogføringsloven § 19, stk. 1: providers must notify ("anmelde") a digital bookkeeping system to Erhvervsstyrelsen "inden de markedsføres her i landet". § 3, nr. 7 counts a business that "markedsfører eller påtænker at markedsføre" a system to an open group of businesses as a provider. Erhvervsstyrelsen's guide for providers (§ 2.2) names websites that offer the system to Danish businesses as marketing, and says a non-registered system may only be marketed to businesses outside the digital bookkeeping duty, stated clearly. Breaking § 19 is punishable by a fine (§ 33, stk. 1, nr. 3).

- Act: <https://www.retsinformation.dk/eli/lta/2022/700>
- Guide for providers: <https://erhvervsstyrelsen.dk/vejledning-vejledning-til-udbydere-af-digitale-standard-bogfoeringssystemer>

Payroll-only and sales tools fall outside the duty to notify (guide § 2.1), but payroll is not LIVE in the platform either.

| Capability | Status |
|---|---|
| Bank import and reconciliation | LIVE, HOLD |
| Journal | LIVE, HOLD |
| Invoicing, e-invoicing, credit notes, payment reminders | BUILT (paused), HOLD |
| VAT, annual reporting, vendor bills, budget, fixed assets, cost centres | BUILT, HOLD |
| Payroll, payslips, eIndkomst, holiday pay | BUILT (salaries are run elsewhere), HOLD |
| Bank Connect payments and statements | HOLD (its page was removed; the URLs redirect to the features page) |
