---
description: SEO Architecture Policy for Austin-Texas.net — mandatory constraints for URL structure, page quality, hierarchy, technical discipline, and content standards.
---

# Austin-Texas.net — SEO Architecture Policy (v1)

These are **hard constraints**, not suggestions. Every page, component, and route must comply.

---

## 1. URL Structure Is Law

- Use **one domain only** — no subdomains.
- Structure:
  ```
  /category/
  /category/tool/
  ```
- **Never change URLs once published.**
- No duplicate paths for the same content.

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
