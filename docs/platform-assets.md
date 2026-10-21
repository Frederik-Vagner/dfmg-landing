# Platform Landing — Content Brief

Everything needed to make the platform pages production-ready.
Each item has: what it is, where it goes, and how to create it.

---

## Screenshots (8 needed)

Take these from your actual platform. Use a clean tenant with realistic data.
Recommended: 1440x900 browser window, crop to content area (no browser chrome).
Export as WebP, keep under 200KB each. Save to `/images/platform/`.

| # | Filename | What to capture | Where it goes | Tips |
|---|----------|----------------|---------------|------|
| 1 | `dashboard.webp` | Admin dashboard with calendar widget, recent tasks, KPIs | Homepage hero, Demo page sidebar | Show a week with real-looking tasks across multiple clients |
| 2 | `calendar-week.webp` | Calendar week view with color-coded tasks + employee assignments | Features → Core Operations | Pick a busy week, multiple employees visible |
| 3 | `client-detail.webp` | Client detail page showing location guide sections | Features → Client Management | Expand at least one guide section so content is visible |
| 4 | `employee-mobile.webp` | Employee portal on mobile — task list or today view | Features → Employee Management | Use browser DevTools mobile emulation (iPhone 14 Pro) |
| 5 | `billing-overview.webp` | Billing overview with invoice list, statuses, e-Faktura badge | Features → Financial Suite | Show mix of draft/sent/paid invoices |
| 6 | `payroll-run.webp` | Payroll run detail with employee entries | Features → Payroll | Show calculated amounts, not empty state |
| 7 | `inventory-list.webp` | Inventory list with stock levels + storage location badges | Features → Inventory | Include a few low-stock warnings for visual interest |
| 8 | `offer-detail.webp` | Offer detail page with cleaning scheme or PDF preview | Features → CRM & Sales | Show the professional PDF output if possible |
| 9 | `analytics-kpi.webp` | Task KPI dashboard or profitability analytics charts | Features → Documents & Analytics | Show graphs with data, not empty charts |

**Bonus screenshots (nice to have):**
- Client portal view (what your clients see)
- Org diagram
- Document template builder
- Floor plan view
- Inspection checklist on mobile

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

**Write this yourself — it's your story. Template:**

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

**If you don't have external customers yet**, write your own as the first customer. You ARE the case study. Your service company running on the platform is the proof.

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
- If you have permission from Soho, Adnami, Kgl. Haveselskab (already on service site), reuse them
- If not, skip the client logos for now — the "used by DFMG" line is enough

**Integration logos (create or source):**
- Google Calendar icon
- Slack icon
- BankConnect logo (or generic bank icon)
- e-Faktura / NemHandel logo
- IMAP/Email icon

These are already shown as Font Awesome icons which works fine as placeholder.

---

## OG Image (1 needed)

**Where it goes:** All platform pages `<meta property="og:image">`

**Current problem:** Points to the tiny logo.png (30x30). LinkedIn/Twitter will show a blank or broken preview.

**What to create:**
- 1200x630px image (standard OG size)
- Content: "DFMG Platform" headline + dashboard screenshot + logo
- Save as `/images/platform/og-image.jpg`
- Update all 7 platform pages' `og:image` meta tag

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

- [ ] Screenshot 1: Dashboard
- [ ] Screenshot 2: Calendar week view
- [ ] Screenshot 3: Client detail + location guide
- [ ] Screenshot 4: Employee mobile view
- [ ] Screenshot 5: Billing overview
- [ ] Screenshot 6: Payroll run
- [ ] Screenshot 7: Inventory list
- [ ] Screenshot 8: Offer detail
- [ ] Screenshot 9: Analytics KPI
- [ ] Product video (60-90s Loom)
- [ ] Founder testimonial text
- [ ] Founder photo (or reuse frederik.webp)
- [ ] Metrics: hours saved, completion %, employee count, client count
- [ ] OG image (1200x630)
- [ ] Architecture diagram
- [ ] Customer testimonials x3 (can wait for external customers)
- [ ] Client/integration logos (can use FA icons for now)
