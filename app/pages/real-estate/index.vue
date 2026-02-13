<script setup lang="ts">
const { getCategoryBySlug } = useSiteData()
const category = getCategoryBySlug('real-estate')!

usePageSeo({
  title: 'Austin Real Estate — Neighborhoods & Rent Trends',
  description: 'Explore Austin neighborhoods and rent trends. Compare walkability, demographics, and vibe across Austin\'s most popular areas. Interactive rent heatmap by zip code.',
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Real Estate — Neighborhoods & Rent Trends',
    description: 'Explore Austin neighborhoods, rent prices, and where to live in ATX.',
  }),
])

const overview = `
<h2>Living in Austin</h2>
<p>Austin's real estate market is one of the most dynamic in the country. The city's explosive population growth — from under 800,000 to over <strong>2.3 million in the metro area</strong> — has transformed neighborhoods, driven new construction, and created a rental market that demands smart navigation.</p>

<p>Whether you're a newcomer choosing your first Austin neighborhood or a longtime resident tracking rent trends, understanding the city's geography is essential. Austin sprawls across a diverse landscape: the trendy urban core downtown, the eclectic east side, the established suburbs of northwest Austin, and rapidly growing areas south of the river.</p>

<h2>Neighborhoods</h2>
<p>Each Austin neighborhood has its own personality. <strong>South Congress (SoCo)</strong> is walkable, artsy, and expensive. <strong>East Austin</strong> is the creative hub with studios, breweries, and a rapidly changing demographic. <strong>Hyde Park</strong> offers a classic college-town vibe with historic homes. <strong>Mueller</strong> is Austin's model planned community with parks and local shops. <strong>Cedar Park and Round Rock</strong> offer suburban living with excellent schools and lower costs — but longer commutes.</p>

<p>Our neighborhoods tool lets you compare <strong>walkability scores, demographics, average rents, commute times, and overall vibe</strong> across dozens of Austin areas. It's the tool we wish we'd had when we first moved here.</p>

<h2>Rent Trends</h2>
<p>Austin's rental market has seen significant shifts in recent years. After the pandemic-era surge that pushed average rents to record highs, the market has <strong>stabilized with increased inventory</strong> from new apartment construction. Our rent heatmap visualizes prices across every Austin zip code, helping you identify affordable pockets and understand how prices vary by neighborhood.</p>
`

const faqItems = [
  { question: 'What is the average rent in Austin?', answer: 'As of 2025, the average rent for a one-bedroom apartment in Austin is approximately $1,400-1,600/month, though this varies significantly by neighborhood — from $1,100 in outer suburbs to $2,500+ downtown.' },
  { question: 'What are the best neighborhoods in Austin?', answer: 'Popular neighborhoods include South Congress (walkable/artsy), East Austin (creative/diverse), Hyde Park (classic/charming), Mueller (family-friendly), and Zilker (outdoor lifestyle). The best neighborhood depends on your priorities — commute, budget, lifestyle, and school needs.' },
  { question: 'Is Austin affordable to live in?', answer: 'Austin is more affordable than coastal cities like San Francisco or NYC, but has seen significant cost increases. Areas outside the urban core (Cedar Park, Pflugerville, Kyle) offer lower costs. Texas has no state income tax, which helps offset higher housing costs.' },
]
</script>

<template>
  <CategoryPage
    :category="category"
    :overview="overview"
    :faq-items="faqItems"
  />
</template>
