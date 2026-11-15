# Platform assets checklist

The illustrations, video and other assets the platform pages still need. Each item has: what it is, where it goes, and how to create it. The copy brief is [brief-platform.md](brief-platform.md).

These are for Frederik to supply. Testimonials, metrics and quotes come from real people and real data only; the marketing agent never drafts them.

---

## Illustrations (decided 15 Nov 2026)

No screenshots of the platform on the site: no screenshots, screen recordings or copies of its layout, field names, menus or data. The five screenshots taken on 11 Nov 2026 (`/images/platform/*.webp`) are deleted in the PR that removes their last use (the platform overview, which also switches the home page's two shots to illustrations).

Each picture is a simple illustration in the site's own style that shows the idea, not the screen: inline SVG in `_includes/illustrations/`, drawn with the site's colour tokens (see `css/components/platform.css`), with no words, numbers or logos in it, so one drawing serves both languages. The alt text, in the page's language, says what the drawing shows. Where a picture adds nothing, the section shows an outcome line with an icon instead.

Numbers follow the old screenshot slots (S10 became I10), so pages and this list map one to one. Until a drawing exists, the page shows a marked placeholder with its number; a page merges only when its placeholders are gone (see [brief-platform.md](brief-platform.md)).

| No. | Shows (the idea) | Visual | Used on |
|---|---|---|---|
| I01 | A calendar with three visits in different colours and an hours bar beside it | Illustration | Operations, overview (office), Home |
| I03 | A rule chip with a repeat arrow, and the same visit on Tuesday and Thursday across three weeks | Illustration | Operations, Cleaning |
| I04 | Each person on a crew keeps their own time | Outcome line (people icon) | Operations, Cleaning |
| I05 | A request card on a calendar day with approve and decline marks | Illustration | People |
| I06 | A phone with today's visits as three rows | Illustration | Operations, overview (employee app), Home |
| I07 | A phone with a large check-in button and a clock | Illustration | Operations |
| I08 | A phone with chat bubbles and a small photo in one of them | Illustration | Communication |
| I09 | Tell the team once, in one place | Outcome line (megaphone icon) | Communication |
| I10 | Two photo frames, before (dull) and after (bright), with an arrow between | Illustration | Operations, Home, Cleaning |
| I11 | Bars per person: planned time and actual time side by side | Illustration | Operations, overview (operations) |
| I12 | See which visits run over, week by week | Outcome line (chart icon) | Operations |
| I13 | Who has passed the test, before the first visit | Outcome line (badge icon) | People |
| I14 | Three storages (van, cupboard, room) with boxes on shelves | Illustration | Logistics, overview (logistics) |
| I15 | A box with a level gauge under its line and a warning mark | Illustration | Logistics |
| I16 | A list of rows with A, B and C priority dots | Illustration | Sales |
| I17 | Every call on record, beside its lead | Outcome line (phone icon) | Sales |
| I18 | A note with three to-do lines and a microphone | Illustration | Sales |
| I19 | A proposal sheet with an open-eye mark | Illustration | Sales, overview (sales) |
| I21 | A document with a signature line and a pen | Illustration | Sales |
| I22 | Every step logged, and a person can undo it | Outcome line (history icon) | AI assistants |
| I23 | Three cards in a column, each with an approve and a reject mark | Illustration | AI assistants, overview (assistants) |
| I24 | One client card with three service chips in different colours, each on its own rhythm | Illustration | Facility service |
| I25 | Three buildings with visit dots under one administrator | Illustration | Property service |
| I25b | The administrator sees every property's visits | Outcome line (building icon) | Property service |
| I26 | A portal card listing three visits | Illustration | Home, Facility service |
| I27 | A portal card with one visit and two photos | Illustration | Overview (client portal) |
| I28 | A short brief card beside a phone | Illustration | AI assistants |
| I29 | A document with a magnifier and a fit bar | Illustration | AI assistants, Sales |
| I30 | A map with three pins and a route between them | Illustration | Operations |
| I31 | Know who can work before you plan | Outcome line (calendar icon) | People |
| I32 | A floor plan with numbered route dots 1, 2, 3 | Illustration | Operations, Property service |
| I33 | Three people cards, each with a three-step access mark (none, view, edit) | Illustration | People, overview (people) |
| I34 | An envelope linked to a client card | Illustration | Communication, overview (communication) |
| I35 | WhatsApp with your employees, from the office | Outcome line (chat icon, no WhatsApp logo) | Communication |
| I36 | A magnifier over a row of company buildings | Illustration | Sales |
| I37 | Three speech bubbles around one decision card | Illustration | AI assistants |
| I38 | A box with one arrow in and one arrow out | Illustration | Logistics |
| I39 | Two cards, before and after, with an arrow between | Illustration | AI assistants |

## Product Video (on hold)

**On hold (15 Nov 2026):** a screen recording shows the real platform, which the site no longer shows. Nothing below is made while that rule holds; an animated illustration of one visit could take its place.

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
- Content: "DFMG Platform" headline + the calendar illustration (I01) + logo, no screenshot
- Save as `/images/platform/og-image.jpg`
- Point the `og.image` front matter of all 9 platform pages, in both languages, at it

**Quick version:** The calendar illustration (I01) in a 1200x630 frame with the logo in a corner.

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

- [ ] Illustrations I01–I39 (see the list above); screenshots are no longer used
- [ ] Product video: on hold (it would show the real platform)
- [ ] Founder testimonial text
- [ ] Founder photo (or reuse frederik.webp)
- [ ] Metrics: hours saved, completion %, employee count, client count
- [ ] OG image (1200x630)
- [ ] Architecture diagram
- [ ] Customer testimonials x3 (can wait for external customers)
- [ ] Client/integration logos (can use FA icons for now)
