---
description: Audit Vue files for raw HTML that should be replaced with Nuxt UI 4 components — buttons, inputs, links, cards, badges, separators, icons, tables, modals, and layout primitives.
---

# Nuxt UI 4 Adoption Audit

Scan all `.vue` files under `app/` for raw HTML elements that have a direct Nuxt UI 4 replacement. Report each violation with file, line, the raw element found, and the recommended Nuxt UI component.

## HTML → Nuxt UI Mapping

| Raw HTML                                         | Nuxt UI 4 Component                                             | Notes                                                                                                                                                   |
| ------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<button>`                                       | `<UButton>`                                                     | All interactive buttons must use UButton. Includes `type="submit"`.                                                                                     |
| `<a>` / `<NuxtLink>`                             | `<ULink>` or `<UButton to="...">`                               | ULink for inline text links. UButton with `to` for button-styled links. Keep `<NuxtLink>` only inside custom components where ULink is not appropriate. |
| `<input>`                                        | `<UInput>` / `<UInputNumber>` / `<UInputDate>` / `<UInputTime>` | Match input type to the right component.                                                                                                                |
| `<textarea>`                                     | `<UTextarea>`                                                   | All multi-line text inputs.                                                                                                                             |
| `<select>`                                       | `<USelect>` / `<USelectMenu>`                                   | USelectMenu for searchable/advanced selects.                                                                                                            |
| `<input type="checkbox">`                        | `<UCheckbox>`                                                   | Or `<UCheckboxGroup>` for sets.                                                                                                                         |
| `<input type="radio">`                           | `<URadioGroup>`                                                 | Always use group variant.                                                                                                                               |
| `<table>`                                        | `<UTable>`                                                      | All data tables.                                                                                                                                        |
| `<img>`                                          | `<UAvatar>` (for avatars)                                       | Only applies to avatar/profile images. Regular content images are fine as `<img>`.                                                                      |
| `<span class="badge">` or similar badge patterns | `<UBadge>`                                                      | Any status/label chip.                                                                                                                                  |
| `<hr>`                                           | `<USeparator>`                                                  | Horizontal rules.                                                                                                                                       |
| `<kbd>`                                          | `<UKbd>`                                                        | Keyboard shortcuts.                                                                                                                                     |
| `<dialog>` or custom modal divs                  | `<UModal>` / `<UDrawer>` / `<USlideover>`                       | All overlays.                                                                                                                                           |
| `<details>` / `<summary>`                        | `<UAccordion>` / `<UCollapsible>`                               | Expandable panels.                                                                                                                                      |
| `<nav>` with manual link lists                   | `<UNavigationMenu>`                                             | Structured navigation.                                                                                                                                  |
| `<ol>` / `<ul>` used as tabs                     | `<UTabs>`                                                       | Tab-like navigation patterns.                                                                                                                           |
| `<progress>`                                     | `<UProgress>`                                                   | Progress indicators.                                                                                                                                    |
| `<form>`                                         | `<UForm>`                                                       | Forms with validation.                                                                                                                                  |
| `<label>` + error markup                         | `<UFormField>`                                                  | Field wrappers with label/error/description.                                                                                                            |
| `<div>` as card container                        | `<UCard>`                                                       | When pattern matches header/body/footer card layout.                                                                                                    |
| `<header>` (page-level)                          | `<UHeader>`                                                     | Site header/navbar.                                                                                                                                     |
| `<footer>` (page-level)                          | `<UFooter>`                                                     | Site footer.                                                                                                                                            |
| `<main>`                                         | `<UMain>`                                                       | Main content wrapper.                                                                                                                                   |
| `<div class="container">`                        | `<UContainer>`                                                  | Centered content constraint.                                                                                                                            |
| Inline `<svg>` icons                             | `<UIcon>`                                                       | All icons should come from Iconify via UIcon.                                                                                                           |
| Tooltip `title` attributes                       | `<UTooltip>`                                                    | Proper accessible tooltips.                                                                                                                             |
| Custom breadcrumb markup                         | `<UBreadcrumb>`                                                 | Breadcrumb navigation.                                                                                                                                  |
| Custom pagination markup                         | `<UPagination>`                                                 | Page navigation.                                                                                                                                        |
| Custom skeleton/loading CSS                      | `<USkeleton>`                                                   | Loading placeholders.                                                                                                                                   |

## Audit Steps

1. **Scan for raw elements.** For each rule in the table above, run a grep across `app/` for the raw HTML pattern:

   ```bash
   # Buttons
   grep -rn '<button' app/ --include='*.vue'
   # Native inputs
   grep -rn '<input' app/ --include='*.vue'
   # Native textareas
   grep -rn '<textarea' app/ --include='*.vue'
   # Native selects
   grep -rn '<select' app/ --include='*.vue'
   # Native tables
   grep -rn '<table' app/ --include='*.vue'
   # Anchor tags (not already ULink/UButton)
   grep -rn '<a ' app/ --include='*.vue'
   # Inline SVGs
   grep -rn '<svg' app/ --include='*.vue'
   # Horizontal rules
   grep -rn '<hr' app/ --include='*.vue'
   # Native forms
   grep -rn '<form' app/ --include='*.vue'
   # Native progress
   grep -rn '<progress' app/ --include='*.vue'
   # Details/summary
   grep -rn '<details' app/ --include='*.vue'
   # Dialog elements
   grep -rn '<dialog' app/ --include='*.vue'
   # Kbd elements
   grep -rn '<kbd' app/ --include='*.vue'
   # Title attribute tooltips
   grep -rn 'title="' app/ --include='*.vue'
   ```

2. **Exclude false positives.** Ignore:
   - Raw elements inside `<template>` of Nuxt UI component wrappers (e.g., slot content).
   - `<img>` tags used for content images (not avatars).
   - `<a>` inside markdown/prose rendered content.
   - Elements inside `node_modules/` or `.nuxt/`.
   - HTML comments.

3. **Report findings.** For each violation, output:
   - **File**: relative path
   - **Line**: line number
   - **Found**: the raw element
   - **Replace with**: the Nuxt UI 4 component
   - **Severity**: `high` (buttons, inputs, forms, links) / `medium` (tables, badges, separators) / `low` (kbd, progress, tooltips)

4. **Prioritize high-severity items.** Buttons and form inputs are the most impactful — they affect accessibility, theming, and interaction consistency across the entire app.

5. **Suggest migration.** For each finding, provide a brief code snippet showing the before/after replacement using the correct Nuxt UI component API.

## Example Output

```
HIGH  app/pages/login.vue:42
  Found:    <button type="submit" class="btn-primary">Sign In</button>
  Replace:  <UButton type="submit" color="primary" label="Sign In" />

HIGH  app/components/HomeHero.vue:18
  Found:    <a href="/food/" class="link">Food & Drink</a>
  Replace:  <ULink to="/food/">Food & Drink</ULink>

MED   app/pages/index.vue:95
  Found:    <hr class="my-8" />
  Replace:  <USeparator class="my-8" />
```
