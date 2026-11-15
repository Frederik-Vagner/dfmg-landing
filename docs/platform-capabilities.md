# Platform capabilities: what the site may claim

What a customer can do with DFMG Platform today, grouped by the areas the site uses (the same order as the platform's own sidebar). The copy brief ([brief-platform.md](brief-platform.md)) takes its "What we may say" list from here.

- **LIVE**: the feature's purpose has happened in production, recently. Only LIVE goes on the site.
- **BUILT**: the feature exists and works in the code, but its purpose has not happened in production yet (never used, paused, or used too little to count). It goes on the site once it is LIVE.
- **BROKEN**: the purpose cannot happen today. Never mention it.
- **UNKNOWN**: production cannot show whether the purpose happens. Not claimed, unless the row says Frederik decided otherwise.
- **HOLD (legal)**: bookkeeping features. They stay off the site whatever their status, until the system is notified to Erhvervsstyrelsen (see "Finance" below).

Sources: the platform's production audits of 8 November 2026 and 15 November 2026 (dfmg-project-eu PR #385), both read-only, plus Frederik's decisions of 15 November 2026 where a row says so. The counts are internal and are not repeated here. Update this file when a feature changes status, with the date.

**Proof of a visit is the photos and the times.** Crews rarely tick checklist items, so the site never says "every task ticked off" or uses the checklist as proof. Proof on the site is before and after photos, and check-in and check-out time per person.

## Operations

| Capability | Status |
|---|---|
| Schedule: every visit on one calendar, by client and by employee | LIVE |
| Recurring visits: several recurring tasks per client, each with its own rule, planned ahead | LIVE |
| Crews: several people on one visit, each with their own time | LIVE |
| Employee app (in the phone's browser; an unlisted iPhone app waits for Apple's approval): today's visits, the team's schedule | LIVE |
| Check-in and check-out per person, per visit | LIVE |
| Before and after photos on every visit | LIVE |
| Time on site per person against the planned time | LIVE |
| Map of visits and sites | LIVE (15 Nov) |
| Checklists in route order (the visit's tasks in the order you walk the site) | LIVE (15 Nov). Show the order, never ticks as proof |
| Floor plans per site | LIVE (15 Nov) |
| Location guides | UNKNOWN (15 Nov) |
| Auto-plan (patterns suggested from past visits) | UNKNOWN (15 Nov) |
| Needs-attention checks | UNKNOWN (15 Nov) |
| Issue reports from the site to the office | BUILT (15 Nov) |
| Voice to text on a visit | BUILT (15 Nov) |
| GPS position at check-in | BUILT (not working since June; fix in the platform's backlog) |
| Shift offers: an employee hands a shift on, a colleague takes it | BUILT |
| Bookings: a client books extra work | BUILT |
| Inspections, facility status, premises status reports | BUILT |

## People

| Capability | Status |
|---|---|
| Staff records and access by position | LIVE (15 Nov) |
| Employee availability | LIVE (15 Nov) |
| Time off: employees ask in the app, the office decides | LIVE |
| Tests: training checked in the app | LIVE |
| Guide acknowledgement (employee confirms they read a guide) | BUILT (15 Nov) |
| Employee surveys | BUILT (15 Nov) |
| Candidates (hiring) | BUILT (15 Nov) |
| Confidential channel | BUILT (15 Nov) |
| Org chart | BUILT (15 Nov) |
| Office news | BUILT (15 Nov) |
| Courses | BROKEN (15 Nov). Never mention |

## Logistics

| Capability | Status |
|---|---|
| Stock: items by storage, movements, low-stock levels | LIVE |
| Purchase orders to suppliers | BUILT (15 Nov) |
| Deliveries to client sites | BUILT (15 Nov) |
| Laundry pickups | BUILT (15 Nov) |
| Employee stock view in the app | BUILT (15 Nov) |
| Loadout packs | UNKNOWN (15 Nov) |

## Sales & CRM

Never called "Outreach" on the site.

| Capability | Status |
|---|---|
| Lead lists | LIVE |
| Find leads in the company register | LIVE (15 Nov) |
| Call log: every call on record | LIVE |
| Call recording turned into notes | LIVE (15 Nov) |
| Meeting recording turned into a summary and notes | LIVE |
| Proposals sent as a link, and seen when the client opens them | LIVE |
| Electronic signatures on documents | LIVE (not linked to deals) |
| Public tenders found for you, and analysed by an assistant | LIVE (15 Nov; none turned into a deal yet, so never claim that) |
| Pricing setup (price lists, window times) | BUILT (15 Nov) |
| Competitors board | BUILT (15 Nov) |
| Deals pipeline (won and lost) | BUILT (stages do not yet close a deal) |
| Lead to client conversion | BUILT |
| Reminders and follow-ups | BUILT (made, not closed) |
| Yearly price adjustment letters | BUILT |
| Email sequences | BUILT. Never market: unsolicited electronic marketing is forbidden (Markedsføringsloven § 10) |

## Communication

| Capability | Status |
|---|---|
| Chat between office and employees | LIVE |
| Notifications to employees | LIVE |
| Email inbox inside the platform | LIVE (15 Nov) |
| WhatsApp with employees | LIVE (15 Nov) |
| Email extras (scheduled send, rules, labels, quick replies) | BUILT (15 Nov) |
| Client surveys | BUILT (15 Nov) |

## Client portal

| Capability | Status |
|---|---|
| Client portal: the client sees their visits and the photos from them | UNKNOWN (15 Nov: views are not recorded). Shown by Frederik's decision of 15 Nov 2026, with the test company's data; claim only what it does |
| Client messages | BUILT (15 Nov) |
| Client deliveries | BUILT (15 Nov) |
| Client reports, client feedback | BUILT |

## AI assistants

Shown by Frederik's decision of 15 Nov 2026: a menu entry and a section on the platform overview, never the hero. A person approves every step.

| Capability | Status |
|---|---|
| Assistants that propose work; a person approves before anything reaches a client | LIVE |
| Call briefs prepared before a call | LIVE (15 Nov) |
| Tenders found and analysed | LIVE (15 Nov) |
| Advisory board | LIVE (15 Nov) |
| Setup assistant | LIVE (15 Nov) |
| Flows and templates | LIVE (15 Nov) |
| Lessons (assistants learn from what a person rejected) | LIVE (15 Nov) |
| Verified facts | LIVE (15 Nov) |
| Assistant reports | LIVE (15 Nov) |

## The office

| Capability | Status |
|---|---|
| Personal calendar with Google sync | LIVE (15 Nov) |
| Audit log | LIVE (15 Nov) |
| Command palette | UNKNOWN (15 Nov) |

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
