# CSS Migration Plan: Generic Card Naming System

## HOW TO EXECUTE THIS PLAN
This plan should be executed using **parallel agents** where possible. Steps 1A-1C can run in parallel. Step 2 has groups that can run in parallel. Step 3 depends on Steps 1+2 completing first.

---

## CONTEXT
The codebase uses content-specific card class names (`.card--service`, `.card--article`, `.card--featured`) creating duplication and maintenance issues. We're migrating to generic, composable names based on **visual pattern** not content type.

**Current branch:** `refactor-wip` (local only)
**Live site:** `main` branch is rolled back to pre-optimization commit `60aad9c`

---

## NAMING MAP

| Old Name | New Generic Name | Why |
|---|---|---|
| `.card--service` (in `css/styles.css`, the overlay version) | `.card--overlay` | Full-bleed image + dark overlay + white text on top |
| `.card--service` (in `css/components/hero-layouts.css`, the padded version) | `.card--accent` | White padded card with animated accent line on hover |
| `.card--article` | `.card--media` | Image slot + content block below |
| `.card--featured` | `.card--split` | Two-column grid layout |
| `.card--story` | `.card--bordered` | Left border accent stripe |
| `.card--horizontal` | `.card--horizontal` | Already generic, keep as-is |
| `.card--sidebar` | **(DELETE)** | 0 HTML usages |
| `.card--info` | **(DELETE)** | 0 HTML usages |
| `.card--stat` | **(DELETE)** | 0 HTML usages |
| `.transparency-card` | `.card` + utility classes | Has no CSS definition, just a class name in HTML |
| `.before-after-card` | `.card` + utility classes | Has no CSS definition |
| `.stat-card` | `.card` + utility classes | Has no CSS definition |
| `.fordele-card` | `.card` + utility classes | Has no CSS definition, generated via JS |

---

## STEP 1: CSS FILE CHANGES (can run 3 agents in parallel: 1A, 1B, 1C)

### STEP 1A: `css/styles.css`

**Rename these selectors** (find old name, replace with new name everywhere in this file):

1. `.card--service` → `.card--overlay` (including all sub-selectors like `.card--overlay img`, `.card--overlay .card__image`, `.card--overlay::after`, `.card--overlay h3`, `.card--overlay p`, `.card--overlay h3` specifics)
   - Located around lines 548-610 in styles.css

2. `.card--article` → `.card--media`
   - Located around line 613-620

3. `.card--featured` → `.card--split`
   - Located around lines 623-631

4. `.card--story` → `.card--bordered`
   - Located around lines 540-545

**Delete these unused selectors entirely:**

5. `.card--sidebar` block (around lines 634-640)
6. `.card--info` block (around lines 643-648)
7. `.card--stat` block (around lines 651-657)
8. `.stat--inline` block (around lines 726-731) — also unused

**Replace hardcoded values with CSS variables** in the renamed selectors:

In `.card--overlay` (was `.card--service`):
- `rgba(0, 0, 0, 0.4)` in `::after` → `var(--overlay-dark)` (already defined in `:root`)
- `border: var(--border-light)` — already uses variable, good
- `border-radius: var(--radius-normal)` — already uses variable, good

In `.card--media` (was `.card--article`):
- `border-radius: 20px` → `var(--radius-normal)`
- `box-shadow: 0 10px 25px rgba(0,0,0,0.08)` → leave as-is (no matching variable, unique value)
- `border: 1px solid #f1f5f9` → `var(--border-lighter)`

In `.card--split` (was `.card--featured`):
- `border-radius: 20px` → `var(--radius-normal)`
- `box-shadow: 0 20px 40px rgba(0,0,0,0.1)` → leave as-is

In `.card--bordered` (was `.card--story`):
- `border-radius: 12px` → `var(--radius-md)`

**Also remove unused utility classes:**
- `.bg-light-primary-10` through `.bg-light-red-10` (lines ~884-890) — 7 classes, none used in HTML
- `.bg-light-white` (line ~879) — nonsensical class

