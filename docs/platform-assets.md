# Platform assets checklist

The screenshots, video and other assets the platform pages still need. Each item has: what it is, where it goes, and how to create it. The copy brief is [brief-platform.md](brief-platform.md).

These are for Frederik to supply. Testimonials, metrics and quotes come from real people and real data only; the marketing agent never drafts them.

---

## Screenshots

Taken 11 Nov 2026 from the platform's local test company (seeded, invented clients and people marked "(FAKE)"), never from real data. Desktop at 1440 px and phone at 390 px, both at 2x, the office shots cropped to the page area (no sidebar), the UI in English. Added with `npm run photo` into `/images/platform/`.

| Slot | File | Shows |
|---|---|---|
| home-hero, features-1 | `schedule-month.webp` | The schedule, a month of visits, hours per week |
| features-2 | `app-schedule-phone.webp` | Employee app, the week's visits (phone) |
| features-3 | `task-visit-proof.webp` | A completed visit: crew, check-in and check-out times, time report, checklist |
| features-4 | `inventory-stock.webp` | Inventory by type and storage, with value |
| home-walkthrough, features-5 | `app-home-phone.webp` | Employee app home: next visits (phone) |

### Screenshot numbers (15 Nov 2026)

Pages refer to shots by number. Until a shot exists, the page shows a marked placeholder with its number and what it will show, and uses one of the five shots above where it fits; a page merges only when its placeholders are gone (see [brief-platform.md](brief-platform.md)). Shots marked "seed" need data added to the test company first.

| No. | Shows | App · area | State |
|---|---|---|---|
| S01 | The schedule, a month | Office · Operations | Have: `schedule-month.webp` |
| S02 | The week by employee | Office · Operations | To take |
| S03 | A recurring rule and the visits it made | Office · Operations | To take |
| S04 | A visit with a crew of three, each with their own time | Office · Operations | To take |
| S05 | Time-off requests | Office · People | To take |
| S06 | Employee app home | Employee app · Operations | Have: `app-home-phone.webp` |
| S06b | Employee app, the week | Employee app · Operations | Have: `app-schedule-phone.webp` |
| S07 | A visit in progress on the phone, checked in | Employee app · Operations | To take |
| S08 | Chat about a visit, with a photo | Employee app · Communication | To take |
| S09 | Notifications | Employee app · Communication | To take |
| S10 | Before and after photos of one visit | Office · Operations | Seed (photo files) |
| S11 | A completed visit: crew, check-in and check-out, time report | Office · Operations | Have: `task-visit-proof.webp` |
| S12 | Planned against actual time for a week | Office · Operations | To take |
| S13 | A test result | Employee app · People | To take |
| S14 | Stock by type and storage, with value | Office · Logistics | Have: `inventory-stock.webp` |
| S15 | Two items under their low-stock level | Office · Logistics | To take |
| S16 | Lead list with priorities | Office · Sales & CRM | To take |
| S17 | Today's calls | Office · Sales & CRM | To take |
| S18 | Notes from a recorded meeting or call | Office · Sales & CRM | To take |
| S19 | A proposal as the client sees it | Public link · Sales & CRM | Seed (proposal) |
| S20 | The proposal's "viewed" time in the office | Office · Sales & CRM | Seed (proposal) |
| S21 | Signing status of a document | Office · Sales & CRM | To take |
| S22 | An assistant task with its log | Office · AI assistants | To take |
| S23 | Three items waiting for approval | Office · AI assistants | To take |
| S24 | One client with several services, each with its own rule | Office · Operations | Seed |
| S25 | Visits across one administrator's properties | Office · Operations | Seed |
| S25b | The administrator's visits in the client portal | Client portal | Seed |
| S26 | The client's visits in the client portal | Client portal | Seed (portal user) |
| S27 | One visit with its photos, as the client sees it | Client portal | Seed (portal user) |
| S28 | A call brief | Office · AI assistants | To take |
| S29 | A public tender with the assistant's analysis | Office · AI assistants | To take |
| S30 | The map with the day's visits | Office · Operations | To take |
| S31 | Employee availability | Employee app · People | To take |
| S32 | A site's floor plan and its checklist in route order | Employee app · Operations | To take |
| S33 | Staff records with positions and access | Office · People | To take |
| S34 | The email inbox, mail linked to a client | Office · Communication | To take |
| S35 | WhatsApp with an employee | Office · Communication | To take |
| S36 | Finding leads in the company register | Office · Sales & CRM | To take |
| S37 | The advisory board's views on a decision | Office · AI assistants | To take |

Never in a shot: real data, anything finance, BUILT or broken screens (deals board, inspections, courses, purchase orders), GPS, "coming soon" controls, and no ticked checklist used as proof.

To retake: run the platform's smoke-settings server on its own port against the `fake` schema, log in as the test company's administrator with the language set to English, and capture `main.app-main` only.

---

## Product Video (1 needed, critical)

**Where it goes:** Homepage hero + "See how it works" section + Demo page sidebar

