---
description: Full-stack anti-pattern audit for Austin-Texas.net — architecture, UI, SEO, performance, data, and analytics checks with ranked findings and actionable fixes.
---

# Anti-Pattern Audit — Austin-Texas.net

A structured, repeatable audit to detect architecture, UI, SEO, performance, data, and analytics anti-patterns across the codebase. Run it periodically or before any major release.

> **Guiding principle**: Nuxt UI first. Drizzle for data. Zod for validation. No URL chaos. Clarity > cleverness.

---

## Phase 1 — Build Health Baseline

Run the full toolchain and capture every failure before auditing code.

```bash
pnpm i
pnpm typecheck
pnpm lint
pnpm build
```

Record: total errors, total warnings, file/line for each. This is the "Build Health" snapshot — all subsequent phases assume a green build unless noted.

---

## Phase 2 — Architecture Boundaries

Scan for violations of the Nuxt/Vue layering conventions defined in `/project-vision`.

| Anti-Pattern                  | Where to Look                                                                                              | Fix                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Business logic in `pages/`    | `app/pages/**/*.vue` — any file > ~50 LOC of non-template code                                             | Extract to `app/composables/` or `server/utils/` |
| Duplicated logic across pages | Two or more pages importing the same inline helpers                                                        | Create a shared composable                       |
| Missing composables           | Repeated `useFetch`/`useAsyncData` calls with identical config                                             | Wrap in a purpose-named composable               |
| Side effects in components    | `onMounted` doing fetches or mutations inside reusable components                                          | Move to page-level or composable                 |
| Non-deterministic SSR         | Code paths that behave differently server vs. client without `<ClientOnly>` or `import.meta.client` guards | Add guards or move to client plugin              |
| Manual router config          | Any `router.addRoute` or hand-written route objects                                                        | Use file-based routing (`pages/` directory)      |

**Output**: a "Move/Extract Plan" listing each violation → proposed new file path.

---

## Phase 3 — UI System (Nuxt UI / Tailwind v4)

Enforce the component-first rules from `/ui-values` and `/tech-stack`.

| Anti-Pattern                                                  | Detection                                                                      | Fix                                                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Raw `<button>`, `<input>`, `<select>`, `<textarea>`, `<form>` | `grep -rn '<button\|<input\|<select\|<textarea\|<form' app/ --include='*.vue'` | Replace with `UButton`, `UInput`, `USelect`, `UTextarea`, `UForm` (see `/nuxt-ui-audit` for full mapping) |
| Inline hex/rgb colors                                         | `grep -rn '#[0-9a-fA-F]\{3,8\}\|rgb(' app/ --include='*.vue'`                  | Use Tailwind classes or CSS variables                                                                     |
| Ad-hoc spacing (`style="margin..."`)                          | `grep -rn 'style=' app/ --include='*.vue'`                                     | Use Tailwind spacing utilities                                                                            |
| Inconsistent component variants                               | Manual review of `UButton`, `UBadge` etc. for mixed `color`/`variant` usage    | Standardize on project-wide variant conventions                                                           |
| Custom CSS when tokens exist                                  | Scan `<style>` blocks for properties Tailwind can handle                       | Replace with utility classes                                                                              |

Full element-by-element mapping lives in `/nuxt-ui-audit`. Run that workflow for the detailed scan.

---

## Phase 4 — SEO Policy Compliance

Enforce the hard constraints from `/seo-rules` for every route.

| Check                        | How                                                                      | Violation                                |
| ---------------------------- | ------------------------------------------------------------------------ | ---------------------------------------- |
| Exactly one `<h1>` per page  | `grep -c '<h1' app/pages/**/*.vue`                                       | 0 or 2+ h1 tags                          |
| Unique `<title>`             | Inspect every `useHead` / `useSeoMeta` / `usePageSeo` call               | Duplicate or missing titles              |
| Unique `<meta description>`  | Same as above                                                            | Duplicate or placeholder descriptions    |
| Canonical correctness        | Check for `<link rel="canonical">` or Nuxt SEO module config             | Missing or wrong canonical               |
| Breadcrumb + schema          | Verify `BreadcrumbList` JSON-LD on category pages                        | Missing structured data                  |
| No duplicate/competing paths | Compare `pages/` directory routes against canonical tree in `/seo-rules` | Route aliases, plural/singular conflicts |
| Sitemap sanity               | `curl /sitemap.xml` and diff against `pages/`                            | Missing or extra URLs                    |

---

## Phase 5 — Server/API + Validation

Audit `server/api/` and `server/utils/` against the standards in `/tech-stack`.

