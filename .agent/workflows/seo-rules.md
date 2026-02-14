---
description: SEO Architecture Policy for Austin-Texas.net — mandatory constraints for URL structure, page quality, hierarchy, technical discipline, and content standards.
---

# Austin-Texas.net — SEO Architecture Policy (v2)

These are **hard constraints**, not suggestions. Every page, component, and route must comply.

---

## 1. URL Structure Is Law

- Use **one domain only** — no subdomains.
- Structure follows a strict two-level hierarchy:
  ```
  /category/
  /category/sub-page/
  ```
- Canonical category tree:

  ```
  /allergies/
  ├── /allergies/cedar-pollen-today/
  ├── /allergies/pollen-forecast/
  ├── /allergies/mold-levels/
  └── /allergies/history/

  /outdoors/
  ├── /outdoors/lake-travis-water-temp/
  ├── /outdoors/lake-levels/
  ├── /outdoors/swimming-holes/
  └── /outdoors/bluebonnet-map/

  /food/
  ├── /food/breakfast-tacos/
  ├── /food/bbq/
  ├── /food/best-restaurants/
  └── /food/food-trucks/

  /events/
  ├── /events/this-weekend/
  ├── /events/concerts/
  ├── /events/festivals/
  └── /events/calendar/

  /real-estate/
  ├── /real-estate/median-home-price/
  ├── /real-estate/neighborhood-guide/
  └── /real-estate/new-listings/

  /culture/
  ├── /culture/live-music-venues/
  ├── /culture/museums/
  └── /culture/parks/
  ```

- **Never change URLs once published.**
- No duplicate paths for the same content.
- New categories may be added via **Radar analysis** — each must follow the same hub + child pattern.

---

## 2. Every Page Has a Clear Purpose

Each page **must** have:

- 1 primary keyword theme
- 1 `<h1>` only
- A unique `<title>` tag
- A unique `<meta name="description">` tag

No generic or duplicate titles. No placeholder meta.

---

## 3. Hierarchy Must Be Obvious

Linking rules:

- **Homepage** → links to all categories
- **Category pages** → links to all child pages
- **Child pages** → link back to parent category
- Light cross-linking between related categories

Build a clean authority pyramid.

---

## 4. Categories Are Ranking Surfaces

Every category page must include:

- **150–300 focused words** of unique content
- Internal links to **all** child tools/pages
- Future sections clearly labeled **"Coming Soon"**

Thin is fine. Unstructured is not.

---

## 5. Technical Discipline

- Auto-generate `sitemap.xml`
- Submit to Google Search Console
- Add `Organization` + `WebSite` JSON-LD schema
- Add `Breadcrumb` schema to category pages
- Fast load times are mandatory (target < 2s LCP)

---

## 6. No Dead Ends

- No broken links
- No empty pages without explanation
- If unfinished → mark clearly **"Launching Soon"**

---

## Core Principle

> **Clarity > volume. Structure > content. Consistency > cleverness.**
>
> Break these rules and future growth gets expensive.
