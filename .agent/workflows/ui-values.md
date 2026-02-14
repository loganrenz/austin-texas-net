---
description: Core UI values and design constraints for Austin-Texas.net — illustrated Texas heritage, live city utility, modern web performance.
---

# Core UI Values — Austin-Texas.net

The UI must communicate **Austin** from the first pixel. Not generic. Not sterile. Not another SaaS dashboard with a city name pasted on top. Every visual element exists to serve utility — but utility wrapped in confident, illustrated, unapologetically Texan design.

The rope-letter logo — with Texas star, cowboy hat, skyline, taco, guitar, bridge, beer, and bat — is the **brand anchor**. Every design choice must support and extend this visual system.

---

## Design Philosophy: Texas Heritage + Live City Utility + Modern Web Performance

Three forces in tension, balanced precisely:

| Pillar                | What It Means                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Texas Heritage**    | Rope textures, illustrated icons, warm earth tones, bold personality. The site looks like it _belongs_ to Austin. |
| **Live City Utility** | Real-time data, structured navigation, fast answers. Every page solves a problem or answers a question.           |
| **Modern Web Perf**   | Sub-2s LCP, lazy loading, skeleton states, SSR. Personality never comes at the cost of speed.                     |

---

## Visual Identity

### The Rope Aesthetic

The rope-letter logo system is the brand foundation. Its visual language extends throughout the site:

- **Illustrated header sections** — category and section headers may incorporate thematic illustrated elements drawn from the logo vocabulary (stars, skyline silhouettes, instrument outlines, food icons, bats)
- **Thematic iconography per category** — each category gets visual identity from a subset of the logo's illustrated elements, not generic Lucide icons alone
- **Warm, textured palette** — the color system supports the illustrated style with warm neutrals, amber/terracotta accents, and cool blues that echo the Austin sky and lake water
- **Confident typography** — large, bold display type for headers that commands attention

### What This Is NOT

- Not bland, rounded-corner card grids with teal buttons
- Not a generic "modern dashboard" with no soul
- Not a content blog with stock photos and white backgrounds
- Not a design where you could swap "Austin" for "Denver" and nobody would notice

---

## Color System

### Brand Palette

- **Primary**: Vibrant, warm tones — sunset amber, Hill Country sky blue, live oak green
- **Secondary**: Rich earth tones — terracotta, sage, leather brown, limestone
- **Accent**: Confident pops — lone star gold, neon sign pink (used for live indicators and CTAs)

### Per-Category Accents

Each category uses a distinct accent drawn from the brand palette, applied to:

- Icon tints and illustrated header elements
- Card hover states and subtle highlights
- Status indicators and badges

| Category      | Accent Family   |
| ------------- | --------------- |
| Food          | Amber / Warm    |
| Events        | Emerald / Live  |
| Outdoors      | Violet / Nature |
| Health        | Rose / Vital    |
| Weather       | Sky / Blue      |
| More          | Slate / Neutral |
| Live Data     | Cyan / Electric |
| Real Estate   | Teal / Grounded |
| Neighborhoods | Orange / Warm   |
| Culture       | Indigo / Deep   |
| Fun           | Pink / Playful  |

### Rules

- All colors via Tailwind/Nuxt UI semantic tokens — **never raw hex in templates**
- Status colors: `success` for live, `warning` for seasonal, `neutral` for coming soon
- Dark mode is secondary but must still feel like Austin, not a generic dark theme

---

## Typography

Two fonts, used with confidence:

| Font     | Use                                            |
| -------- | ---------------------------------------------- |
| `Outfit` | Display headings (h1, h2, h3), hero text, logo |
| `Inter`  | Body text, labels, navigation, UI chrome       |

### Scale

- `h1`: 2.25–2.75rem, `font-extrabold`, tight tracking — these should **command the page**
- `h2`: 1.5–1.75rem, `font-bold` — clear section anchors
- `h3`: 1.125rem, `font-semibold`
- Body: 0.875–1rem, `font-normal`

Typography must create clear visual hierarchy even before the user reads a word. Headings should feel like signage, not footnotes.

---

## Layout & Light-Theme Aesthetic

The site is **light-first**, vibrant and alive — not clinical or muted:

