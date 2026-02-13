/**
 * Dynamic sitemap URLs for austin-texas.net
 */
export default defineEventHandler(() => {
  return [
    // Homepage
    { loc: '/', changefreq: 'daily', priority: 1.0 },

    // Category pages
    { loc: '/food/', changefreq: 'weekly', priority: 0.9 },
    { loc: '/outdoors/', changefreq: 'weekly', priority: 0.9 },
    { loc: '/allergies/', changefreq: 'weekly', priority: 0.9 },
    { loc: '/events/', changefreq: 'weekly', priority: 0.9 },
    { loc: '/real-estate/', changefreq: 'weekly', priority: 0.9 },
    { loc: '/culture/', changefreq: 'weekly', priority: 0.9 },
    { loc: '/fun/', changefreq: 'weekly', priority: 0.8 },

    // Cedar pollen (live sub-app)
    { loc: '/allergies/cedar-pollen/', changefreq: 'daily', priority: 0.9 },
    { loc: '/allergies/cedar-pollen/about', changefreq: 'monthly', priority: 0.7 },
    { loc: '/allergies/cedar-pollen/tips', changefreq: 'monthly', priority: 0.7 },

    // Legacy pollen routes
    { loc: '/pollen', changefreq: 'daily', priority: 0.8 },
    { loc: '/pollen/about', changefreq: 'monthly', priority: 0.6 },
    { loc: '/pollen/tips', changefreq: 'monthly', priority: 0.6 },
  ]
})
