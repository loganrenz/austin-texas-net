<script setup lang="ts">
const { getCategoryBySlug } = useSiteData()
const category = getCategoryBySlug('culture')!

usePageSeo({
  title: 'Austin Culture — Street Art, Ghost Tours & Keep It Weird',
  description: 'Explore Austin\'s culture — murals and street art map, haunted tours, weird Austin traditions, and the creative soul of the city.',
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Culture — Street Art, Ghost Tours & Keep It Weird',
    description: 'Explore Austin\'s creative culture — murals, ghost tours, and the weird soul of the city.',
  }),
])

const overview = `
<h2>Keep Austin Weird</h2>
<p>"Keep Austin Weird" isn't just a bumper sticker — it's a cultural manifesto. Austin's identity is built on <strong>creative independence, artistic expression, and a welcoming embrace of the unconventional</strong>. From the massive murals that cover entire building facades to the gently haunted history walking tours downtown, Austin's culture is as vibrant as its music scene.</p>

<h2>Street Art & Murals</h2>
<p>Austin is one of America's most prolific street art cities. The <strong>"Greetings from Austin" postcard mural</strong> on South First Street is the city's most iconic — so much so that it's survived multiple relocations. But that's just the beginning. Entire districts like <strong>East Austin, South Congress, and the HOPE Outdoor Gallery (RIP)</strong> are open-air galleries featuring works by local and international artists.</p>

<p>Our street art map catalogs <strong>hundreds of murals, graffiti walls, and public art installations</strong> across the city, with photos, artist credits, and GPS coordinates. It's the perfect tool for a self-guided art walk or finding the right backdrop for that Austin photo.</p>

<h2>Haunted Austin</h2>
<p>Austin has a darker side that most tourists never see. The <strong>Driskill Hotel</strong>, built in 1886, is considered one of the most haunted hotels in Texas. The <strong>Littlefield House</strong> on the UT campus has a storied history of ghostly encounters. And the <strong>Moonlight Towers</strong> — Austin's 165-foot-tall Victorian streetlights, the only ones remaining in the world — were originally erected in part because of a serial killer terrorizing the city in the 1880s.</p>

<p>Our haunted Austin guide maps out the city's spookiest locations with historical context, reported paranormal activity, and links to local ghost tour operators.</p>

<h2>The Creative Economy</h2>
<p>Austin's creative culture isn't just aesthetic — it's economic. The city is home to a thriving arts community including <strong>film production, independent publishing, game development, and design studios</strong>. Annual events like East Austin Studio Tour (EAST) open hundreds of private studios to the public, revealing the creative engine that keeps Austin weird.</p>
`

const faqItems = [
  { question: 'Where is the best street art in Austin?', answer: 'East Austin (especially East 6th and the Comal/Webberville area) has the densest concentration. South Congress, South First, and the Guadalupe/Drag area near UT also have iconic murals. The "Greetings from Austin" mural on South 1st is the most famous.' },
  { question: 'Are there ghost tours in Austin?', answer: 'Yes! Several companies offer walking ghost tours, primarily in downtown Austin and the historic Sixth Street district. Popular tours cover the Driskill Hotel, the Moonlight Towers, and the dark history of Congress Avenue.' },
  { question: 'What does Keep Austin Weird mean?', answer: 'The slogan originated in 2000 as a call to support local, independent businesses over national chains. It has since evolved into a broader cultural identity celebrating Austin\'s creative independence and nonconformist spirit.' },
]
</script>

<template>
  <CategoryPage
    :category="category"
    :overview="overview"
    :faq-items="faqItems"
  />
</template>
