---
description: Authoritative tech stack reference for austin-texas.net — every dependency, what it does, and where it's used.
---

# Tech Stack — Austin-Texas.net

This document is the single source of truth for every technology used in this project. Reference it before adding dependencies, choosing patterns, or making architectural decisions.

---

## Runtime & Framework

| Package      | Version | Role                                                                                                                                               |
| ------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nuxt`       | ^4.3.0  | Meta-framework — SSR, file-based routing, auto-imports, Nitro server engine. Runs in Nuxt 4 compatibility mode (`future.compatibilityVersion: 4`). |
| `vue`        | ^3.5.27 | Reactivity core. Used via Nuxt — never import `createApp` directly.                                                                                |
| `vue-router` | ^4.6.4  | Client-side routing. Managed by Nuxt's `pages/` directory convention — no manual router config.                                                    |

---

## UI & Styling

| Package       | Version | Role                                                                                                                                                              |
| ------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@nuxt/ui`    | ^4.3.0  | Component library (buttons, cards, modals, form inputs, etc.). Provides the design system — always prefer `<UButton>`, `<UCard>`, `<UBadge>`, etc. over raw HTML. |
| `tailwindcss` | ^4.1.18 | Utility-first CSS. v4 — configured via `app/assets/css/main.css`, NOT `tailwind.config.js`.                                                                       |
| `@nuxt/fonts` | ^0.11.4 | Auto-loads Google Fonts with zero config. Handles `font-display`, preloading, and subsetting.                                                                     |

### Rules

- **Never use raw HTML elements** (`<button>`, `<input>`) when a Nuxt UI component exists.
- **Never use inline hex/rgb colors** — use Tailwind classes or CSS variables.
- Color mode preference is `light` by default (`nuxt.config.ts → colorMode.preference`).

---

## Data & Database

| Package       | Version | Role                                                                                                               |
| ------------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| `drizzle-orm` | ^0.45.1 | Type-safe SQL ORM for Cloudflare D1. Schema defined in `server/database/schema.ts`. Migrations live in `drizzle/`. |

### Database Details

- **Provider**: Cloudflare D1 (SQLite-based)
- **Binding name**: `DB`
- **Database name**: `austin-cedar-pollen-db`
- **Schema location**: `server/database/schema.ts`
- **DB helper**: `server/database/index.ts` — exports the Drizzle instance
- **Utility**: `server/utils/database.ts` — database access helper
- **Migrations**:
  - `drizzle/0000_initial_schema.sql`
  - `drizzle/0001_pollen_readings.sql`
  - `drizzle/0002_radar_keywords.sql`

### Rules

- Always use Drizzle ORM for queries — never write raw SQL in API routes.
- Schema changes require a new numbered migration file in `drizzle/`.

---

## Data Visualization

| Package       | Version | Role                                                                 |
| ------------- | ------- | -------------------------------------------------------------------- |
| `chart.js`    | ^4.5.1  | Charting engine — renders canvas-based charts (line, bar, etc.).     |
| `vue-chartjs` | ^5.3.3  | Vue 3 wrapper for Chart.js — use `<Line>`, `<Bar>`, etc. components. |

### Rules

- Always use `vue-chartjs` components, never call `Chart.js` constructors directly.

---

## Validation

| Package | Version | Role                                                                                 |
| ------- | ------- | ------------------------------------------------------------------------------------ |
| `zod`   | ^3.24.0 | Runtime schema validation. Use for API request/response validation and form schemas. |

### Rules

- All API endpoints should validate input with Zod schemas.
- Prefer Zod over manual `if` checks for any structured data.

---

## SEO & Structured Data

| Package           | Version | Role                                                                                                                        |
| ----------------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| `nuxt-schema-org` | ^5.0.10 | JSON-LD structured data. Auto-generates `WebSite`, `Organization`, etc. schema. Configured in `nuxt.config.ts → schemaOrg`. |
| `@nuxtjs/sitemap` | ^7.6.0  | Auto-generates `/sitemap.xml`. Dynamic URLs sourced from `/api/sitemap-urls`.                                               |
| `@nuxtjs/robots`  | ^5.7.0  | Generates `robots.txt`. Currently disallows `/admin/` routes.                                                               |

### SEO Composable

- `app/composables/usePageSeo.ts` — reusable head/meta helper for per-page SEO.

---

## Analytics

| Package      | Version  | Role                                                                                                            |
| ------------ | -------- | --------------------------------------------------------------------------------------------------------------- |
| `posthog-js` | ^1.342.1 | Product analytics & event tracking. Initialized as a client-side Nuxt plugin (`app/plugins/posthog.client.ts`). |

### Config Keys (via `runtimeConfig.public`)

- `posthogPublicKey` — PostHog project API key
- `gaMeasurementId` — Google Analytics GA4 measurement ID

---

## Hosting & Infrastructure

