import withNuxt from './.nuxt/eslint.config.mjs'
import atx from './eslint-plugins/index.mjs'

export default withNuxt(
  // ATX design system rules (all .vue files)
  ...atx.configs.recommended,

  // ATX server safety rules (server/**/*.ts)
  ...atx.configs.server,

  // Project-level overrides
  {
    rules: {

      // Consistent component naming (PascalCase)
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],

      // Require multi-word component names (Nuxt auto-imports bypass this)
      'vue/multi-word-component-names': 'off',

      // No console in production code
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // Align void element self-closing with prettier (prettier adds />)
      'vue/html-self-closing': ['error', {
        html: { void: 'always', normal: 'always', component: 'always' },
      }],
    },
  },

  // ── Per-file overrides ───────────────────────────────────────
  // Vue eslint-disable HTML comments don't cross block boundaries
  // (script → template), so config-level overrides are needed for
  // template-side warnings.

  // Weather pages — NWS severity alert colors and data-viz scales
  {
    files: [
      'app/pages/weather/current-conditions.vue',
      'app/pages/weather/radar.vue',
      'app/pages/weather/freeze-alerts.vue',
      'app/pages/weather/heat-index.vue',
    ],
    rules: { 'atx/no-raw-tailwind-colors': 'off' },
  },
  // Drought status — USDM standard classification hex colors
  {
    files: ['app/pages/weather/drought-status.vue'],
    rules: { 'atx/no-inline-hex': 'off' },
  },
  // Admin pages — dashboard analytics colors, map overlay hex palette, tool toggles
  {
    files: [
      'app/pages/admin/posthog.vue',
      'app/pages/admin/grid-crawler.vue',
    ],
    rules: {
      'atx/no-raw-tailwind-colors': 'off',
      'atx/no-inline-hex': 'off',
      'atx/no-native-button': 'off',
      'atx/no-native-form': 'off',
      'atx/no-native-input': 'off',
    },
  },
  // GSC admin page — segmented tab selector
  {
    files: ['app/pages/admin/gsc.vue'],
    rules: { 'atx/no-native-button': 'off' },
  },
  // Bluebonnets + PostHog — external attribution links
  {
    files: [
      'app/pages/outdoors/bluebonnets.vue',
      'app/pages/admin/posthog.vue',
    ],
    rules: { 'atx/prefer-ulink': 'off' },
  },
  // Market trends — custom data table with responsive column layout
  {
    files: ['app/pages/real-estate/market-trends.vue'],
    rules: { 'atx/no-native-table': 'off' },
  },
  // Property tax guide — calculator with range slider + rates table
  {
    files: ['app/pages/real-estate/property-tax-guide.vue'],
    rules: {
      'atx/no-native-form': 'off',
      'atx/no-native-input': 'off',
      'atx/no-native-table': 'off',
    },
  },
  // AppMapKit — $fetch for Texas outline, overlay hex colors
  {
    files: ['app/components/AppMapKit.vue'],
    rules: {
      'atx/no-fetch-in-component': 'off',
    },
  },
  // CLI scripts — console.log is the primary output mechanism
  {
    files: ['scripts/**/*.ts'],
    rules: { 'no-console': 'off' },
  }
)
