/**
 * Live Data Cron Worker
 *
 * Standalone Cloudflare Worker that runs on an hourly cron schedule.
 * Calls the austin-texas.net live data ingest endpoints to refresh D1.
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

    // Ingest water temps from USGS
    const waterPromise = fetch(`${baseUrl}/api/live/water-temps/ingest`, {
      method: 'POST',
      headers,
    }).then(async (res) => {
      const body = await res.text()
      if (!res.ok) {
        console.error(`Water temps ingest failed (${res.status}): ${body}`)
      }
      else {
        console.log(`Water temps ingest success: ${body}`)
      }
    }).catch((err) => {
      console.error(`Water temps ingest error: ${err.message}`)
    })

    // Ingest lake levels from WaterDataForTexas
    const lakePromise = fetch(`${baseUrl}/api/live/lake-levels/ingest`, {
      method: 'POST',
      headers,
    }).then(async (res) => {
      const body = await res.text()
      if (!res.ok) {
        console.error(`Lake levels ingest failed (${res.status}): ${body}`)
      }
      else {
        console.log(`Lake levels ingest success: ${body}`)
      }
    }).catch((err) => {
      console.error(`Lake levels ingest error: ${err.message}`)
    })

    // Run both in parallel
    ctx.waitUntil(Promise.allSettled([waterPromise, lakePromise]))
  },
}
