/**
 * Google Analytics 4 (gtag.js) — client-only plugin.
 * Loads GA4 script and captures SPA pageviews on route change.
 */

declare global {
  interface Window {
    dataLayer: unknown[]
  }
}
export default defineNuxtPlugin({
  name: 'gtag',
  parallel: true,
  setup() {
    const config = useRuntimeConfig()
    const id = config.public.gaMeasurementId as string

    if (!id || typeof window === 'undefined') return

    // Load gtag.js
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
    document.head.appendChild(script)

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || []
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args)
    }
    gtag('js', new Date())
    gtag('config', id, { send_page_view: false })

    // SPA pageview tracking
    const router = useRouter()
    router.afterEach((to) => {
      nextTick(() => {
        gtag('event', 'page_view', {
          page_path: to.fullPath,
          page_location: window.location.origin + to.fullPath,
        })
      })
    })
  },
})
