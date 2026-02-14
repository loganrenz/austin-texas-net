/**
 * Content Pipeline Configuration
 *
 * Defines which categories and sub-topics the AI content pipeline should
 * research and regenerate. Each topic maps to a search query set, an output
 * data file, and the content type key used in the map_spots table.
 */

export interface TopicConfig {
  key: string
  label: string
  searchQueries: string[]
  spotFile: string // filename in app/data/, e.g. 'bbqSpots.ts'
  contentType: string // maps to map_spots.content_type
  maxSpots: number
}

export interface CategoryConfig {
  slug: string
  label: string
  topics: TopicConfig[]
  bodySystemPrompt: string
  faqSystemPrompt: string
}

// ─── Food Category ──────────────────────────────────────────
const foodTopics: TopicConfig[] = [
  {
    key: 'bbq',
    label: 'BBQ Joints',
    searchQueries: [
      'best bbq restaurants austin texas 2026',
      'new bbq spots opened austin tx',
      'top rated barbecue austin brisket',
    ],
    spotFile: 'bbqSpots.ts',
    contentType: 'bbq',
    maxSpots: 10,
  },
  {
    key: 'breakfast-tacos',
    label: 'Breakfast Tacos',
    searchQueries: [
      'best breakfast tacos austin tx 2026',
      'top breakfast taco spots austin',
      'new taco restaurants austin texas',
    ],
    spotFile: 'tacoSpots.ts',
    contentType: 'breakfast-tacos',
    maxSpots: 10,
  },
  {
    key: 'coffee',
    label: 'Coffee Shops',
    searchQueries: [
      'best coffee shops austin texas 2026',
      'new coffee roasters austin tx',
      'specialty coffee austin local roasters',
    ],
    spotFile: 'coffeeSpots.ts',
    contentType: 'coffee',
    maxSpots: 10,
  },
  {
    key: 'food-trucks',
    label: 'Food Trucks',
    searchQueries: [
      'best food trucks austin tx 2026',
      'food truck parks austin texas',
      'new food trucks austin',
    ],
    spotFile: 'foodTruckSpots.ts',
    contentType: 'food-trucks',
    maxSpots: 10,
  },
  {
    key: 'happy-hours',
    label: 'Happy Hours',
    searchQueries: [
      'best happy hour deals austin tx 2026',
      'cheap happy hour austin bars restaurants',
      'best cocktail happy hours austin',
    ],
    spotFile: 'happyHourSpots.ts',
    contentType: 'happy-hours',
    maxSpots: 10,
  },
  {
    key: 'restaurants',
    label: 'Restaurants',
    searchQueries: [
      'best new restaurants austin texas 2026',
      'james beard nominated austin restaurants',
      'top rated restaurants austin tx',
    ],
    spotFile: 'restaurantSpots.ts',
    contentType: 'restaurants',
    maxSpots: 10,
  },
]

const foodCategory: CategoryConfig = {
  slug: 'food',
  label: 'Food',
  topics: foodTopics,
  bodySystemPrompt: `You are a food writer for Austin-Texas.net, an illustrated city guide to Austin, TX.
Write engaging, opinionated prose about Austin's food scene. Be specific — name real places,
real dishes, real neighborhoods. Sound like a local who genuinely loves the city, not a tourist guide.
Use a warm, confident tone. Avoid generic superlatives. Under 400 words total for the body.`,

  faqSystemPrompt: `You are a local Austin food expert writing FAQ answers for austin-texas.net.
Each answer should be 2-3 sentences, factual, helpful, and specific to Austin.
Mention real places, real prices, real seasons. Avoid filler.`,
}

// ─── Exported Config ────────────────────────────────────────
export const pipelineCategories: CategoryConfig[] = [
  foodCategory,
  // Future: outdoors, culture, events, health, etc.
]
