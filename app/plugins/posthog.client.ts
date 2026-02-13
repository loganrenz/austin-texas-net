/**
 * PostHog analytics plugin — client-side only.
 * Captures page views automatically and exposes window.posthog for custom events.
 */
export default defineNuxtPlugin({
  name: 'posthog',
  enforce: 'post',
  async setup() {
    const runtimeConfig = useRuntimeConfig()
    const posthogKey = runtimeConfig.public.posthogPublicKey as string | undefined

    // Only load in production with a valid key
    if (!posthogKey || import.meta.server) return

    const posthog = await import('posthog-js').then(m => m.default)

    posthog.init(posthogKey, {
      api_host: 'https://us.i.posthog.com',
      capture_pageview: false, // We capture manually for SPA navigation
      capture_pageleave: true,
      persistence: 'localStorage+cookie',
      autocapture: false,
    })

    // Capture page views on route change
    const router = useRouter()
    router.afterEach((to) => {
      nextTick(() => {
        posthog.capture('$pageview', {
          $current_url: window.location.origin + to.fullPath,
        })
      })
    })
  },
})
