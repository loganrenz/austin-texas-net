/**
 * useSiteData — centralized site hierarchy for austin-texas.net
 * Used by homepage card grid and category landing pages.
 */

export interface SubApp {
  slug: string
  title: string
  description: string
  status: 'live' | 'coming-soon'
  /** If live, the standalone ATX App URL (for linking while not yet ported) */
  standaloneUrl?: string
}

export interface Category {
  slug: string
  title: string
  tagline: string
  icon: string
  color: string
  subApps: SubApp[]
}

export function useSiteData() {
  const categories: Category[] = [
    {
      slug: 'food',
      title: 'Food',
      tagline: 'The best eats across Austin — tacos, trucks, happy hours, and more.',
      icon: 'i-lucide-utensils',
      color: 'text-orange-500',
      subApps: [
        { slug: 'breakfast-tacos', title: 'Breakfast Tacos', description: 'Find the best breakfast tacos in Austin, from classic migas to creative fusion.', status: 'coming-soon', standaloneUrl: 'https://breakfast-tacos.atx-apps.com' },
        { slug: 'crawfish-boils', title: 'Crawfish Boils', description: 'Seasonal crawfish boil tracker — dates, locations, and prices.', status: 'coming-soon', standaloneUrl: 'https://crawfish-boils.atx-apps.com' },
        { slug: 'happy-hours', title: 'Happy Hours', description: 'Best happy hour deals in Austin — drink specials, food discounts, and patios.', status: 'coming-soon', standaloneUrl: 'https://happy-hours.atx-apps.com' },
        { slug: 'food-trucks', title: 'Food Trucks', description: 'Live food truck map with locations, menus, and hours.', status: 'coming-soon', standaloneUrl: 'https://food-trucks.atx-apps.com' },
        { slug: 'great-hills-restaurants', title: 'Great Hills Restaurants', description: 'Best restaurants near Great Hills and Northwest Austin.', status: 'coming-soon', standaloneUrl: 'https://great-hills-restaurants.atx-apps.com' },
      ],
    },
    {
      slug: 'outdoors',
      title: 'Outdoors',
      tagline: 'Lakes, trails, wildlife, and everything under the Texas sun.',
      icon: 'i-lucide-trees',
      color: 'text-teal-500',
      subApps: [
        { slug: 'water-temps', title: 'Water Temps', description: 'Live water temperatures for Barton Springs, Lake Travis, and more.', status: 'coming-soon', standaloneUrl: 'https://water-temps.atx-apps.com' },
        { slug: 'disc-golf', title: 'Disc Golf', description: 'Austin disc golf courses — maps, ratings, and conditions.', status: 'coming-soon', standaloneUrl: 'https://disc-golf.atx-apps.com' },
        { slug: 'kayak-launches', title: 'Kayak Launches', description: 'Kayak and paddleboard launch points across Central Texas.', status: 'coming-soon', standaloneUrl: 'https://kayak-launches.atx-apps.com' },
        { slug: 'bluebonnets', title: 'Bluebonnets', description: 'Bluebonnet sighting tracker and best wildflower spots.', status: 'coming-soon', standaloneUrl: 'https://bluebonnets.atx-apps.com' },
        { slug: 'bat-bridge', title: 'Bat Bridge', description: 'Congress Avenue bat colony — flight times, viewing spots, and live status.', status: 'coming-soon', standaloneUrl: 'https://bat-bridge.atx-apps.com' },
      ],
    },
    {
      slug: 'allergies',
      title: 'Allergies',
      tagline: 'Live pollen counts and allergy tracking for Central Texas.',
      icon: 'i-lucide-flower-2',
      color: 'text-green-500',
      subApps: [
        { slug: 'cedar-pollen', title: 'Cedar Pollen', description: 'Live cedar pollen counts, 5-day forecasts, and severity tracking.', status: 'live' },
        { slug: 'oak-pollen', title: 'Oak Pollen', description: 'Oak pollen season tracker with counts and forecasts.', status: 'coming-soon', standaloneUrl: 'https://oak-pollen.atx-apps.com' },
      ],
    },
    {
      slug: 'events',
      title: 'Events',
      tagline: 'Live music, rodeos, and the weirdest events in Austin.',
      icon: 'i-lucide-music',
      color: 'text-purple-500',
      subApps: [
        { slug: 'live-music', title: 'Live Music', description: "Tonight's shows, venue maps, and genre filtering across Austin.", status: 'coming-soon', standaloneUrl: 'https://live-music.atx-apps.com' },
        { slug: 'rodeo-austin', title: 'Rodeo Austin', description: 'Rodeo Austin schedule, lineup, tickets, and event info.', status: 'coming-soon', standaloneUrl: 'https://rodeo-austin.atx-apps.com' },
        { slug: 'chicken-shit-bingo', title: 'Chicken Sh*t Bingo', description: 'The legendary Little Longhorn Saloon event — schedule and info.', status: 'coming-soon', standaloneUrl: 'https://chicken-shit-bingo.atx-apps.com' },
      ],
    },
    {
      slug: 'real-estate',
      title: 'Real Estate',
      tagline: 'Neighborhoods, rent trends, and where to live in Austin.',
      icon: 'i-lucide-home',
      color: 'text-blue-500',
      subApps: [
        { slug: 'neighborhoods', title: 'Neighborhoods', description: "Explore Austin's neighborhoods — demographics, walkability, and vibe.", status: 'coming-soon', standaloneUrl: 'https://hoods.atx-apps.com' },
        { slug: 'rent-heatmap', title: 'Rent Heatmap', description: 'Interactive rent price heatmap across Austin zip codes.', status: 'coming-soon', standaloneUrl: 'https://rent-heatmap.atx-apps.com' },
      ],
    },
    {
      slug: 'culture',
      title: 'Culture',
      tagline: 'Street art, ghost tours, and the soul of Austin.',
      icon: 'i-lucide-palette',
      color: 'text-rose-500',
      subApps: [
        { slug: 'street-art', title: 'Street Art', description: 'Map of murals, graffiti, and public art installations across Austin.', status: 'coming-soon', standaloneUrl: 'https://street-art.atx-apps.com' },
        { slug: 'haunted-austin', title: 'Haunted Austin', description: 'Ghost tours, haunted locations, and spooky Austin history.', status: 'coming-soon', standaloneUrl: 'https://haunted-austin.atx-apps.com' },
      ],
    },
    {
      slug: 'fun',
      title: 'Fun',
      tagline: 'Games, quizzes, and fun ways to explore ATX.',
      icon: 'i-lucide-gamepad-2',
      color: 'text-amber-500',
      subApps: [
        { slug: 'atx-games', title: 'ATX Games', description: 'Austin-themed games and interactive challenges.', status: 'coming-soon', standaloneUrl: 'https://games.atx-apps.com' },
      ],
    },
  ]

  function getCategoryBySlug(slug: string): Category | undefined {
    return categories.find(c => c.slug === slug)
  }

  return { categories, getCategoryBySlug }
}
