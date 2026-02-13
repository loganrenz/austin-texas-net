/**
 * Suppress the "Extraneous non-props attributes (style)" warning emitted by
 * Nuxt DevTools' overlay custom element.  This is a known upstream issue —
 * the DevTools <VueElement> renders a fragment root so Vue cannot inherit
 * the positioning style automatically.
 *
 * Only active in dev; the plugin is client-only and the warning never
 * appears in production builds.
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.dev) return

  const original = nuxtApp.vueApp.config.warnHandler
  nuxtApp.vueApp.config.warnHandler = (msg, instance, trace) => {
    // Swallow only the DevTools overlay attribute-inheritance warning
    if (msg.includes('Extraneous non-props attributes') && trace.includes('VueElement')) {
      return
    }
    // Forward everything else to the original handler (or console.warn)
    if (typeof original === 'function') {
      original(msg, instance, trace)
    } else {
      console.warn(`[Vue warn]: ${msg}${trace}`)
    }
  }
})
