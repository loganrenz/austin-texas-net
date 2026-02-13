<script setup lang="ts">
const { getCategoryBySlug } = useSiteData()
const category = getCategoryBySlug('events')!

usePageSeo({
  title: 'Austin Events — Live Music, Rodeos & Weird Austin',
  description: 'Austin events guide — live music tonight, Rodeo Austin, Chicken Sh*t Bingo, and the best things happening across ATX.',
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Events — Live Music, Rodeos & More',
    description: 'Austin events guide — live music tonight, Rodeo Austin, and the weirdest things happening across ATX.',
  }),
])

const overview = `
<h2>The Live Music Capital of the World</h2>
<p>Austin isn't just nicknamed the <strong>Live Music Capital of the World</strong> — it lives up to that title every single night. With over 300 live music venues, the city hosts more live music per capita than any other city in America. From legendary stages like the Continental Club and Stubbs to tiny dive bars on East 6th, there's always a show happening somewhere.</p>

<p>The city's music scene spans every genre imaginable: blues and country on South Congress, indie rock on Red River, jazz in the Warehouse District, hip-hop on the east side, and genre-defying experimental acts everywhere in between. Our live music tracker helps you find tonight's shows by genre, venue, or neighborhood.</p>

<h2>Beyond Music</h2>
<p><strong>Rodeo Austin</strong> is a beloved annual tradition running each March. Combining a professional rodeo, carnival, BBQ cook-off, and concert series, it's one of the city's biggest events and draws hundreds of thousands of visitors. The livestock show and star exhibit are highlights for families.</p>

<p><strong>Chicken Sh*t Bingo</strong> at the Little Longhorn Saloon is peak Austin weirdness — and we mean that as the highest compliment. Every Sunday afternoon, a live chicken wanders across a numbered bingo board in the back of a honky-tonk bar. When it does its business on your number, you win. It's free, it's absurd, and it's absolutely essential Austin.</p>

<h2>The Austin Calendar</h2>
<p>Austin's event calendar is packed year-round. <strong>SXSW</strong> (March) takes over downtown with music, film, and tech. <strong>ACL Fest</strong> (October) brings headliners to Zilker Park. <strong>Trail of Lights</strong> (December) transforms the park into a holiday wonderland. And countless smaller events — art walks, food festivals, outdoor movie screenings — fill the gaps between the big ones.</p>
`

const faqItems = [
  { question: 'Where can I find live music in Austin tonight?', answer: 'The best areas for live music are 6th Street (all genres), Red River Cultural District (indie/rock), South Congress (country/blues), and Rainey Street (varied). Our live music tool shows tonight\'s shows with genre filters.' },
  { question: 'When is Rodeo Austin?', answer: 'Rodeo Austin typically runs for about two weeks in March. It features professional rodeo events, a carnival, livestock show, and a concert series with major artists.' },
  { question: 'What is Chicken Sh*t Bingo?', answer: 'Chicken Sh*t Bingo is a beloved Austin tradition held every Sunday at the Little Longhorn Saloon. A live chicken walks across a numbered bingo board — when nature calls on your number, you win. It\'s free and peak Keep Austin Weird.' },
]
</script>

<template>
  <CategoryPage
    :category="category"
    :overview="overview"
    :faq-items="faqItems"
  />
</template>
