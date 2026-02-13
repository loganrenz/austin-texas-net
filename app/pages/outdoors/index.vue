<script setup lang="ts">
const { getCategoryBySlug } = useSiteData()
const category = getCategoryBySlug('outdoors')!

usePageSeo({
  title: 'Outdoor Austin — Swimming, Kayaking, Disc Golf & Nature',
  description: 'Explore Austin\'s outdoor scene — live water temps, kayak launches, disc golf courses, bluebonnet spots, and bat watching at Congress Avenue Bridge.',
})

useSchemaOrg([
  defineWebPage({
    name: 'Outdoor Austin — Your Guide to ATX Nature & Adventure',
    description: 'Explore Austin\'s outdoor scene — water temps, kayak launches, disc golf, bluebonnets, and bat watching.',
  }),
])

const overview = `
<h2>Austin's Great Outdoors</h2>
<p>Austin is an <strong>outdoor city to its core</strong>. With over 300 parks, 228 sunny days per year, and a landscape defined by spring-fed pools, limestone cliffs, and the winding Colorado River, Austin offers some of the best outdoor recreation in Texas — and arguably the entire American South.</p>

<p>The crown jewels of Austin's outdoor scene include <strong>Barton Springs Pool</strong>, a 68°F spring-fed swimming hole that draws crowds year-round; <strong>Lady Bird Lake</strong>, a 10-mile urban reservoir perfect for kayaking, paddleboarding, and rowing; and <strong>the Greenbelt</strong>, a rugged 7.25-mile trail system with swimming holes hidden among the limestone.</p>

<h2>Water Activities</h2>
<p>Austin's relationship with water defines the city. <strong>Lake Travis</strong> and <strong>Lake Austin</strong> provide boating, cliff jumping, and lake swimming, while <strong>Barton Creek</strong> offers more intimate wading spots. Water temperatures fluctuate dramatically by season — our water temp tracker helps you know exactly what to expect before you pack your swimsuit.</p>

<p><strong>Kayaking and paddleboarding</strong> are Austin essentials. Lady Bird Lake is the most popular spot, with multiple launch points from Zilker Park, the Rowing Dock, and Congress Avenue. But experienced paddlers also explore the upper reaches of Lake Austin and the quieter stretches of the Colorado River downstream.</p>

<h2>Land Adventures</h2>
<p><strong>Disc golf</strong> has exploded in Austin. From the legendary Roy G. Guerrero course along the river to the challenging Circle C Metro Park layout, the city has over a dozen courses covering every difficulty level. Our disc golf tracker helps you find open courses and check conditions.</p>

<p><strong>Bluebonnet season</strong> (March–April) is a Texas tradition, and Austin sits right in the heart of the wildflower belt. Highway 290 toward Fredericksburg, the Lady Bird Johnson Wildflower Center, and scattered spots around Lake Travis burst with color every spring.</p>

<h2>Wildlife</h2>
<p>The <strong>Congress Avenue Bridge bat colony</strong> is North America's largest urban bat population — roughly 1.5 million Mexican free-tailed bats emerge at dusk from March through November. It's one of Austin's most iconic spectacles, and our bat bridge tracker tells you the best viewing times each evening.</p>
`

const faqItems = [
  { question: 'What is the water temperature at Barton Springs?', answer: 'Barton Springs maintains a remarkably consistent temperature of 68-70°F (20-21°C) year-round, fed by underground springs from the Edwards Aquifer.' },
  { question: 'When is bluebonnet season in Austin?', answer: 'Bluebonnets typically bloom from mid-March through mid-April in the Austin area. Peak blooms depend on winter rainfall — wetter winters produce more spectacular displays.' },
  { question: 'What time do the bats fly at Congress Avenue Bridge?', answer: 'Bats typically emerge at dusk, about 20-30 minutes before sunset. The best viewing is from March through October, with peak colony size in August.' },
  { question: 'Where can I kayak in Austin?', answer: 'Lady Bird Lake is the most accessible spot with multiple launch points. Lake Austin and Lake Travis offer longer paddles with scenic canyon walls. Barton Creek is great for calm, creek-style paddling.' },
]
</script>

<template>
  <CategoryPage
    :category="category"
    :overview="overview"
    :faq-items="faqItems"
  />
</template>
