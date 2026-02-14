/**
 * useSiteData — centralized site hierarchy for austin-texas.net
 * Single source of truth: homepage card grid, category landing pages, SEO metadata.
 *
 * Category overview content and FAQs live in Nuxt Content markdown files
 * under content/categories/{slug}.md — queried via queryCollection('categories').
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
  bgColor: string
  subApps: SubApp[]
  seo: { title: string; description: string }
}

export function useSiteData() {
  const categories: Category[] = [
    /* ── 1. Food ───────────────────────────────────────────── */
    {
      slug: 'food',
      title: 'Food',
      tagline: 'The best eats across Austin — tacos, trucks, happy hours, and more.',
      icon: 'i-lucide-utensils',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      subApps: [
        { slug: 'breakfast-tacos', title: 'Breakfast Tacos', description: 'Find the best breakfast tacos in Austin, from classic migas to creative fusion.', status: 'live' },
        { slug: 'bbq', title: 'BBQ', description: 'Austin BBQ guide — brisket rankings, pitmaster profiles, and wait times.', status: 'live' },
        { slug: 'coffee-shops', title: 'Coffee Shops', description: 'Best coffee shops in Austin — local roasters, WiFi-friendly spots, and cold brew.', status: 'live' },
        { slug: 'food-trucks', title: 'Food Trucks', description: 'Live food truck map with locations, menus, and hours.', status: 'live' },
        { slug: 'happy-hours', title: 'Happy Hour', description: 'Best happy hour deals in Austin — drink specials, food discounts, and patios.', status: 'live' },
        { slug: 'restaurant-map', title: 'Restaurant Map', description: 'Interactive map of Austin restaurants — filter by cuisine, price, and neighborhood.', status: 'live' },
      ],
      seo: {
        title: 'Best Food in Austin — Tacos, BBQ, Coffee & More',
        description: 'Discover the best food in Austin, Texas — breakfast tacos, BBQ, coffee shops, food trucks, happy hours, and more. Your complete ATX food guide.',
      },
    },

    /* ── 2. Events ─────────────────────────────────────────── */
    {
      slug: 'events',
      title: 'Events',
      tagline: 'Live music, festivals, family events, and everything happening in ATX.',
      icon: 'i-lucide-music',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      subApps: [
        { slug: 'this-weekend', title: 'This Weekend', description: 'What\'s happening in Austin this weekend — curated picks and full listings.', status: 'coming-soon' },
        { slug: 'live-music', title: 'Live Music', description: 'Tonight\'s shows, venue maps, and genre filtering across Austin.', status: 'coming-soon' },
        { slug: 'sxsw', title: 'SXSW Guide', description: 'South by Southwest survival guide — dates, venues, tips, and what to know for Austin\'s biggest festival.', status: 'live' },
        { slug: 'festivals', title: 'Festivals', description: 'SXSW, ACL, and every festival in Austin — dates, lineups, and tips.', status: 'coming-soon' },
        { slug: 'family-events', title: 'Family Events', description: 'Kid-friendly events and activities happening around Austin.', status: 'coming-soon' },
        { slug: 'free-events', title: 'Free Events', description: 'Free things to do in Austin — concerts, markets, outdoor screenings.', status: 'coming-soon' },
        { slug: 'submit-event', title: 'Submit Event', description: 'Submit your Austin event to be listed on our calendar.', status: 'coming-soon' },
      ],
      seo: {
        title: 'Austin Events — Live Music, Festivals & Things To Do',
        description: 'Austin events guide — live music tonight, festivals, family events, free things to do, and the best of what\'s happening across ATX.',
      },
    },

    /* ── 3. Outdoors ───────────────────────────────────────── */
    {
      slug: 'outdoors',
      title: 'Outdoors',
      tagline: 'Parks, trails, swimming holes, and everything under the Texas sun.',
      icon: 'i-lucide-trees',
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-100 dark:bg-violet-900/30',
      subApps: [
        { slug: 'bluebonnets', title: 'Bluebonnets', description: 'Live bluebonnet sighting map — Texas wildflower observations from iNaturalist.', status: 'live' },
        { slug: 'parks', title: 'Parks', description: 'Austin parks guide — Zilker, Pease, and 300+ city and state parks.', status: 'coming-soon' },
        { slug: 'hiking-trails', title: 'Hiking Trails', description: 'Best hiking trails in Austin — the Greenbelt, Turkey Creek, and more.', status: 'coming-soon' },
        { slug: 'swimming-holes', title: 'Swimming Holes', description: 'Austin swimming holes — Barton Springs, Hamilton Pool, Jacob\'s Well.', status: 'coming-soon' },
        { slug: 'lake-travis', title: 'Lake Travis', description: 'Lake Travis guide — marinas, boat ramps, water levels, and lake activities.', status: 'coming-soon' },
        { slug: 'barton-springs', title: 'Barton Springs', description: 'Barton Springs Pool — hours, water temp, and visitor guide.', status: 'coming-soon' },
        { slug: 'trail-map', title: 'Trail Map', description: 'Interactive trail map of Austin\'s greenbelt, urban trails, and bike paths.', status: 'coming-soon' },
      ],
      seo: {
        title: 'Outdoor Austin — Parks, Trails, Swimming & Nature',
        description: 'Explore Austin\'s outdoor scene — parks, hiking trails, swimming holes, Lake Travis, Barton Springs, and trail maps.',
      },
    },

    /* ── 4. Health ──────────────────────────────────────────── */
    {
      slug: 'health',
      title: 'Health',
      tagline: 'Cedar pollen, air quality, and health resources for Central Texas.',
      icon: 'i-lucide-heart-pulse',
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-100 dark:bg-rose-900/30',
      subApps: [
        { slug: 'cedar-pollen', title: 'Cedar Pollen', description: 'Live cedar pollen counts, 5-day forecasts, and severity tracking.', status: 'live' },
        { slug: 'air-quality', title: 'Air Quality', description: 'Real-time AQI monitoring for Austin and Central Texas.', status: 'coming-soon' },
        { slug: 'urgent-care', title: 'Urgent Care', description: 'Find urgent care clinics near you — hours, wait times, and directions.', status: 'coming-soon' },
        { slug: 'hospitals', title: 'Hospitals', description: 'Austin hospitals and ERs — locations, specialties, and contact info.', status: 'coming-soon' },
        { slug: 'flu-activity', title: 'Flu Activity', description: 'Flu and respiratory illness activity tracker for Central Texas.', status: 'coming-soon' },
        { slug: 'allergy-map', title: 'Allergy Map', description: 'Pollen and allergen heatmap across Austin zip codes.', status: 'coming-soon' },
      ],
      seo: {
        title: 'Austin Health — Pollen, Air Quality & Healthcare Resources',
        description: 'Austin health resources — live cedar pollen counts, air quality index, urgent care finder, hospital directory, and allergy tracking.',
      },
    },

    /* ── 5. Weather ─────────────────────────────────────────── */
    {
      slug: 'weather',
      title: 'Weather',
      tagline: 'Current conditions, radar, forecasts, and severe weather alerts.',
      icon: 'i-lucide-cloud-sun',
      color: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-sky-100 dark:bg-sky-900/30',
      subApps: [
        { slug: 'current-conditions', title: 'Current Conditions', description: 'Real-time Austin weather — temperature, humidity, wind, and UV index.', status: 'live' },
        { slug: 'radar', title: 'Radar', description: 'Live NEXRAD radar for Central Texas — rain, storms, and precipitation.', status: 'live' },
        { slug: '7-day-forecast', title: '7-Day Forecast', description: 'Extended forecast for Austin — daily highs, lows, and conditions.', status: 'live' },
        { slug: 'heat-index', title: 'Heat Index', description: 'Current and forecast heat index — feels-like temperature tracking.', status: 'live' },
        { slug: 'freeze-alerts', title: 'Freeze Alerts', description: 'Winter freeze warnings and pipe protection alerts for Austin.', status: 'live' },
        { slug: 'drought-status', title: 'Drought Status', description: 'Central Texas drought monitor — watering restrictions and conditions.', status: 'live' },
      ],
      seo: {
        title: 'Austin Weather — Radar, Forecasts & Severe Weather Alerts',
        description: 'Austin weather dashboard — current conditions, NEXRAD radar, 7-day forecast, heat index, freeze alerts, and drought monitoring.',
      },
    },

    /* ── 6. More ────────────────────────────────────────────── */
    {
      slug: 'more',
      title: 'More',
      tagline: 'Transportation, jobs, schools, utilities, and essential city services.',
      icon: 'i-lucide-grid-3x3',
      color: 'text-slate-600 dark:text-slate-400',
      bgColor: 'bg-slate-100 dark:bg-slate-900/30',
      subApps: [
        { slug: 'transportation', title: 'Transportation', description: 'Getting around Austin — transit, ride-share, bike lanes, and I-35 updates.', status: 'coming-soon' },
        { slug: 'moving-to-austin', title: 'Moving to Austin', description: 'The ultimate moving guide — neighborhoods, costs, utilities, and tips.', status: 'coming-soon' },
        { slug: 'jobs', title: 'Jobs', description: 'Austin job market — tech, creative, and local employer trends.', status: 'coming-soon' },
        { slug: 'schools', title: 'Schools', description: 'Austin school districts — ratings, boundaries, and enrollment info.', status: 'coming-soon' },
        { slug: 'utilities', title: 'Utilities', description: 'Set up Austin utilities — energy, water, gas, internet, and trash.', status: 'coming-soon' },
        { slug: 'city-services', title: 'City Services', description: 'Essential City of Austin services — permits, trash, recycling, and more.', status: 'coming-soon' },
      ],
      seo: {
        title: 'Austin Resources — Transportation, Jobs, Schools & City Services',
        description: 'Essential Austin resources — transportation, moving guide, job market, school districts, utilities, and city services.',
      },
    },

    /* ── 7. Live Data ──────────────────────────────────────── */
    {
      slug: 'live-data',
      title: 'Live Data',
      tagline: 'Water temps, lake levels, traffic, power outages, and real-time feeds.',
      icon: 'i-lucide-activity',
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
      subApps: [
        { slug: 'water-temps', title: 'Water Temps', description: 'Live water temperatures for Barton Springs, Lake Travis, and more.', status: 'live' },
        { slug: 'lake-levels', title: 'Lake Levels', description: 'Real-time Lake Travis and Lake Austin water levels from LCRA.', status: 'live' },
        { slug: 'traffic-map', title: 'Traffic Map', description: 'Live Austin traffic map — congestion, incidents, and construction.', status: 'coming-soon' },
        { slug: 'power-outages', title: 'Power Outages', description: 'Austin Energy outage map — current outages and restoration estimates.', status: 'coming-soon' },
        { slug: 'aqi-live', title: 'AQI Live', description: 'Real-time Air Quality Index from EPA stations across Austin.', status: 'coming-soon' },
        { slug: 'river-flow', title: 'River Flow', description: 'Colorado River flow rates from USGS gauges — kayaking and flood data.', status: 'coming-soon' },
      ],
      seo: {
        title: 'Austin Live Data — Water Temps, Lake Levels, Traffic & AQI',
        description: 'Real-time Austin data feeds — water temperatures, lake levels, traffic conditions, power outage maps, air quality, and river flow.',
      },
    },

    /* ── 8. Real Estate ────────────────────────────────────── */
    {
      slug: 'real-estate',
      title: 'Real Estate',
      tagline: 'Market trends, home prices, rent data, and where to live in Austin.',
      icon: 'i-lucide-home',
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-100 dark:bg-teal-900/30',
      subApps: [
        { slug: 'market-trends', title: 'Market Trends', description: 'Austin real estate market trends — sales volume, days on market, and outlook.', status: 'live' },
        { slug: 'median-home-prices', title: 'Median Home Prices', description: 'Median home prices by Austin neighborhood and zip code.', status: 'live' },
        { slug: 'property-tax-guide', title: 'Property Tax Guide', description: 'Travis County property tax guide — rates, exemptions, and protest tips.', status: 'live' },
        { slug: 'new-developments', title: 'New Developments', description: 'New construction and development projects across Austin.', status: 'live' },
        { slug: 'rent-trends', title: 'Rent Trends', description: 'Austin rent trends by neighborhood — averages, heatmap, and forecasts.', status: 'live' },
        { slug: 'housing-map', title: 'Housing Map', description: 'Interactive Austin housing map — prices, inventory, and market heat.', status: 'live' },
      ],
      seo: {
        title: 'Austin Real Estate — Market Trends, Home Prices & Rent Data',
        description: 'Austin real estate insights — market trends, median home prices, property tax guide, new developments, rent trends, and housing maps.',
      },
    },

    /* ── 9. Neighborhoods ──────────────────────────────────────
     *  Sub-apps are DATA-DRIVEN from the neighborhoods table.
     *  The neighborhoods/index.vue page fetches from /api/neighborhoods.
     *  This entry exists for homepage card grid, cross-links, and SEO.
     */
    {
      slug: 'neighborhoods',
      title: 'Neighborhoods',
      tagline: 'Downtown, SoCo, East Austin, and every corner of the ATX metro.',
      icon: 'i-lucide-map-pin',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      subApps: [],
      seo: {
        title: 'Austin Neighborhoods — 80+ Areas from Leander to Buda',
        description: 'Explore 80+ Austin neighborhoods — Downtown, South Congress, East Austin, Mueller, Round Rock, Cedar Park, and more. Find your perfect area in the ATX metro.',
      },
    },

    /* ── 10. Culture ───────────────────────────────────────── */
    {
      slug: 'culture',
      title: 'Culture',
      tagline: 'Museums, street art, history, and the soul of Austin.',
      icon: 'i-lucide-palette',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      subApps: [
        { slug: 'museums', title: 'Museums', description: 'Austin museums — Blanton, Bullock, the Contemporary, and more.', status: 'coming-soon' },
        { slug: 'street-art', title: 'Street Art', description: 'Map of murals, graffiti, and public art installations across Austin.', status: 'coming-soon' },
        { slug: 'history', title: 'History', description: 'Austin history — founding, growth, and the stories behind the city.', status: 'coming-soon' },
        { slug: 'local-brands', title: 'Local Brands', description: 'Iconic Austin brands — Tito\'s, Yeti, Deep Eddy, and local favorites.', status: 'coming-soon' },
        { slug: 'film-media', title: 'Film & Media', description: 'Austin film scene — studios, festivals, and Richard Linklater\'s legacy.', status: 'coming-soon' },
        { slug: 'iconic-austin', title: 'Iconic Austin', description: 'The definitive Austin bucket list — bat bridge, Zilker, Congress Ave, and beyond.', status: 'coming-soon' },
      ],
      seo: {
        title: 'Austin Culture — Museums, Street Art, History & Keep It Weird',
        description: 'Explore Austin\'s culture — museums, murals and street art, city history, local brands, film scene, and iconic Austin experiences.',
      },
    },

    /* ── 11. Fun ────────────────────────────────────────────── */
    {
      slug: 'fun',
      title: 'Fun',
      tagline: 'Date ideas, kid activities, scenic drives, and weekend inspiration.',
      icon: 'i-lucide-sparkles',
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-100 dark:bg-pink-900/30',
      subApps: [
        { slug: 'mini-games', title: 'Mini Games', description: 'Austin-themed mini games — trivia, quizzes, and fun challenges.', status: 'coming-soon' },
        { slug: 'date-ideas', title: 'Date Ideas', description: 'Best date spots in Austin — romantic, adventurous, and budget-friendly.', status: 'coming-soon' },
        { slug: 'kid-activities', title: 'Kid Activities', description: 'Things to do with kids in Austin — museums, parks, and family fun.', status: 'coming-soon' },
        { slug: 'scenic-drives', title: 'Scenic Drives', description: 'Hill Country scenic drives near Austin — routes, stops, and wildflowers.', status: 'coming-soon' },
        { slug: 'photo-spots', title: 'Photo Spots', description: 'Most Instagram-worthy spots in Austin — murals, overlooks, and sunsets.', status: 'coming-soon' },
        { slug: 'weekend-guides', title: 'Weekend Guides', description: 'Curated Austin weekend plans — what to do based on weather, events, and season.', status: 'coming-soon' },
      ],
      seo: {
        title: 'Fun in Austin — Date Ideas, Kid Activities & Weekend Plans',
        description: 'Fun things to do in Austin — date ideas, kid activities, scenic drives, photo spots, and curated weekend guides.',
      },
    },
  ]

  function getCategoryBySlug(slug: string): Category | undefined {
    return categories.find(c => c.slug === slug)
  }

  return { categories, getCategoryBySlug }
}