### STEP 1B: `css/components/hero-layouts.css`

**Rename** `.card--service` → `.card--accent` everywhere in this file:
- `.card--service` (line 65) → `.card--accent`
- `.card--service::before` (line 78) → `.card--accent::before`
- `.card--service:hover::before` (line 89) → `.card--accent:hover::before`
- In `@media` block: `.card--service` (line 170) → `.card--accent`

**Replace hardcoded values:**
- `border-radius: 24px` → `var(--radius-normal)` (standardize to 20px)
- `box-shadow: 0 15px 40px rgba(0,0,0,0.08)` → leave as-is
- `border: 1px solid #f1f5f9` → `var(--border-lighter)`

### STEP 1C: `css/components/article-listing.css` + `sustainability-carousel.css`

**In article-listing.css:**

1. Delete `.card--article` block (lines 7-14) — it's an exact duplicate of styles.css
2. Rename `.card--featured` → `.card--split` (lines 107-119), keep the `display: none` and `[data-featured-category]` logic
3. Rename `.card--featured` in `@media` block (line 358) → `.card--split`
4. Replace hardcoded values:
   - `border-radius: 24px` → `var(--radius-normal)`
   - `box-shadow: 0 20px 40px rgba(0,0,0,0.1)` → leave as-is

**In sustainability-carousel.css:**
5. Delete `.card-horizontal` block (lines 214-222) — duplicate of `.card--horizontal` in styles.css

**Delete file:**
6. Delete `css/styles-backup.css` entirely

---

## STEP 2: HTML FILE CHANGES (can run in parallel groups)

### IMPORTANT: For all renames, do exact string replacements. Don't touch anything else in the file.

### GROUP A (can run in parallel): Simple class renames

**File: `index.html`**
- Replace `card card--service` with `card card--overlay` (6 instances, around lines 112-137)

**File: `pages/services/rengøring.html`**
- Replace `card card--service` with `card card--overlay` (5 instances, around lines 65-161)
- Replace `transparency-card` with `card p-2` (4 instances, lines 319, 343, 361, 375)
  - Note: `transparency-card double-height` → `card p-2 double-height`
- Replace `before-after-card` with `card` (6 instances, lines 515-570)

**File: `pages/services/handyman.html`**
- Replace `card card--service` with `card card--accent` (6 instances, around lines 110-175)

**File: `pages/indblik/om.html`**
- Replace `card card--story` with `card card--bordered` (6 instances)

### GROUP B (can run in parallel): Article/listing page renames

**File: `pages/indblik/nyheder.html`**
- Replace `card--featured` with `card--split` (all instances)
- Replace `card--article` with `card--media` (all instances)

**File: `pages/indblik/indblik.html`**
- Replace `card--article` with `card--media` (all instances)

### GROUP C (can run in parallel): Non-BEM + inline style fixes

**File: `pages/indblik/cases/adnami.html`**
- Replace `stat-card` with `card p-2 text-center` (3 instances, lines 79, 84, 89)

**File: `pages/indblik/cases/kgl.html`**
- Replace `stat-card` with `card p-2 text-center` (3 instances, lines 79, 84, 89)

**File: `pages/indblik/cases/soho.html`**
- Replace `stat-card` with `card p-2 text-center` (3 instances, lines 79, 84, 89)

**File: `pages/services/services.html`**
- In the JS template string (around line 619), replace `fordele-card` with `card p-1`

