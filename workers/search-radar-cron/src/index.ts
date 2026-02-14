/**
 * Search Radar Cron Worker
 *
 * Standalone Cloudflare Worker that runs on an hourly cron schedule.
 * Calls the austin-texas.net search radar ingest endpoint to refresh
 * keyword data in D1.
 *
 * Secrets (set via `wrangler secret put`):
 *   INGEST_API_KEY  — matches the ingestApiKey in the Nuxt app
 *
 * Vars (set in wrangler.json or dashboard):
 *   INGEST_URL — base URL of the Nuxt app (e.g., https://austin-texas.net)
 */

interface Env {
  INGEST_API_KEY: string
  INGEST_URL: string
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

    const radarPromise = fetch(`${baseUrl}/api/radar/ingest`, {
      method: 'POST',
      headers,
    })
      .then(async (res) => {
        const body = await res.text()
        if (!res.ok) {
          console.error(`Search radar ingest failed (${res.status}): ${body}`)
        } else {
          console.warn(`Search radar ingest success: ${body}`)
        }
      })
      .catch((err) => {
        console.error(`Search radar ingest error: ${err.message}`)
      })

    ctx.waitUntil(radarPromise)
  },
}
