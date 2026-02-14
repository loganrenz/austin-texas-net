const SITE_URL = 'https://austin-texas.net'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  try {
    const data: any = await googleApiFetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/sitemaps`,
      GSC_SCOPES,
    )

    const sitemaps = (data.sitemap || []).map((s: any) => ({
      path: s.path,
      lastSubmitted: s.lastSubmitted,
      lastDownloaded: s.lastDownloaded,
      isPending: s.isPending,
      isSitemapsIndex: s.isSitemapsIndex,
      warnings: s.warnings || 0,
      errors: s.errors || 0,
      contents: (s.contents || []).map((c: any) => ({
        type: c.type,
        submitted: c.submitted ? Number(c.submitted) : 0,
        indexed: c.indexed ? Number(c.indexed) : 0,
      })),
    }))

    return { sitemaps }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: `GSC Sitemaps Error: ${error.statusMessage || error.message}`,
    })
  }
})