**What to record:**
A 60-90 second Loom walkthrough showing one complete workflow:
1. Open the calendar → see today's visits (5 sec)
2. Click into a visit → show the crew and the site's floor plan (10 sec)
3. Switch to the employee app → check in, take before and after photos, check out (15 sec)
4. Back to the office → the completed visit with times and photos (10 sec)
5. The client portal → the client sees the visit and its photos (10 sec)

No invoicing step (finance is on hold) and no ticked checklist as proof.

**Tips:**
- No narration needed initially (add later). Just screen recording with cursor.
- Use the test company's data only (marked "(FAKE)"), never real data.
- Host on YouTube (unlisted) and embed, or use Loom embed.
- Thumbnail: use screenshot #1 (dashboard) with a play button overlay.

---

## Founder Testimonial (1 needed, critical)

**Where it goes:** Homepage → "How DFMG runs on DFMG Platform" section

**Frederik writes this himself, from his own experience. Template:**

> "Before I built the platform, I spent [X] hours every evening on admin — copying data between spreadsheets, chasing invoices, updating schedules. Now I manage [X] employees across [X] client locations and everything happens in one place. When a client calls with a question, I have the answer before they finish the sentence."

**Also needed:**
- Your name
- Your title (Founder, DFMG)
- Employee/client count
- A photo of you (candid > corporate headshot). Reuse from `/images/people/frederik.webp` or take a new one.

---

## Customer Testimonials (3 needed, can wait)

**Where they go:** Homepage testimonial cards + Pricing page

For each testimonial you need:
- Name + company name
- Employee count
- A specific result (not generic praise)
- Photo (optional but strongly recommended)

**Good testimonial formula:** "[Specific problem before] → [Specific result after using DFMG]"

Examples of what to ask customers:
- "What tools were you using before?"
- "How much time do you save per week?"
- "What's the one thing you couldn't do before?"

Only from real customers who have agreed to be quoted. Until there are any, the founder testimonial above and the "used by DFMG" line are the proof.

---

## Metrics (4 needed)

**Where they go:** Homepage metrics bar

Fill in from your actual platform data:

| Metric | Placeholder | How to find it |
|--------|-------------|----------------|
| Hours saved per week | `[X]h` | Estimate: time on admin before platform vs. now |
| On-time task completion | `[X]%` | Pull from your task KPI analytics dashboard |
| Employee count | `[X]` | Current active employees in your service company |
| Client count | `[X]` | Current active clients |

Also update the social proof bar:
- "Used daily by DFMG to manage **[X] employees** across **[X] client locations**"

---

## Logo Assets (4-6 needed)

**Where they go:** Homepage → social proof bar, integrations section

**Client/partner logos:**
- Only with the client's written permission
- Until then, skip client logos; the "used by DFMG" line is enough

**Integration logos (create or source):**
- Google Calendar icon
- Slack icon
- e-Faktura / NemHandel logo
- IMAP/Email icon

These are already shown as Font Awesome icons which works fine as placeholder.

---

## OG Image (1 needed)

**Where it goes:** All platform pages `<meta property="og:image">`

**Current state:** Every platform page uses the site-wide `/images/og-image.jpg` (1200x630). A platform version exists at `/images/platform/og-image.jpg` but no page uses it yet; decide whether it replaces the site-wide one on the platform pages.

**What to create:**
- 1200x630px image (standard OG size)
- Content: "DFMG Platform" headline + dashboard screenshot + logo
- Save as `/images/platform/og-image.jpg`
- Point the `og.image` front matter of all 9 platform pages, in both languages, at it

**Quick version:** Just put the dashboard screenshot in a 1200x630 frame with the logo in a corner.

---

## Architecture Diagram (1 needed)

**Where it goes:** About page → Technology section

**What to show:**
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Tenant A   │  │  Tenant B   │  │  Tenant C   │
│  schema_a   │  │  schema_b   │  │  schema_c   │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
              ┌─────────┴─────────┐
              │   DFMG Platform   │
              │  Django + ASGI    │
              │  Celery + Redis   │
              └─────────┬─────────┘
                        │
              ┌─────────┴─────────┐
              │   PostgreSQL      │
              │   (EU-hosted)     │
              └───────────────────┘
```

Can be a simple SVG or even a clean screenshot from a diagramming tool (Excalidraw, Mermaid, etc.)

---

## Content Checklist

- [x] Screenshots: schedule, visit, employee app (two), inventory
- [ ] Screenshot: proposal as the client sees it
- [ ] Screenshot: a visit with before and after photos
- [ ] Product video (60-90s Loom)
- [ ] Founder testimonial text
- [ ] Founder photo (or reuse frederik.webp)
- [ ] Metrics: hours saved, completion %, employee count, client count
- [ ] OG image (1200x630)
- [ ] Architecture diagram
- [ ] Customer testimonials x3 (can wait for external customers)
- [ ] Client/integration logos (can use FA icons for now)
