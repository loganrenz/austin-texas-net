/**
 * Real Estate Cron Worker
 *
 * Standalone Cloudflare Worker that runs on a monthly cron schedule (16th).
 * Calls the austin-texas.net real estate ingest endpoints to refresh D1.
 *
 * Secrets (set via `wrangler secret put`):
 *   INGEST_API_KEY  — matches the ingestApiKey in the Nuxt app
 *
 * Vars (set in wrangler.json or dashboard):
 *   INGEST_URL — base URL of the Nuxt app
 */

interface Env {
  INGEST_API_KEY: string
  INGEST_URL: string
}

async function callIngest(baseUrl: string, path: string, headers: Record<string, string>, label: string) {
  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers,
    })
    const body = await res.text()
    if (!res.ok) {
      console.error(`${label} ingest failed (${res.status}): ${body}`)
    }
    else {
      console.warn(`${label} ingest success: ${body}`)
    }
  }
  catch (err: unknown) {
    console.error(`${label} ingest error: ${(err as Error).message}`)
  }
}

export default {
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    const baseUrl = env.INGEST_URL || 'https://austin-texas.net'
    const apiKey = env.INGEST_API_KEY

    if (!apiKey) {
      console.error('INGEST_API_KEY secret not set')
      return
    }

    const headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    }

    // Run all 4 ingest endpoints in parallel
    ctx.waitUntil(
      Promise.allSettled([
        callIngest(baseUrl, '/api/real-estate/home-prices/ingest', headers, 'Home Prices'),
        callIngest(baseUrl, '/api/real-estate/market-trends/ingest', headers, 'Market Trends'),
        callIngest(baseUrl, '/api/real-estate/rent-trends/ingest', headers, 'Rent Trends'),
        callIngest(baseUrl, '/api/real-estate/developments/ingest', headers, 'Developments'),
      ]),
    )
  },
}
