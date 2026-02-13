<script setup lang="ts">
const { getCategoryBySlug } = useSiteData()
const category = getCategoryBySlug('fun')!

usePageSeo({
  title: 'Fun in Austin — Games, Quizzes & Interactive ATX',
  description: 'Austin-themed games, trivia, and interactive challenges. Test your ATX knowledge and have fun exploring the city.',
})

useSchemaOrg([
  defineWebPage({
    name: 'Fun in Austin — Games & Interactive Experiences',
    description: 'Austin-themed games, trivia, and interactive challenges.',
  }),
])

const overview = `
<h2>Austin for Fun</h2>
<p>Austin doesn't do boring — and neither do we. This section is all about the <strong>playful side of ATX</strong>: games, trivia, interactive tools, and quirky experiences that let you engage with the city in a different way.</p>

<h2>ATX Games</h2>
<p>Our <strong>ATX Games</strong> collection features Austin-themed interactive challenges. Think you know Austin? Test yourself with neighborhood trivia, food truck bingo, and "guess the pollen count" games. These aren't just time-killers — they're designed to teach you something new about the city while you play.</p>

<p>Whether you're killing time waiting for your breakfast taco order or looking for a fun way to learn about Austin's quirky history, our games section has you covered. New games are added regularly, and all are designed to work beautifully on mobile.</p>

<h2>Coming Up</h2>
<p>We're building out more interactive experiences — neighborhood personality quizzes ("Which Austin Neighborhood Are You?"), seasonal challenges, and social leaderboards. If you have ideas for Austin-themed games or interactive tools, we'd love to hear them.</p>
`

const faqItems = [
  { question: 'What kind of games are available?', answer: 'Currently, ATX Games includes Austin-themed trivia, interactive city challenges, and seasonal mini-games. All are free and work on any device.' },
]
</script>

<template>
  <CategoryPage
    :category="category"
    :overview="overview"
    :faq-items="faqItems"
  />
</template>
