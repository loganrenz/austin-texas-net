/**
 * Dynamic sitemap URLs for austin-texas.net
 *
 * Auto-generates URLs from the server-side category registry
 * (server/utils/siteCategories.ts) plus dynamic neighborhood slugs
 * from the D1 database. No manual URL lists to maintain.
 */
import { neighborhoodsTable } from '~~/server/database/schema'
import { siteCategories } from '~~/server/utils/siteCategories'

export default defineEventHandler(async () => {
  const now = new Date().toISOString()

  // ── Dynamic neighborhood slugs from DB ───────────────────
  let neighborhoodSlugs: string[] = []
  try {
    const db = useDatabase()
    const rows = await db.select({ slug: neighborhoodsTable.slug }).from(neighborhoodsTable).all()
    neighborhoodSlugs = rows.map((r) => r.slug)
  } catch {
    // Table might not exist yet during dev — return empty
  }

  // ── Homepage ─────────────────────────────────────────────
  const urls: Array<{
    loc: string
    changefreq: string
    priority: number
    lastmod: string
  }> = [{ loc: '/', changefreq: 'daily', priority: 1.0, lastmod: now }]

  // ── Category landing pages + live sub-apps ───────────────
  for (const cat of siteCategories) {
    urls.push({
      loc: `/${cat.slug}/`,
      changefreq: 'weekly',
      priority: cat.priority ?? 0.9,
      lastmod: now,
    })

    for (const app of cat.subApps) {
      if (app.status !== 'live') continue
      urls.push({
        loc: `/${cat.slug}/${app.slug}/`,
        changefreq: app.changefreq ?? 'weekly',
        priority: app.priority ?? 0.8,
        lastmod: now,
      })
    }
  }

  // ── Neighborhoods (dynamic from DB) ──────────────────────
  for (const slug of neighborhoodSlugs) {
    urls.push({
      loc: `/neighborhoods/${slug}/`,
      changefreq: 'monthly',
      priority: 0.6,
      lastmod: now,
    })
  }

  return urls
})
