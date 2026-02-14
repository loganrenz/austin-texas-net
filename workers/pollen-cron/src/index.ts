/**
 * Pollen Cron Worker
 *
 * Standalone Cloudflare Worker that runs on a daily cron schedule.
 * Calls the austin-texas.net pollen ingest endpoints to refresh D1 data.
 *
 * Secrets (set via `wrangler secret put`):
 *   INGEST_API_KEY  — matches the pollenIngestKey in the Nuxt app
 *
 * Vars (set in wrangler.json or dashboard):
 *   INGEST_URL — base URL of the Nuxt app (e.g., https://austin-texas.net)
 */

interface Env {
  INGEST_API_KEY: string
  INGEST_URL: string
}

export default {
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ) {
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

    // Ingest from AustinCedar.com
    const cedarPromise = fetch(`${baseUrl}/api/pollen/ingest-cedar`, {
      method: 'POST',
      headers,
    }).then(async (res) => {
      const body = await res.text()
      if (!res.ok) {
        console.error(`AustinCedar ingest failed (${res.status}): ${body}`)
      } else {
        console.log(`AustinCedar ingest success: ${body}`)
      }
    }).catch((err) => {
      console.error(`AustinCedar ingest error: ${err.message}`)
    })

    // Ingest from KXAN (existing endpoint)
    const kxanPromise = fetch(`${baseUrl}/api/pollen/ingest`, {
      method: 'POST',
      headers,
    }).then(async (res) => {
      const body = await res.text()
      if (!res.ok) {
        console.error(`KXAN ingest failed (${res.status}): ${body}`)
      } else {
        console.log(`KXAN ingest success: ${body}`)
      }
    }).catch((err) => {
      console.error(`KXAN ingest error: ${err.message}`)
    })

    // Run both in parallel, don't let one failure block the other
    ctx.waitUntil(Promise.allSettled([cedarPromise, kxanPromise]))
  },
}
