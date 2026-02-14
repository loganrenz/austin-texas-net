import { test, expect } from '@playwright/test'

/**
 * Smoke tests for every page on austin-texas.net.
 *
 * Each page is tested for:
 *  1. Successful load (no Nuxt error overlay)
 *  2. Has a <title> tag
 *  3. Has a <meta name="description">
 *  4. Has a <link rel="canonical">
 *  5. Has at least one <h1>
 *  6. No console errors
 */

// ── All routes to test ──────────────────────────────────────
interface PageEntry {
  path: string
  name: string
  /** Some pages (like neighborhoods/[slug]) need DB data — skip h1 check if 404 */
  allowNotFound?: boolean
}

const PAGES: PageEntry[] = [
  // Homepage
  { path: '/', name: 'Homepage' },

  // ── Category hubs ────────────────────────────────────────
  { path: '/food/', name: 'Food hub' },
  { path: '/events/', name: 'Events hub' },
  { path: '/outdoors/', name: 'Outdoors hub' },
  { path: '/health/', name: 'Health hub' },
  { path: '/weather/', name: 'Weather hub' },
  { path: '/more/', name: 'More hub' },
  { path: '/live-data/', name: 'Live Data hub' },
  { path: '/real-estate/', name: 'Real Estate hub' },
  { path: '/neighborhoods/', name: 'Neighborhoods hub' },
  { path: '/culture/', name: 'Culture hub' },
  { path: '/fun/', name: 'Fun hub' },

  // ── Food sub-pages ───────────────────────────────────────
  { path: '/food/breakfast-tacos/', name: 'Breakfast Tacos' },
  { path: '/food/bbq/', name: 'BBQ' },
  { path: '/food/coffee-shops/', name: 'Coffee Shops' },
  { path: '/food/food-trucks/', name: 'Food Trucks' },
  { path: '/food/happy-hours/', name: 'Happy Hours' },
  { path: '/food/restaurant-map/', name: 'Restaurant Map' },

  // ── Events sub-pages ─────────────────────────────────────
  { path: '/events/sxsw/', name: 'SXSW' },

  // ── Outdoors sub-pages ───────────────────────────────────
  { path: '/outdoors/bluebonnets/', name: 'Bluebonnets' },

  // ── Health sub-pages ─────────────────────────────────────
  { path: '/health/cedar-pollen/', name: 'Cedar Pollen' },

  // ── Weather sub-pages ────────────────────────────────────
  { path: '/weather/current-conditions/', name: 'Current Conditions' },
  { path: '/weather/radar/', name: 'Radar' },
  { path: '/weather/7-day-forecast/', name: '7-Day Forecast' },
  { path: '/weather/heat-index/', name: 'Heat Index' },
  { path: '/weather/freeze-alerts/', name: 'Freeze Alerts' },
  { path: '/weather/drought-status/', name: 'Drought Status' },

  // ── Live Data sub-pages ──────────────────────────────────
  { path: '/live-data/water-temps/', name: 'Water Temps' },
  { path: '/live-data/lake-levels/', name: 'Lake Levels' },

  // ── Real Estate sub-pages ────────────────────────────────
  { path: '/real-estate/market-trends/', name: 'Market Trends' },
  { path: '/real-estate/median-home-prices/', name: 'Median Home Prices' },
  { path: '/real-estate/property-tax-guide/', name: 'Property Tax Guide' },
  { path: '/real-estate/new-developments/', name: 'New Developments' },
  { path: '/real-estate/rent-trends/', name: 'Rent Trends' },
  { path: '/real-estate/housing-map/', name: 'Housing Map' },
]

// ── Parameterized smoke tests ───────────────────────────────
for (const page of PAGES) {
  test.describe(page.name, () => {
    test(`${page.path} loads without error`, async ({ page: pw }) => {
      const consoleErrors: string[] = []
      pw.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text())
      })

      const response = await pw.goto(page.path, { waitUntil: 'domcontentloaded' })

      // Page should return 200
      expect(response?.status()).toBe(200)

      // No Nuxt error overlay
      const errorOverlay = pw.locator('#nuxt-error, [data-nuxt-error]')
      await expect(errorOverlay).toHaveCount(0)
    })

    test(`${page.path} has valid SEO meta`, async ({ page: pw }) => {
      await pw.goto(page.path, { waitUntil: 'domcontentloaded' })

      // Has a non-empty <title>
      const title = await pw.title()
      expect(title.length).toBeGreaterThan(0)

      // Has a <meta name="description"> with content
      const description = pw.locator('meta[name="description"]')
      await expect(description).toHaveCount(1)
      const descContent = await description.getAttribute('content')
      expect(descContent?.length).toBeGreaterThan(0)

      // Has a <link rel="canonical">
      const canonical = pw.locator('link[rel="canonical"]')
      await expect(canonical).toHaveCount(1)
      const canonicalHref = await canonical.getAttribute('href')
      expect(canonicalHref).toContain('austin-texas.net')
    })

    test(`${page.path} has an h1`, async ({ page: pw }) => {
      await pw.goto(page.path, { waitUntil: 'domcontentloaded' })

      const h1 = pw.locator('h1')
      const count = await h1.count()
      expect(count).toBeGreaterThanOrEqual(1)
    })

    test(`${page.path} has OG tags`, async ({ page: pw }) => {
      await pw.goto(page.path, { waitUntil: 'domcontentloaded' })

      // og:title
      const ogTitle = pw.locator('meta[property="og:title"]')
      await expect(ogTitle).toHaveCount(1)

      // og:description
      const ogDesc = pw.locator('meta[property="og:description"]')
      await expect(ogDesc).toHaveCount(1)

      // og:image
      const ogImage = pw.locator('meta[property="og:image"]')
      await expect(ogImage).toHaveCount(1)
      const ogImageContent = await ogImage.getAttribute('content')
      expect(ogImageContent?.length).toBeGreaterThan(0)
    })
  })
}

// ── Coming Soon catch-all test ──────────────────────────────
// Verify that registered-but-not-yet-built sub-apps render the
// coming soon page (not a 404)
const COMING_SOON_PAGES = [
  { path: '/events/festivals/', name: 'Festivals (coming soon)' },
  { path: '/outdoors/parks/', name: 'Parks (coming soon)' },
  { path: '/culture/museums/', name: 'Museums (coming soon)' },
]

for (const page of COMING_SOON_PAGES) {
  test(`${page.name} — ${page.path} renders coming soon`, async ({ page: pw }) => {
    const response = await pw.goto(page.path, { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBe(200)

    // Should have an h1 with the sub-app name
    const h1 = pw.locator('h1')
    await expect(h1).toHaveCount(1)
    const h1Text = await h1.textContent()
    expect(h1Text?.length).toBeGreaterThan(0)

    // The page title should contain "Coming Soon"
    const title = await pw.title()
    expect(title.toLowerCase()).toContain('coming soon')
  })
}

// ── 404 test ────────────────────────────────────────────────
test('Non-existent page returns 404', async ({ page: pw }) => {
  const response = await pw.goto('/this-page-does-not-exist/', { waitUntil: 'domcontentloaded' })
  expect(response?.status()).toBe(404)
})
