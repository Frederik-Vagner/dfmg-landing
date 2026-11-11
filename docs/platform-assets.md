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

Still to take:

- **features-6 (Win new work)**: a proposal as the client sees it. The test company has no deal with a proposal yet.
- **A visit with real before and after photos.** The test company's photo files do not exist locally, so the visit shot shows "No photos from this visit yet".
- **Finance shots (billing, payroll)**: dropped while finance is on hold (see [platform-capabilities.md](platform-capabilities.md)).

To retake: run the platform's smoke-settings server on its own port against the `fake` schema, log in as the test company's administrator with the language set to English, and capture `main.app-main` only.

---

## Product Video (1 needed, critical)

**Where it goes:** Homepage hero + "See how it works" section + Demo page sidebar

**What to record:**
A 60-90 second Loom walkthrough showing one complete workflow:
1. Open calendar → see today's tasks (5 sec)
2. Click into a task → show assignment, checklist, location guide link (10 sec)
3. Switch to employee view → show check-in, photo upload (10 sec)
4. Back to admin → show the completed task with time + photos (10 sec)
5. Generate invoice from tracked hours (10 sec)
6. Show client portal — client sees the report (10 sec)

**Tips:**
- No narration needed initially (add later). Just screen recording with cursor.
- Use real data, blur any sensitive info if needed.
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
