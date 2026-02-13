<script setup lang="ts">
const { getCategoryBySlug } = useSiteData()
const category = getCategoryBySlug('food')!

usePageSeo({
  title: 'Best Food in Austin — Tacos, Trucks, Happy Hours & More',
  description: 'Discover the best food in Austin, Texas — breakfast tacos, food trucks, crawfish boils, happy hours, and neighborhood restaurants. Your complete ATX food guide.',
})

useSchemaOrg([
  defineWebPage({
    name: 'Best Food in Austin — Your Complete ATX Food Guide',
    description: 'Discover the best food in Austin, Texas — breakfast tacos, food trucks, crawfish boils, happy hours, and neighborhood restaurants.',
  }),
])

const overview = `
<h2>Austin's Food Scene</h2>
<p>Austin's food scene is a melting pot of <strong>Tex-Mex traditions</strong>, Southern comfort, world-class BBQ, and a thriving foodie culture that draws inspiration from every corner of the globe. From the iconic breakfast taco to the cutting-edge culinary creations popping up in food truck parks, Austin has earned its reputation as one of the best food cities in America.</p>

<p>The city's culinary landscape is defined by its diversity. On any given block, you might find a fifth-generation Mexican restaurant next to a Vietnamese-Cajun fusion truck next to a James Beard Award-winning fine dining establishment. That's the magic of Austin — unpretentious, adventurous, and always hungry for something new.</p>

<h2>What Makes Austin Food Special</h2>
<p><strong>Breakfast tacos</strong> are the city's unofficial mascot. Every Austinite has their go-to spot, whether it's a no-frills order window on East Riverside or an upscale version in Domain. The debate over who makes the best breakfast taco is as passionate as any political argument — and significantly more productive.</p>

<p><strong>Food trucks</strong> are woven into Austin's DNA. The city has over 1,500 permitted mobile food vendors, from the legendary Torchy's Tacos (before it went brick-and-mortar) to experimental pop-ups that last a single weekend. Food truck parks like the Picnic on Barton Springs Road and the Meanwhile Brewing complex offer a curated experience with multiple cuisines in one stop.</p>

<p><strong>Happy hours</strong> in Austin are serious business. The city's bar scene extends well beyond 6th Street, with craft cocktail lounges on Rainey Street, rooftop bars downtown, and neighborhood joints with $3 local brews. Many restaurants offer substantial food discounts during happy hour, making it the smartest way to eat well on a budget.</p>

<h2>Seasonal Highlights</h2>
<p><strong>Crawfish season</strong> (February through May) transforms Austin into a Cajun paradise. Restaurants and pop-ups across the city serve pounds of spiced mudbugs alongside corn, potatoes, and cold beer. It's a social event as much as a meal — friends gather around newspaper-covered tables and crack shells for hours.</p>

<p>Whether you're a lifelong Austinite or visiting for the first time, our food tools help you navigate the city's incredible culinary landscape — from finding the nearest open food truck to discovering the best crawfish boil this weekend.</p>
`

const faqItems = [
  { question: 'What food is Austin known for?', answer: 'Austin is famous for breakfast tacos, BBQ (especially brisket), Tex-Mex cuisine, food trucks, and an increasingly diverse culinary scene spanning Vietnamese, Ethiopian, Japanese, and Southern comfort food.' },
  { question: 'Where are the best food trucks in Austin?', answer: 'Popular food truck parks include The Picnic on Barton Springs, Meanwhile Brewing on Manchaca, and the East Austin food truck lots along East Cesar Chavez. South Congress and South Lamar also have great clusters.' },
  { question: 'When is crawfish season in Austin?', answer: 'Crawfish season in Austin typically runs from late January or February through May, with peak availability in March and April. Prices and quality are best mid-season.' },
  { question: 'What are the best happy hour deals in Austin?', answer: 'Rainey Street and East Austin offer some of the best happy hour deals, with many spots offering $5-7 cocktails and discounted appetizers between 3-6 PM on weekdays.' },
]
</script>

<template>
  <CategoryPage
    :category="category"
    :overview="overview"
    :faq-items="faqItems"
  />
</template>
