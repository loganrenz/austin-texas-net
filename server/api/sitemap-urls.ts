/**
 * Dynamic sitemap URLs for austin-texas.net
 *
 * All live pages must be listed here. The @nuxtjs/sitemap module
 * merges these with auto-discovered routes.
 */
import { neighborhoodsTable } from '~~/server/database/schema'

export default defineEventHandler(async () => {
  const now = new Date().toISOString()

  // ── Dynamic neighborhood slugs from DB ───────────────────
  let neighborhoodSlugs: string[] = []
  try {
    const db = useDatabase()
    const rows = await db.select({ slug: neighborhoodsTable.slug })
      .from(neighborhoodsTable)
      .all()
    neighborhoodSlugs = rows.map(r => r.slug)
  }
  catch {
    // Table might not exist yet during dev — return empty
  }

  return [
    // ── Homepage ──────────────────────────────────────────
    { loc: '/', changefreq: 'daily', priority: 1.0, lastmod: now },

    // ── Category landing pages ───────────────────────────
    { loc: '/food/', changefreq: 'weekly', priority: 0.9, lastmod: now },
    { loc: '/events/', changefreq: 'weekly', priority: 0.9, lastmod: now },
    { loc: '/outdoors/', changefreq: 'weekly', priority: 0.9, lastmod: now },
    { loc: '/health/', changefreq: 'weekly', priority: 0.9, lastmod: now },
    { loc: '/weather/', changefreq: 'weekly', priority: 0.9, lastmod: now },
    { loc: '/more/', changefreq: 'weekly', priority: 0.8, lastmod: now },
    { loc: '/live-data/', changefreq: 'weekly', priority: 0.8, lastmod: now },
    { loc: '/real-estate/', changefreq: 'weekly', priority: 0.9, lastmod: now },
    { loc: '/neighborhoods/', changefreq: 'weekly', priority: 0.9, lastmod: now },
    { loc: '/culture/', changefreq: 'weekly', priority: 0.8, lastmod: now },
    { loc: '/fun/', changefreq: 'weekly', priority: 0.8, lastmod: now },

    // ── Food (live) ──────────────────────────────────────
    { loc: '/food/breakfast-tacos/', changefreq: 'weekly', priority: 0.8, lastmod: now },
    { loc: '/food/bbq/', changefreq: 'weekly', priority: 0.8, lastmod: now },
    { loc: '/food/coffee-shops/', changefreq: 'weekly', priority: 0.8, lastmod: now },
    { loc: '/food/food-trucks/', changefreq: 'weekly', priority: 0.8, lastmod: now },
    { loc: '/food/happy-hours/', changefreq: 'weekly', priority: 0.8, lastmod: now },
    { loc: '/food/restaurant-map/', changefreq: 'weekly', priority: 0.8, lastmod: now },

    // ── Events (live) ────────────────────────────────────
    { loc: '/events/sxsw/', changefreq: 'monthly', priority: 0.9, lastmod: now },

    // ── Outdoors (live) ──────────────────────────────────
    { loc: '/outdoors/bluebonnets/', changefreq: 'daily', priority: 0.8, lastmod: now },

    // ── Health (live) ────────────────────────────────────
    { loc: '/health/cedar-pollen/', changefreq: 'daily', priority: 0.9, lastmod: now },

    // ── Weather (live) ───────────────────────────────────
    { loc: '/weather/current-conditions/', changefreq: 'hourly', priority: 0.9, lastmod: now },
    { loc: '/weather/radar/', changefreq: 'hourly', priority: 0.9, lastmod: now },
    { loc: '/weather/7-day-forecast/', changefreq: 'daily', priority: 0.8, lastmod: now },
    { loc: '/weather/heat-index/', changefreq: 'daily', priority: 0.8, lastmod: now },
    { loc: '/weather/freeze-alerts/', changefreq: 'daily', priority: 0.8, lastmod: now },
    { loc: '/weather/drought-status/', changefreq: 'weekly', priority: 0.7, lastmod: now },

    // ── Live Data (live) ─────────────────────────────────
    { loc: '/live-data/water-temps/', changefreq: 'hourly', priority: 0.8, lastmod: now },
    { loc: '/live-data/lake-levels/', changefreq: 'hourly', priority: 0.8, lastmod: now },

    // ── Real Estate (live) ───────────────────────────────
    { loc: '/real-estate/market-trends/', changefreq: 'weekly', priority: 0.8, lastmod: now },
    { loc: '/real-estate/median-home-prices/', changefreq: 'weekly', priority: 0.8, lastmod: now },
    { loc: '/real-estate/property-tax-guide/', changefreq: 'monthly', priority: 0.7, lastmod: now },
    { loc: '/real-estate/new-developments/', changefreq: 'weekly', priority: 0.7, lastmod: now },
    { loc: '/real-estate/rent-trends/', changefreq: 'weekly', priority: 0.8, lastmod: now },
    { loc: '/real-estate/housing-map/', changefreq: 'weekly', priority: 0.8, lastmod: now },

    // ── Neighborhoods (dynamic from DB) ──────────────────
    ...neighborhoodSlugs.map(slug => ({
      loc: `/neighborhoods/${slug}/`,
      changefreq: 'monthly' as const,
      priority: 0.6,
      lastmod: now,
    })),
  ]
})