**File: `pages/services/ejendomsservice.html`**
Fix duplicate `class` attributes (HTML can only have one `class` attr per element — merge them):
- Line 43: Remove `style="font-size: 3.5rem; font-weight: 300; line-height: 1.1; letter-spacing: -2px;"` → add classes `text-8xl font-light leading-tight tracking-tighter`
- Line 44: Remove `style="font-size: 1.3rem; opacity: 0.9;"` → add classes `text-2xl opacity-90`
- Line 61: Remove `style="gap: 1rem; flex-wrap: wrap; justify-content: center;"` → add classes `gap-1 flex-wrap justify-center`
- Line 66: Remove `style="background: transparent; color: white; border: 2px solid white; padding: 14px 28px; font-size: 1rem;"` → use existing class `btn--ghost btn--md` (`.btn--ghost` already sets white border/text, transparent-like bg)
- Line 74: Remove `style="gap: 1rem; justify-content: center"` → add classes `gap-1 justify-center`
- Line 202: Remove `style="font-size: 1.3rem; font-weight: 600;"` → add classes `text-2xl font-semibold`
- Line 303: Remove `style="font-size: 2.5rem; font-weight: 300; margin-bottom: 1rem;"` → add classes `text-6xl font-light mb-1`
- Line 304: Remove `style="font-size: 1.1rem; line-height: 1.6;"` → add classes `text-lg leading-normal`
- Lines 98-99, 113-114, 128-129, 143-144, 158-159, 173-174: Fix duplicate `class` attrs — merge into single `class` attribute

**File: `pages/services/produkter.html`**
- Line 45: Remove `style="font-size: 4rem;"` → add class `text-9xl`
- Line 46: Remove `style="font-size: 1.3rem;"` → add class `text-2xl`
- Line 110: Remove `style="margin-bottom: 5rem;"` → add class `mb-5`
- Line 112: Remove `style="font-size: 3rem; letter-spacing: -1px; font-weight: 300;"` → add classes `text-7xl tracking-tight font-light`
- Line 194: Remove `style="font-size: 1.1rem; margin: 0; font-weight: 600;"` → add classes `text-lg m-0 font-semibold`
- Line 250: Remove `style="font-style: italic;"` → add class `italic`
- Lines 395, 401, 407, 413: Remove `style="font-size: 1.3rem;"` → add class `text-2xl`

**File: `pages/services/vinduespudsning.html`**
- Line 44: Remove `style="font-size: 3.5rem; font-weight: 300; letter-spacing: -2px; line-height: 1;"` → add classes `text-8xl font-light tracking-tighter leading-none`

---

## STEP 3: FINAL CLEANUP (after Steps 1+2 are done)

### 3A: Fix BEM violations in `article-listing.css`
Replace these non-BEM selectors:
- `.article-image.sustainability` → `.article-image--sustainability`
- `.article-image.innovation` → `.article-image--innovation`
- `.article-image.insights` → `.article-image--insights`
- `.article-image.tips` → `.article-image--tips`
- `.article-image.cases` → `.article-image--cases`
- `.article-category.sustainability` → `.article-category--sustainability`
- `.article-category.innovation` → `.article-category--innovation`
- `.article-category.insights` → `.article-category--insights`
- `.article-category.tips` → `.article-category--tips`
- `.article-category.cases` → `.article-category--cases`

**Also update the corresponding HTML** in `nyheder.html` and `indblik.html` where these classes are used on elements.

### 3B: Fix BEM violations in related HTML for case pages
In `pages/indblik/cases/adnami.html`, `kgl.html`, `soho.html`:
- Fix duplicate `class` attributes on `<i>` elements (lines 103, 107, 111, 115): merge `class="fas fa-broom" class="mr-05"` → `class="fas fa-broom mr-05"`
- Remove `style="color:var(--primary)"` etc → use existing `text-primary`, `text-success`, `text-charcoal` utility classes
- Fix logo img `style="height:60px;max-width:200px"` → add utility classes or a `.company-logo` class (already exists in article-listing.css)

### 3C: Other inline style fixes
**File: `pages/services/picoline.html`**
- Line 329: `style="font-size: 2rem; margin-bottom: 1.5rem;"` → `text-5xl mb-15`
- Line 330: `style="font-size: 1.1rem; line-height: 1.6; max-width: 700px; margin: 0 auto;"` → `text-lg leading-normal max-w-700 m-auto`
- Line 383: `style="margin-top: 4rem;"` → `mt-4`
- Line 389: `style="font-size: 1.3rem; font-weight: 600;"` → `text-2xl font-semibold`

