
/**
 * Server middleware to init D1 database on every request.
 */
export default defineEventHandler((event) => {
  const { DB } = (event.context.cloudflare?.env || {}) as { DB?: D1Database }
  if (DB) {
    initDatabase(DB)
  }
})