| Tool                        | Version       | Role                                                                                          |
| --------------------------- | ------------- | --------------------------------------------------------------------------------------------- |
| `wrangler`                  | ^4.20.0       | Cloudflare CLI — deploys to Cloudflare Pages, manages D1 databases, binds secrets.            |
| `@cloudflare/workers-types` | ^4.20250620.0 | TypeScript definitions for Cloudflare Workers runtime (included via `tsconfig.json → types`). |

### Deployment

- **Platform**: Cloudflare Pages with `cloudflare-pages` Nitro preset
- **Build output**: `dist/`
- **Deploy command**: `nuxt build && node scripts/patch-cf-process-proxy.mjs && wrangler pages deploy dist`
- **Compatibility flags**: `nodejs_compat_v2`
- **Compatibility date**: `2025-07-15`
- **Post-build script**: `scripts/patch-cf-process-proxy.mjs` — patches Cloudflare process proxy before deploy

### Environment Variables

| Variable                | Scope  | Purpose                    |
| ----------------------- | ------ | -------------------------- |
| `JWT_SECRET`            | Server | Auth token signing         |
| `GOOGLE_POLLEN_API_KEY` | Server | Google Pollen API          |
| `POLLEN_INGEST_KEY`     | Server | Pollen data ingestion auth |
| `SITE_URL`              | Public | Canonical site URL         |
| `GA_MEASUREMENT_ID`     | Public | Google Analytics 4         |
| `POSTHOG_PUBLIC_KEY`    | Public | PostHog analytics          |
| `APP_NAME`              | Public | Display name               |

---

## Package Manager & Overrides

- **Package manager**: `pnpm`
- **Module system**: ESM (`"type": "module"`)
- **Override**: `@cloudflare/unenv-preset` pinned to `2.12.1` (Cloudflare compatibility fix)

---

## Server-Side Utilities

| File                            | Purpose                        |
| ------------------------------- | ------------------------------ |
| `server/utils/auth.ts`          | JWT auth helpers               |
| `server/utils/database.ts`      | D1/Drizzle database access     |
| `server/utils/google-pollen.ts` | Google Pollen API client       |
| `server/utils/kxan-scraper.ts`  | KXAN weather data scraper      |
| `server/utils/pollen.ts`        | Pollen data processing         |
| `server/utils/rateLimit.ts`     | API rate limiting              |
| `server/utils/requireAdmin.ts`  | Admin route guard              |
| `server/utils/radar/`           | Radar SEO intelligence modules |

### Radar Modules (`server/utils/radar/`)

| File              | Purpose                             |
| ----------------- | ----------------------------------- |
| `autocomplete.ts` | Google autocomplete query expansion |
| `classify.ts`     | Keyword → category classification   |
| `geo.ts`          | Austin geo-relevance scoring        |
| `intent.ts`       | Search intent analysis              |
| `scoring.ts`      | Composite keyword scoring           |
| `seeds.ts`        | Seed keyword generation             |
| `types.ts`        | Shared Radar TypeScript types       |

---

## API Routes

| Route                     | Purpose                                                          |
| ------------------------- | ---------------------------------------------------------------- |
| `server/api/health.get`   | Health check endpoint                                            |
| `server/api/sitemap-urls` | Dynamic sitemap URL source                                       |
| `server/api/pollen/`      | Pollen data CRUD (4 endpoints)                                   |
| `server/api/live/`        | Live data endpoints (pollen, water, events)                      |
| `server/api/auth/`        | Auth endpoints (login, signup, logout, refresh, me, Apple OAuth) |
| `server/api/radar/`       | Radar SEO endpoints (keywords, ingest, brief, queue, stats)      |

---

## NPM Scripts Reference

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm preview      # Preview production build locally
pnpm generate     # Static site generation
pnpm deploy       # Build + patch + deploy to Cloudflare Pages
pnpm typecheck    # Run TypeScript type checking
pnpm lint         # ESLint on app/ directory
pnpm postinstall  # Auto-runs nuxt prepare after install
```

---

## Build-Time Injections

Defined in `nuxt.config.ts → vite.define`:

- `__BUILD_TIME__` — ISO timestamp of the build
- `__APP_VERSION__` — Version from `package.json` (currently `1.0.0`)

---

## Key Architectural Decisions

1. **Nuxt 4 compatibility mode** — uses `future.compatibilityVersion: 4` for latest features.
2. **Cloudflare-native** — D1 for data, Pages for hosting, Workers-compatible runtime.
3. **Drizzle over raw SQL** — type-safe queries, migration-based schema evolution.
4. **Nuxt UI as the sole component library** — no mixing with other UI kits.
5. **Tailwind v4** — CSS-first config, no JS config file.
6. **PostHog for analytics** — client-side only, via Nuxt plugin.
7. **Zod for validation** — runtime safety on all API boundaries.
8. **Radar as internal SEO engine** — keyword discovery, classification, and scoring pipeline.