**File: `pages/services/handyman.html`**
- Line 260: `style="margin-bottom: 4rem;"` → `mb-4`
- Line 412: `style="width: 100px; height: 100px; border-radius: 50%;"` → add utility classes or keep as-is (unique dimensions)
- Line 414: `style="margin-bottom: 0.25rem;"` → `mb-05` (closest available)
- Line 415: `style="font-size: 0.9rem;"` → `text-base`

**File: `pages/kontakt.html`**
- Line 127: `style="width: 100%; box-sizing: border-box"` → `w-full` (box-sizing is already set globally)

**File: `pages/indblik/jobs.html`**
- Lines 200, 206, 212, 218: `style="font-size: 3rem; margin-bottom: 1.5rem; display: block;"` → `text-7xl mb-15 block`

**File: `pages/indblik/om.html`**
- Lines 48, 170: Large inline style blocks for placeholder divs → create a `.placeholder-portrait` utility or leave (these are temporary placeholders)

**File: `pages/components/footer.html`**
- Line 20: `style="padding: 20px 0;"` → leave as-is (component-specific)
- Line 50: `style="line-height: 1;"` → `leading-none`

**File: `pages/prisberegner.html`**
- Multiple inline styles are calculator-specific and scoped under `#price` — leave as-is (calculator.css handles these)

**File: `pages/sustainability/klimaS.html` and `socialS.html`**
- Line 44: `style="max-width: 1000px;"` → the `.slide-content-normal` class already has `max-width: 1200px`, close enough. Or use `.slide-content4` which is `max-width: 1000px`. Replace with `slide-content4` class.

---

## STEP 4: VERIFICATION CHECKLIST

After all changes, open each page on `localhost:8000` and verify:

1. `index.html` — Service carousel cards display with image overlay
2. `pages/services/rengøring.html` — Carousel + transparency section + before/after grid
3. `pages/services/handyman.html` — Service cards with accent hover effect
4. `pages/services/ejendomsservice.html` — Hero section typography, grid layout
5. `pages/services/produkter.html` — Hero typography, category cards, pricing tables
6. `pages/services/services.html` — Expanded content with fordele cards
7. `pages/services/vinduespudsning.html` — Hero typography
8. `pages/services/picoline.html` — Section headings, comparison layout
9. `pages/indblik/indblik.html` — Article media cards
10. `pages/indblik/nyheder.html` — Featured split cards + article media cards
11. `pages/indblik/om.html` — Story/bordered cards
12. `pages/indblik/cases/*.html` — Stat cards, icon colors
13. `pages/kontakt.html` — Submit button width
14. Check mobile responsive (768px) on all above pages

---

## FILE SUMMARY

### CSS files to modify (3):
- `css/styles.css`
- `css/components/hero-layouts.css`
- `css/components/article-listing.css`

### CSS files to clean up (1):
- `css/components/sustainability-carousel.css` (remove `.card-horizontal`)

### CSS files to delete (1):
- `css/styles-backup.css`

### HTML files to modify (18):
- `index.html`
- `pages/services/rengøring.html`
- `pages/services/handyman.html`
- `pages/services/ejendomsservice.html`
- `pages/services/produkter.html`
- `pages/services/vinduespudsning.html`
- `pages/services/services.html`
- `pages/services/picoline.html`
- `pages/indblik/indblik.html`
- `pages/indblik/nyheder.html`
- `pages/indblik/om.html`
- `pages/indblik/jobs.html`
- `pages/indblik/cases/adnami.html`
- `pages/indblik/cases/kgl.html`
- `pages/indblik/cases/soho.html`
- `pages/kontakt.html`
- `pages/components/footer.html`
- `pages/sustainability/klimaS.html` and `socialS.html`