| Anti-Pattern                 | Detection                                                                                                  | Fix                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Missing Zod validation       | API handler reads `body`/`query` without a Zod `.parse()`                                                  | Add Zod schema + `readValidatedBody` / `getValidatedQuery`      |
| Inconsistent response shapes | Compare `return` statements across endpoints                                                               | Standardize on `{ data, error }` or similar envelope            |
| No rate limiting             | Check for `rateLimit` usage in public endpoints                                                            | Wrap with `server/utils/rateLimit.ts`                           |
| Raw SQL strings              | `grep -rn 'sql\`\|\.raw(' server/ --include='\*.ts'`                                                       | Rewrite with Drizzle query builder                              |
| Leaky secrets                | `grep -rn 'process.env\|import.meta.env' server/ --include='*.ts'` — any not going through `runtimeConfig` | Move to `runtimeConfig`                                         |
| Weak error handling          | `try/catch` blocks that swallow errors or return generic 500s                                              | Return structured error responses with appropriate status codes |

---

## Phase 6 — Data & D1/Drizzle

| Anti-Pattern                  | Detection                                                         | Fix                                               |
| ----------------------------- | ----------------------------------------------------------------- | ------------------------------------------------- |
| N+1 query patterns            | Loop containing a DB call inside `server/api/` handlers           | Batch with `.where(inArray(...))` or joins        |
| Missing indexes               | Cross-reference `WHERE`/`ORDER BY` columns against schema indexes | Add index in schema + new migration               |
| Schema drift                  | Compare `server/database/schema.ts` against latest migration      | Generate and apply migration                      |
| Heavy queries without caching | Expensive aggregations called on every request                    | Add `defineCachedFunction` or Nitro cache headers |
| Missing migration discipline  | Schema changes without a corresponding `drizzle/XXXX_*.sql` file  | Create numbered migration                         |

---

## Phase 7 — Performance

| Anti-Pattern             | Detection                                                                                         | Fix                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Large client bundles     | `pnpm build` → inspect `.output/public/_nuxt/` for large chunks                                   | Code-split or lazy-import                            |
| Non-lazy components      | `grep -rn 'import.*from.*components' app/ --include='*.vue'` (static imports of heavy components) | Use `defineAsyncComponent` or `<LazyXyz>`            |
| Over-eager data fetching | Multiple `useFetch` calls on a single page that could be batched                                  | Consolidate into one endpoint or composable          |
| Duplicated fetches       | Same URL fetched in both a component and its parent page                                          | Lift fetch to parent, pass as prop or provide/inject |
| Missing cache headers    | Nitro API routes without `setResponseHeaders` for cacheable data                                  | Add `Cache-Control` / `s-maxage`                     |
| Heavy chart rendering    | Chart.js rendering on SSR or without lazy load                                                    | Wrap in `<ClientOnly>` + lazy import                 |

---

## Phase 8 — Analytics (PostHog / GA)

Enforce client-only analytics from `/tech-stack`.

| Anti-Pattern           | Detection                                                                                                          | Fix                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| Tracking calls in SSR  | `posthog.capture` or `gtag` in `server/` or without `import.meta.client` guard                                     | Move to client plugin or guard with `import.meta.client` |
| Duplicate init         | Multiple `posthog.init()` or GA snippet inclusions                                                                 | Single init in `app/plugins/posthog.client.ts`           |
| Noisy/low-value events | Events firing on every scroll, mousemove, or trivial interaction                                                   | Remove or throttle aggressively                          |
| PII in event payloads  | `grep -rn 'posthog.capture\|posthog.identify' app/ --include='*.ts' --include='*.vue'` — check for email, name, IP | Strip PII; use anonymous IDs                             |

---

## Output Format

After running all phases, produce a single report:

### Top 10 Anti-Patterns

Rank findings by **Impact × Effort**:

| #   | Anti-Pattern | Impact (1–5) | Effort (1–5) | Files | Why It Matters | Fix         |
| --- | ------------ | ------------ | ------------ | ----- | -------------- | ----------- |
| 1   | ...          | ...          | ...          | ...   | ...            | Exact steps |

### Top 3 High-Leverage Refactors

Identify the three changes that will cut the most LOC and reduce future maintenance drag.

### Auto-Enforcement Proposals

Propose concrete lint rules and CI checks to prevent regressions:

- ESLint: `no-raw-html-elements` (already exists in `eslint-plugins/`) — verify it covers all elements from `/nuxt-ui-audit`
- ESLint: `no-select-empty-value` (already exists) — verify active
- New rule ideas (if gaps found)
- CI: add `pnpm typecheck && pnpm lint` to GitHub Actions (verify in `.github/workflows/`)