- **Full-viewport backgrounds**: Pages use full-viewport gradient washes (Hill Country palette: sky blue → sage green → warm stone) that wrap behind ALL content including the header and hero — no bare white zones
- **Backgrounds**: Warm, saturated tones — soft sage, limestone, sky wash — not sterile `#ffffff`. The page should feel like standing in the Hill Country, not staring at a spreadsheet
- **Shadows**: Layered, warm-toned shadows for depth — cards lift on hover with smooth transitions
- **Whitespace**: Generous spacing between sections. The page should breathe.
- **Borders**: Thin, warm borders for structure without heaviness
- **Illustrated sections**: Hero areas and section headers can use background illustrations, subtle silhouettes, or textured elements drawn from the logo vocabulary
- **No visual noise**: Personality is not clutter. Every illustrated element earns its place.
- **Vibrancy rule**: If a page looks like it could belong to any city, it's too dull. Austin is vibrant — the UI should be too.

---

## Micro-Interactions & Animation

Every interactive element must feel responsive and alive:

- **Cards**: Fade-up on viewport entry (staggered by index). Hover → subtle `translateY(-2px)` + shadow depth increase.
- **Links**: Color transition on hover (200ms ease). Underline reveal or arrow slide.
- **Live indicators**: Pulsing dot animation on live badges.
- **Skeleton loading**: All async data sections show skeleton states before data loads — never empty voids.
- **Page transitions**: Smooth `fade-up` / `fade-out` on route changes.
- **Scroll reveals**: Sections fade in as they enter the viewport.
- **Illustrated accents**: Subtle parallax or gentle movement on illustrated background elements (used sparingly — performance first).

---

## Illustrated Header Sections

A defining feature of the Austin-Texas.net aesthetic:

- Category landing pages lead with a **strong illustrated header** that visually identifies the category
- Header illustrations draw from the logo's vocabulary: skyline silhouettes, food icons, music motifs, nature elements, bats
- These are decorative but purposeful — they orient the user and reinforce brand identity
- Implementation: SVG illustrations or CSS illustrations, not raster images (performance)
- Hero sections may incorporate a **subtle Austin skyline silhouette** as a backdrop element

---

## Thematic Iconography

Move beyond generic icon sets:

- Each category gets a **thematic icon set** that draws from Austin's visual culture
- The Food category uses illustrated taco/BBQ/coffee motifs, not a generic fork icon
- The Events category uses guitar/music note/stage icons, not a generic calendar
- The Outdoors category uses hill country/water/sun motifs
- Icons should feel hand-drawn or illustrated when used in headers and cards, not flat and generic
- For functional UI elements (navigation, forms), standard Lucide icons are fine

---

## Clarity Over Cleverness

Navigation must be obvious. Categories must feel structured. Users should immediately understand where they are and what they can do next. No ambiguous labels. No buried actions. Personality amplifies clarity — it never obscures it.

## Speed as Quality

Fast load times are part of the brand. **Personality does not excuse performance debt.**

- Target < 2s LCP on all pages
- Illustrated elements use SVG or CSS, not heavy raster images
- Lazy-load below-fold content and illustrations
- Defer non-critical JS
- Skeleton loading for all async content

## Hierarchy Is Visible

Typography scale must clearly differentiate H1, H2, and H3. Headings should feel like bold signage. Sections should breathe. The page should scan easily in under 10 seconds.

## Consistency Builds Trust

Cards follow the same format. Status badges behave the same everywhere. Spacing, typography, icon style, and hover states must be predictable. Illustrated elements follow a consistent art style drawn from the logo system. Inconsistency signals immaturity. Predictability signals platform-level thinking.

---

## Social Previews & OG Images

The brand system extends to social sharing:

- OG images should feature the rope-letter logo or elements from its vocabulary
- Category-specific social cards use the category's illustrated header elements
- Preview images feel like _Austin-Texas.net_ even when seen on Twitter or iMessage
- Consistent typography (Outfit bold) and brand colors in all OG images

---

> The UI should feel like a **modern digital front porch for Austin** — confident, local, slightly loud, structured, and readable. Texas heritage + live city utility + modern web performance. If someone screenshots a page and removes the URL, you should still know it's Austin-Texas.net.
