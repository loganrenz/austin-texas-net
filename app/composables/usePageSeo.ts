/**
 * usePageSeo — one-liner per page to set all SEO meta tags.
 *
 * Sets: title, og:title, description, og:description, og:image,
 * og:url, twitter:card, twitter:title, twitter:description, twitter:image,
 * and canonical link.
 */
export function usePageSeo(opts: {
  title: string
  description: string
  image?: string
  type?: 'website' | 'article' | 'profile'
}) {
  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()
  const siteUrl = (runtimeConfig.public.appUrl || 'https://austin-texas.net').replace(/\/$/, '')
  const canonicalUrl = `${siteUrl}${route.path}`

  const ogImage = opts.image || `${siteUrl}/favicon.png`

  useSeoMeta({
    title: opts.title,
    ogTitle: opts.title,
    description: opts.description,
    ogDescription: opts.description,
    ogImage,
    ogUrl: canonicalUrl,
    ogType: opts.type || 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: opts.title,
    twitterDescription: opts.description,
    twitterImage: ogImage,
  })

  useHead({
    link: [
      { rel: 'canonical', href: canonicalUrl },
    ],
  })
}
