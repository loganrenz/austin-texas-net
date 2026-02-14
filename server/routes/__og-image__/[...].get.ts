import type { ReactElement } from 'react'
import { OgDefault } from '../../utils/og-templates/default'
import { OgCategory } from '../../utils/og-templates/category'
import { OgSubApp } from '../../utils/og-templates/sub-app'
import { OgNeighborhood } from '../../utils/og-templates/neighborhood'

/**
 * Catch-all route for OG image generation.
 *
 * URL: /__og-image__/<template>?title=...&description=...
 *
 * Templates: default, category, sub-app, neighborhood
 * Props are passed as query parameters.
 */
export default defineEventHandler(async (event) => {
  const params = getRouterParams(event)
  const query = getQuery(event)

  // The catch-all param comes as the path segments after __og-image__
  const templateSlug = (params._ || 'default') as string

  const title = String(query.title || 'Austin Texas')
  const description = String(query.description || '')
  const category = String(query.category || '')
  const categoryColor = String(query.categoryColor || '#84cc16')
  const region = String(query.region || '')
  const city = String(query.city || '')
  const zipCode = String(query.zipCode || '')

  let element: ReactElement

  switch (templateSlug) {
    case 'category':
      element = OgCategory({ title, description, category, categoryColor })
      break
    case 'sub-app':
      element = OgSubApp({ title, description, category, categoryColor })
      break
    case 'neighborhood':
      element = OgNeighborhood({ title, description, region, city, zipCode })
      break
    default:
      element = OgDefault({ title, description })
      break
  }

  // workers-og bundles WASM for the Workers runtime (workerd).
  // In Node.js dev mode the WASM can't load, so fall back to a simple SVG.
  try {
    const { ImageResponse } = await import('workers-og')

    const response = new ImageResponse(element, {
      width: 1200,
      height: 630,
    })

    // Copy headers from ImageResponse into the Nitro event response
    const headers: Record<string, string> = {}
    response.headers.forEach((value: string, key: string) => {
      headers[key] = value
    })
    headers['cache-control'] = 'public, max-age=86400, s-maxage=604800'

    setHeaders(event, headers)

    const buffer = await response.arrayBuffer()
    return Buffer.from(buffer)
  }
  catch {
    // Dev-mode fallback: return a lightweight SVG placeholder
    const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#0a1004"/>
      <text x="60" y="320" fill="#84cc16" font-size="48" font-family="sans-serif">${title}</text>
      <text x="60" y="380" fill="#ffffff80" font-size="20" font-family="sans-serif">[OG dev placeholder — PNG renders in production]</text>
    </svg>`

    setHeaders(event, {
      'content-type': 'image/svg+xml',
      'cache-control': 'no-cache',
    })

    return svg
  }
})
