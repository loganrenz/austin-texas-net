import pkg from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/fonts',
    '@nuxt/eslint',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-schema-org',
  ],
  css: ['~/assets/css/main.css'],

  fonts: {
    families: [
      { name: 'Inter', provider: 'google', weights: [300, 400, 500, 600, 700] },
      { name: 'Outfit', provider: 'google', weights: [400, 500, 600, 700, 800, 900] },
    ],
  },

  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4
  },

  ui: {
    colorMode: true
  },

  colorMode: {
    preference: 'light'
  },

  vite: {
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __APP_VERSION__: JSON.stringify(pkg.version)
    }
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
    appleClientId: process.env.APPLE_CLIENT_ID || 'com.atxapps',
    appleTeamId: process.env.APPLE_TEAM_ID || '',
    appleKeyId: process.env.APPLE_KEY_ID || '',
    googlePollenApiKey: process.env.GOOGLE_POLLEN_API_KEY || '',
    pollenIngestKey: process.env.POLLEN_INGEST_KEY || '',
    public: {
      appUrl: process.env.SITE_URL || 'https://austin-texas.net',
      gaMeasurementId: process.env.GA_MEASUREMENT_ID || '',
      posthogPublicKey: process.env.POSTHOG_PUBLIC_KEY || '',
      appName: process.env.APP_NAME || 'Austin Texas'
    }
  },

  site: {
    url: 'https://austin-texas.net',
    name: 'Austin Texas'
  },

  sitemap: {
    sources: ['/api/sitemap-urls']
  },

  robots: {
    groups: [
      {
        userAgent: ['*'],
        disallow: ['/admin'],
        allow: ['/api/sitemap-urls'],
      },
    ],
    blockNonSeoBots: true,
  },

  schemaOrg: {
    identity: {
      type: 'WebSite',
      name: 'Austin Texas',
      url: 'https://austin-texas.net',
      logo: '/favicon.png',
      description: 'Your guide to Austin, Texas — pollen counts, local food, live music, neighborhoods, and more.',
    },
  },

  nitro: {
    preset: 'cloudflare-pages',
    esbuild: {
      options: {
        target: 'esnext'
      }
    },
    externals: {
      inline: ['drizzle-orm']
    }
  },

  app: {
    head: {
      title: 'Austin Texas — Your Guide to the Live Music Capital',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Your guide to Austin, Texas — live pollen counts, local food, live music, neighborhoods, and more.' },
        { name: 'keywords', content: 'austin texas, austin guide, austin pollen, cedar fever, austin food, austin music, austin neighborhoods' },
        { name: 'theme-color', content: '#0a1004' },
        { name: 'geo.region', content: 'US-TX' },
        { name: 'geo.placename', content: 'Austin' },
        { name: 'geo.position', content: '30.2672;-97.7431' },
        { name: 'ICBM', content: '30.2672, -97.7431' },
        { name: 'build-time', content: new Date().toISOString() },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  }
})
