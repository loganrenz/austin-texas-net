/**
 * Radar — Consolidated SEO intelligence utilities.
 *
 * Merges scoring, geo-filtering, intent classification, difficulty validation,
 * subtype tagging, coverage mapping, autocomplete, opportunity scoring, and seed data.
 */

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type KeywordSubtype =
  | 'MENU' | 'PHONE' | 'JOB' | 'PDF' | 'HOURS'
  | 'GUIDE' | 'MAP' | 'EVENT' | 'SEASONAL' | 'NEAR_ME'

export type Intent = 'commercial' | 'informational' | 'local' | 'navigational'

export interface SeedKeyword {
  keyword: string
  bucket: string
  estimatedVolume: number
}

export interface CoverageMatch {
  app: string
  domain: string
  url: string | null
}

export interface ScoreInputs {
  monthlyVolume: number
  trendScore: number
  risingScore: number
}

export interface StrategicScoreInput {
  monthlyVolume: number
  difficulty: number
  subtypes: KeywordSubtype[]
  isAustinGeo: boolean
  bucket: string
  keyword: string
}

export interface DifficultyValidationInput {
  keyword: string
  rawDifficulty: number
  monthlyVolume: number
  source?: 'estimated' | 'api'
}

export interface DifficultyValidationResult {
  difficulty: number
  difficultySource: 'estimated' | 'api'
  difficultyConfidence: 'high' | 'medium' | 'low'
  anomaly: string | null
}

export interface OpportunityInput {
  monthlyVolume: number
  difficulty: number
  seasonalityBoost?: number
  isCovered: boolean
}

export interface AutocompleteSuggestion {
  keyword: string
  source: 'suffix' | 'alpha'
}

// ═══════════════════════════════════════════════════════════════
// Composite Scoring
// ═══════════════════════════════════════════════════════════════

const WEIGHTS = { volume: 0.5, trend: 0.3, rising: 0.2 }

export function computeCompositeScore(inputs: ScoreInputs): number {
  const raw = inputs.monthlyVolume * WEIGHTS.volume
    + inputs.trendScore * WEIGHTS.trend
    + inputs.risingScore * WEIGHTS.rising
  return Math.round(Math.max(0, Math.min(100, raw)))
}

export function normalizeVolume(rawVolume: number): number {
  if (rawVolume <= 0) return 0
  const normalized = (Math.log10(rawVolume) / Math.log10(100000)) * 100
  return Math.round(Math.max(0, Math.min(100, normalized)))
}

// ═══════════════════════════════════════════════════════════════
// Geo Filter
// ═══════════════════════════════════════════════════════════════

const AUSTIN_GEO_TOKENS = [
  'austin', 'atx',
  'south congress', 'soco', 'east austin', 'south austin', 'north austin',
  'west austin', 'downtown austin', 'zilker', 'barton springs', 'barton creek',
  'mueller', 'domain', 'rainey street', 'rainey', '6th street', 'sixth street',
  'south lamar', 'north loop', 'hyde park', 'tarrytown', 'clarksville',
  'bouldin', 'travis heights', 'east cesar chavez', 'montopolis',
  'crestview', 'allandale', 'rosedale', 'brentwood', 'windsor park',
  'university hills', 'dove springs', 'onion creek', 'circle c',
  'great hills', 'arboretum', 'jollyville', 'balcones',
  'round rock', 'cedar park', 'pflugerville', 'lakeway', 'bee cave',
  'bee caves', 'west lake hills', 'westlake', 'lago vista',
  'leander', 'liberty hill', 'georgetown', 'hutto', 'taylor',
  'kyle', 'buda', 'dripping springs', 'manor', 'elgin',
  'bastrop', 'smithville', 'wimberley', 'san marcos',
  'lake travis', 'lake austin', 'lady bird lake', 'town lake',
  'barton springs pool', 'deep eddy', 'hamilton pool',
  'mckinney falls', 'mount bonnell', 'mt bonnell', 'pennybacker',
  'congress bridge', 'bat bridge', 'greenbelt',
  'travis county', 'williamson county', 'hays county',
]

const EXCLUDED_GEO_PATTERNS = [
  'california', 'florida', 'new york', 'ohio', 'georgia',
  'colorado', 'arizona', 'illinois', 'michigan', 'virginia',
  'washington state', 'oregon', 'nevada', 'minnesota',
  'north carolina', 'south carolina', 'tennessee', 'alabama',
  'louisiana', 'maryland', 'indiana', 'missouri', 'wisconsin',
  'massachusetts', 'new jersey', 'pennsylvania', 'connecticut',
  'dallas tx', 'houston tx', 'san antonio tx',
  'chicago', 'los angeles', 'new york city', 'nyc', 'miami',
  'denver', 'seattle', 'portland', 'phoenix', 'atlanta',
  'nashville', 'boston', 'detroit', 'san francisco', 'sf',
  'las vegas',
]

export function isAustinGeo(keyword: string): boolean {
  const lc = keyword.toLowerCase().trim()
  for (const pattern of EXCLUDED_GEO_PATTERNS) {
    if (lc.includes(pattern)) return false
  }
  for (const token of AUSTIN_GEO_TOKENS) {
    if (lc.includes(token)) return true
  }
  return false
}

// ═══════════════════════════════════════════════════════════════
// Intent Classifier
// ═══════════════════════════════════════════════════════════════

const COMMERCIAL_SIGNALS = [
  'best', 'top', 'review', 'cheap', 'affordable', 'price', 'cost',
  'compare', 'vs', 'buy', 'deal', 'discount', 'worth', 'recommend',
  'favorite', 'popular', 'rated', 'premium', 'luxury',
]

const INFORMATIONAL_SIGNALS = [
  'how to', 'what is', 'when is', 'why', 'guide',
  'tips', 'history', 'meaning', 'definition', 'explained',
  'tutorial', 'learn', 'facts', 'information',
]

const LOCAL_SIGNALS = [
  'near me', 'near', 'nearby', 'close to', 'around',
  'open now', 'open late', 'open early', 'open today',
  'downtown', 'south austin', 'north austin', 'east austin', 'west austin',
  'south congress', 'rainey', '6th street', 'zilker', 'mueller', 'domain',
  'cedar park', 'round rock', 'pflugerville', 'south lamar',
  'north loop', 'east side', 'west lake', 'barton', 'great hills',
  'in austin',
  'with a view', 'on the lake', 'on the water', 'on the river',
  'on lake travis', 'on lake austin', 'on lady bird',
  'waterfront', 'lakeside', 'rooftop',
  'map', 'directions', 'location', 'where',
  'reservations', 'walk in', 'takeout', 'delivery',
  'for large groups', 'for groups', 'for families', 'for kids',
  'dog friendly', 'kid friendly', 'pet friendly',
  'outdoor seating', 'outdoor dining', 'patio',
  'date night', 'romantic',
]

const NAVIGATIONAL_SIGNALS = [
  'atx-apps', 'website', 'app', 'schedule',
  'address', 'phone', 'contact', 'book',
]

export function classifyIntent(keyword: string): Intent {
  const lc = keyword.toLowerCase()
  if (LOCAL_SIGNALS.some(s => lc.includes(s))) return 'local'
  if (COMMERCIAL_SIGNALS.some(s => lc.includes(s))) return 'commercial'
  if (NAVIGATIONAL_SIGNALS.some(s => lc.includes(s))) return 'navigational'
  if (INFORMATIONAL_SIGNALS.some(s => lc.includes(s))) return 'informational'
  return 'informational'
}

export function estimateDifficulty(keyword: string, volume: number, intent: Intent): number {
  let diff = Math.min(85, Math.round(Math.log10(Math.max(volume, 10)) * 15))
  if (intent === 'commercial') diff = Math.min(95, diff + 12)
  if (intent === 'local') diff = Math.max(10, diff - 15)
  if (intent === 'navigational') diff = Math.max(5, diff - 20)

  const wordCount = keyword.split(/\s+/).length
  if (wordCount >= 3) diff = Math.max(5, diff - 8)
  if (wordCount >= 4) diff = Math.max(5, diff - 10)
  if (wordCount >= 5) diff = Math.max(5, diff - 8)
  if (wordCount >= 6) diff = Math.max(5, diff - 5)

  const lc = keyword.toLowerCase()
  const MODIFIER_DISCOUNT_SIGNALS = [
    'indian', 'mexican', 'italian', 'chinese', 'korean', 'thai',
    'japanese', 'vietnamese', 'mediterranean', 'french', 'greek',
    'ethiopian', 'persian', 'cajun', 'southern', 'asian',
    'vegan', 'vegetarian', 'gluten free', 'healthy',
    'bbq', 'sushi', 'ramen', 'tacos', 'pizza', 'burger',
    'seafood', 'steak', 'brunch', 'breakfast', 'lunch', 'dinner',
    'for families', 'for kids', 'for groups', 'for large groups',
    'dog friendly', 'kid friendly', 'pet friendly',
    'with a view', 'on the lake', 'on the water', 'rooftop',
    'outdoor', 'patio', 'romantic', 'date night', 'late night',
    'on thanksgiving', 'on christmas', 'new year', 'weekend',
    'tonight', 'this weekend', 'open late', 'open now',
  ]
  const modifierCount = MODIFIER_DISCOUNT_SIGNALS.filter(m => lc.includes(m)).length
  if (modifierCount >= 1) diff = Math.max(5, diff - 10)
  if (modifierCount >= 2) diff = Math.max(5, diff - 5)

  return Math.round(Math.max(5, Math.min(95, diff)))
}

// ═══════════════════════════════════════════════════════════════
// Difficulty Validator
// ═══════════════════════════════════════════════════════════════

const COMPETITIVE_MODIFIERS = [
  'restaurants', 'best', 'downtown', 'lake', 'brunch', 'bbq', 'tacos',
  'bars', 'hotels', 'apartments', 'coffee', 'pizza', 'sushi',
  'nightlife', 'food trucks', 'breweries', 'steakhouse', 'rooftop bar',
  'happy hour', 'date night', 'things to do',
]
const DIFFICULTY_FLOOR = 35

export function validateDifficulty(input: DifficultyValidationInput): DifficultyValidationResult {
  const { keyword, rawDifficulty, monthlyVolume, source = 'estimated' } = input
  const lc = keyword.toLowerCase()

  if (source === 'api') {
    return { difficulty: rawDifficulty, difficultySource: 'api', difficultyConfidence: 'high', anomaly: null }
  }

  let correctedDifficulty = rawDifficulty
  let anomaly: string | null = null
  let confidence: 'high' | 'medium' | 'low' = 'medium'

  const suspiciouslyLow = rawDifficulty < 15 && monthlyVolume > 100
  if (suspiciouslyLow) {
    correctedDifficulty = Math.max(correctedDifficulty, DIFFICULTY_FLOOR)
    anomaly = `floor-enforced: raw ${rawDifficulty} → ${correctedDifficulty} (vol=${monthlyVolume} too high for diff<15)`
    confidence = 'low'
  }

  const hasCompetitiveModifier = COMPETITIVE_MODIFIERS.some(mod => lc.includes(mod))
  if (hasCompetitiveModifier && rawDifficulty < DIFFICULTY_FLOOR) {
    correctedDifficulty = Math.max(correctedDifficulty, DIFFICULTY_FLOOR)
    const matchedMod = COMPETITIVE_MODIFIERS.find(mod => lc.includes(mod))
    anomaly = anomaly
      ? `${anomaly}; competitive-modifier "${matchedMod}" enforced floor`
      : `floor-enforced: raw ${rawDifficulty} → ${correctedDifficulty} (competitive modifier "${matchedMod}")`
    confidence = 'low'
  }

  if (!anomaly) {
    const expectedMin = Math.max(10, Math.round(Math.log10(Math.max(monthlyVolume, 10)) * 8))
    const expectedMax = Math.min(95, expectedMin + 40)
    confidence = (correctedDifficulty >= expectedMin && correctedDifficulty <= expectedMax) ? 'high' : 'medium'
  }

  return { difficulty: correctedDifficulty, difficultySource: source, difficultyConfidence: confidence, anomaly }
}

// ═══════════════════════════════════════════════════════════════
// Subtype Tagger
// ═══════════════════════════════════════════════════════════════

interface SubtypeRule { subtype: KeywordSubtype; patterns: RegExp[] }

const SUBTYPE_RULES: SubtypeRule[] = [
  { subtype: 'MENU', patterns: [/\bmenu\b/, /\bprices?\b/, /\bwhat to order\b/, /\bfood list\b/] },
  { subtype: 'PHONE', patterns: [/\bphone\s*(?:number)?\b/, /\bcall\b/, /\bcontact\s*(?:info|number|us)?\b/] },
  { subtype: 'JOB', patterns: [/\bjobs?\b/, /\bhiring\b/, /\bcareers?\b/, /\bemployment\b/, /\bsalary\b/] },
  { subtype: 'PDF', patterns: [/\bpdf\b/, /\bdownload\b/, /\bprintable\b/, /\bbrochure\b/] },
  { subtype: 'HOURS', patterns: [/\bhours?\b/, /\bopen(?:ing)?\s*(?:times?|hours?)?\b/, /\bclose(?:d|s|ing)?\b/, /\bschedule\b/] },
  { subtype: 'GUIDE', patterns: [/\bguide\b/, /\btips?\b/, /\bhow to\b/, /\bcomplete\s+guide\b/, /\bultimate\b/, /\bbeginners?\b/] },
  { subtype: 'MAP', patterns: [/\bmap\b/, /\blocation(?:s)?\b/, /\bdirections?\b/, /\bwhere (?:is|are|to)\b/] },
  { subtype: 'EVENT', patterns: [/\bevent(?:s)?\b/, /\bfestival(?:s)?\b/, /\bconcert(?:s)?\b/, /\bshow(?:s)?\b/, /\bticket(?:s)?\b/, /\btonight\b/, /\bupcoming\b/] },
  { subtype: 'SEASONAL', patterns: [/\bspring\b/, /\bsummer\b/, /\bfall\b/, /\bwinter\b/, /\bchristmas\b/, /\bhalloween\b/, /\bthanksgiving\b/, /\bnew year\b/, /\bseason(?:al)?\b/, /\bholiday(?:s)?\b/, /\bbluebon+et(?:s)?\b/, /\bpollen\b/] },
  { subtype: 'NEAR_ME', patterns: [/\bnear me\b/, /\bnearby\b/, /\baround (?:me|here)\b/, /\bclose (?:to|by)\b/] },
]

export function tagSubtypes(keyword: string): KeywordSubtype[] {
  const lc = keyword.toLowerCase()
  const matches: KeywordSubtype[] = []
  for (const rule of SUBTYPE_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(lc)) { matches.push(rule.subtype); break }
    }
  }
  return matches
}

// ═══════════════════════════════════════════════════════════════
// Strategic Scorer (v4 LOCKED)
// ═══════════════════════════════════════════════════════════════

const SUBTYPE_ADJUSTMENTS: Partial<Record<KeywordSubtype, number>> = {
  GUIDE: +0.25, MAP: +0.25, SEASONAL: +0.20, EVENT: +0.15, NEAR_ME: +0.15,
  MENU: -0.40, PHONE: -0.40, JOB: -0.30, PDF: -0.25, HOURS: -0.10,
}

interface LocalSignal { id: string; pattern: RegExp; boost: number; consumedBy?: string[] }

const LOCAL_INTENT_SIGNALS: LocalSignal[] = [
  { id: 'near_me',      pattern: /\bnear me\b/,                boost: 0.25 },
  { id: 'open_now',     pattern: /\bopen now\b/,               boost: 0.20 },
  { id: 'open_late',    pattern: /\bopen late\b/,              boost: 0.15 },
  { id: 'open_today',   pattern: /\bopen today\b/,             boost: 0.15 },
  { id: 'happy_hour',   pattern: /\bhappy hour\b/,             boost: 0.15 },
  { id: 'this_weekend', pattern: /\bthis weekend\b/,           boost: 0.15 },
  { id: 'date_night',   pattern: /\bdate night\b/,             boost: 0.10 },
  { id: 'late_night',   pattern: /\blate night\b/,             boost: 0.10 },
  { id: 'with_view',    pattern: /\bwith a view\b/,            boost: 0.10 },
  { id: 'on_lake',      pattern: /\bon the (?:lake|water|river)\b/, boost: 0.10 },
  { id: 'walk_in',      pattern: /\bwalk[ -]?in\b/,            boost: 0.10 },
  { id: 'reservations', pattern: /\breservation(?:s)?\b/,      boost: 0.15 },
  { id: 'tonight',      pattern: /\btonight\b/,                boost: 0.15 },
  { id: 'hours',        pattern: /\bhours?\b/,                 boost: 0.10, consumedBy: ['happy_hour', 'open_now', 'open_late', 'open_today'] },
  { id: 'takeout',      pattern: /\btakeout\b/,                boost: 0.10 },
  { id: 'delivery',     pattern: /\bdelivery\b/,               boost: 0.10 },
  { id: 'rooftop',      pattern: /\brooftop\b/,                boost: 0.10 },
  { id: 'patio',        pattern: /\bpatio\b/,                  boost: 0.10 },
  { id: 'outdoor',      pattern: /\boutdoor\b/,                boost: 0.10 },
  { id: 'downtown',     pattern: /\bdowntown\b/,               boost: 0.05 },
  { id: 'near',         pattern: /\bnear\b/,                   boost: 0.05, consumedBy: ['near_me'] },
]
const LOCAL_INTENT_CAP = 0.45

const HEAD_TERMS = [
  'austin restaurants', 'austin weather', 'austin bbq',
  'austin tacos', 'austin bars', 'austin food',
  'austin things to do', 'austin hotels',
  'austin coffee', 'austin pizza', 'austin brunch',
  'austin nightlife', 'austin parks', 'austin hiking',
  'austin apartments', 'austin rent', 'austin live music',
  'austin sushi', 'austin breweries', 'austin food trucks',
]

const HEAD_TERM_MODIFIERS = [
  /\bnear\b/, /\bin\b/, /\bon\b/, /\bat\b/,
  /\bsouth\b/, /\bnorth\b/, /\beast\b/, /\bwest\b/, /\bdowntown\b/,
  /\blake\b/, /\bbarton\b/, /\bzilker\b/, /\bdomain\b/, /\brainey\b/,
  /\bcongress\b/, /\blamar\b/, /\bmanor\b/, /\bmueller\b/,
  /\bround rock\b/, /\bcedar park\b/, /\bpflugerville\b/,
  /\bnear me\b/, /\bopen (?:now|late|early|today)\b/,
  /\bwith (?:a |)view\b/, /\bon the (?:lake|water|river)\b/,
  /\bdog[ -]?friendly\b/, /\bkid[ -]?friendly\b/, /\bpet[ -]?friendly\b/,
  /\brooftop\b/, /\boutdoor(?:\s+(?:seating|dining|patio))?\b/, /\bpatio\b/,
  /\bcheap\b/, /\baffordable\b/, /\bbest\b/, /\btop\b/,
  /\bhidden gem\b/, /\bunderrated\b/, /\bnew\b/,
  /\bfamily\b/, /\bromantic\b/, /\bdate night\b/, /\blate night\b/,
  /\bguide\b/, /\btips\b/, /\bhow to\b/, /\bbeginner\b/,
  /\bfor (?:large |)groups?\b/, /\bfor (?:families|kids|couples)\b/,
  /\bindian\b/, /\bmexican\b/, /\bitalian\b/, /\bchinese\b/,
  /\bkorean\b/, /\bthai\b/, /\bjapanese\b/, /\bvietnamese\b/,
  /\bmediterranean\b/, /\bfrench\b/, /\bgreek\b/, /\bethiopian\b/,
  /\bcajun\b/, /\bsouthern\b/, /\basian\b/, /\bvegan\b/, /\bvegetarian\b/,
  /\bgluten free\b/, /\bhealthy\b/,
  /\bthanksgiving\b/, /\bchristmas\b/, /\bnew year\b/, /\bweekend\b/,
  /\btonight\b/, /\bthis weekend\b/, /\bhalloween\b/,
  /\breservation(?:s)?\b/, /\bwalk[ -]?in\b/,
  /\btakeout\b/, /\bdelivery\b/, /\bbrunch\b/, /\blunch\b/, /\bdinner\b/,
  /\breddit\b/, /\byelp\b/,
]
const HEAD_TERM_PENALTY = 0.30

const BUCKET_WEIGHTS: Record<string, number> = {
  food: 0.80, outdoors: 1.10, places: 1.05, events: 1.00,
  neighborhoods: 1.10, housing: 0.90, weather: 1.05,
}

export function computeStrategicScore(input: StrategicScoreInput): number {
  const { monthlyVolume, difficulty, subtypes, isAustinGeo, bucket, keyword } = input
  if (!isAustinGeo) return 0

  const volNorm = Math.min(100, Math.round(Math.log10(Math.max(monthlyVolume, 1) + 1) * 22))
  const linearDiff = 1 - (difficulty / 100)
  const diffFactor = difficulty > 60 ? Math.pow(linearDiff, 1.5) : linearDiff
  const base = volNorm * diffFactor

  let fitBoost = 0
  for (const st of subtypes) { fitBoost += SUBTYPE_ADJUSTMENTS[st] ?? 0 }

  const lc = keyword.toLowerCase()
  let localBoost = 0
  const matchedIds = new Set<string>()
  for (const signal of LOCAL_INTENT_SIGNALS) {
    if (signal.consumedBy?.some(parentId => matchedIds.has(parentId))) continue
    if (signal.pattern.test(lc)) { localBoost += signal.boost; matchedIds.add(signal.id) }
  }
  localBoost = Math.min(localBoost, LOCAL_INTENT_CAP)

  let headPenalty = 0
  const isHeadTerm = HEAD_TERMS.some(ht => lc === ht || lc === ht.replace('austin ', ''))
  if (isHeadTerm) {
    if (!HEAD_TERM_MODIFIERS.some(mod => mod.test(lc))) headPenalty = HEAD_TERM_PENALTY
  }
  if (!isHeadTerm) {
    const matchedHead = HEAD_TERMS.find(ht => lc.startsWith(ht + ' '))
    if (matchedHead) {
      const remainder = lc.slice(matchedHead.length).trim()
      if (remainder.length > 0) headPenalty = 0
    }
  }

  const combinedMultiplier = Math.max(0.1, 1.0 + fitBoost + localBoost - headPenalty)
  const geoMultiplier = 1.25
  const bucketWeight = BUCKET_WEIGHTS[bucket] ?? 1.0
  const raw = base * combinedMultiplier * geoMultiplier * bucketWeight

  return Math.round(Math.max(0, Math.min(100, raw)))
}

// ═══════════════════════════════════════════════════════════════
// Coverage Mapper
// ═══════════════════════════════════════════════════════════════

interface AppMapping { slug: string; domain: string; patterns: string[] }

const ATX_APP_MAP: AppMapping[] = [
  { slug: 'food-trucks', domain: 'food-trucks.atx-apps.com', patterns: ['food truck', 'food trailer'] },
  { slug: 'breakfast-tacos', domain: 'breakfast-tacos.atx-apps.com', patterns: ['breakfast taco', 'breakfast burrito', 'morning taco'] },
  { slug: 'happy-hours', domain: 'happy-hours.atx-apps.com', patterns: ['happy hour', 'drink special', 'drink deal'] },
  { slug: 'crawfish-boils', domain: 'crawfish-boils.atx-apps.com', patterns: ['crawfish', 'crayfish', 'crawdad'] },
  { slug: 'live-music', domain: 'live-music.atx-apps.com', patterns: ['live music', 'music venue', 'concert', 'band tonight', 'open mic'] },
  { slug: 'bat-bridge', domain: 'bat-bridge.atx-apps.com', patterns: ['bat bridge', 'congress bridge bat', 'bat colony', 'bat watching'] },
  { slug: 'bluebonnets', domain: 'bluebonnets.atx-apps.com', patterns: ['bluebonnet', 'wildflower', 'bluebonnet field', 'bluebonnet photo'] },
  { slug: 'austin-cedar-pollen', domain: 'austin-cedar-pollen.atx-apps.com', patterns: ['cedar pollen', 'cedar fever', 'cedar allergy', 'juniper pollen', 'cedar count'] },
  { slug: 'oak-pollen', domain: 'oak-pollen.atx-apps.com', patterns: ['oak pollen', 'oak allergy', 'oak tree pollen'] },
  { slug: 'water-temps', domain: 'water-temps.atx-apps.com', patterns: ['water temperature', 'water temp', 'swim temperature', 'lake temperature', 'barton springs temp'] },
  { slug: 'rent-heatmap', domain: 'rent-heatmap.atx-apps.com', patterns: ['rent', 'apartment', 'rental', 'lease', 'studio apartment', 'rent price'] },
  { slug: 'disc-golf', domain: 'disc-golf.atx-apps.com', patterns: ['disc golf', 'frisbee golf', 'disc golf course'] },
  { slug: 'chicken-shit-bingo', domain: 'chicken-shit-bingo.atx-apps.com', patterns: ['chicken shit bingo', 'chicken bingo'] },
  { slug: 'rodeo-austin', domain: 'rodeo-austin.atx-apps.com', patterns: ['rodeo', 'rodeo austin', 'star of texas rodeo', 'bull riding'] },
  { slug: 'street-art', domain: 'street-art.atx-apps.com', patterns: ['street art', 'mural', 'graffiti', 'wall art', 'hope outdoor'] },
  { slug: 'kayak-launches', domain: 'kayak-launches.atx-apps.com', patterns: ['kayak', 'canoe', 'kayak launch', 'paddle', 'kayak rental'] },
  { slug: 'haunted-austin', domain: 'haunted-austin.atx-apps.com', patterns: ['haunted', 'ghost tour', 'paranormal', 'scary', 'halloween'] },
  { slug: 'hoods', domain: 'hoods.atx-apps.com', patterns: ['neighborhood', 'best neighborhood', 'neighborhood guide', 'area guide'] },
  { slug: 'great-hills-restaurants', domain: 'great-hills-restaurants.atx-apps.com', patterns: ['great hills', 'arboretum restaurant'] },
  { slug: 'austin-texas-net', domain: 'austin-texas.net', patterns: ['things to do', 'travel guide', 'visitor guide', 'weekend in austin', 'moving to austin'] },
]

export function matchKeywordToApp(keyword: string): CoverageMatch | null {
  const lc = keyword.toLowerCase()
  for (const app of ATX_APP_MAP) {
    for (const pattern of app.patterns) {
      if (lc.includes(pattern)) {
        return { app: app.slug, domain: app.domain, url: `https://${app.domain}` }
      }
    }
  }
  return null
}

function hasTopicOverlap(keyword: string, appSlug: string): boolean {
  const TOPIC_MAP: Record<string, string[]> = {
    'food-trucks': ['food', 'eat', 'restaurant', 'taco', 'bbq'],
    'live-music': ['music', 'concert', 'band', 'festival', 'sxsw'],
    'bluebonnets': ['flower', 'spring', 'nature', 'wildflower'],
    'kayak-launches': ['kayak', 'canoe', 'paddle', 'lake', 'river'],
    'rent-heatmap': ['apartment', 'rent', 'housing', 'living'],
  }
  const topics = TOPIC_MAP[appSlug]
  if (!topics) return false
  return topics.some(t => keyword.includes(t))
}

export function suggestInternalLinks(keyword: string, excludeApp?: string): string[] {
  const lc = keyword.toLowerCase()
  const links: string[] = []
  for (const app of ATX_APP_MAP) {
    if (app.slug === excludeApp) continue
    for (const pattern of app.patterns) {
      if (lc.includes(pattern) || hasTopicOverlap(lc, app.slug)) {
        links.push(`https://${app.domain}`)
        break
      }
    }
    if (links.length >= 3) break
  }
  return links
}

// ═══════════════════════════════════════════════════════════════
// Opportunity Score
// ═══════════════════════════════════════════════════════════════

export function computeOpportunityScore(input: OpportunityInput): number {
  const { monthlyVolume, difficulty, seasonalityBoost = 1.0, isCovered } = input
  const volNorm = Math.min(100, Math.round(Math.log10(Math.max(monthlyVolume, 1) + 1) * 22))
  const diffFactor = 1 - (difficulty / 100)
  const gapMultiplier = isCovered ? 1.0 : 1.5
  const raw = volNorm * diffFactor * seasonalityBoost * gapMultiplier
  return Math.round(Math.max(0, Math.min(100, raw)))
}

export function getSeasonalityBoost(keyword: string): number {
  const month = new Date().getMonth()
  const SEASONAL_KEYWORDS: Record<string, number[]> = {
    'bluebonnet': [0.6, 0.8, 1.4, 1.5, 1.2, 0.6, 0.4, 0.4, 0.4, 0.5, 0.5, 0.5],
    'pollen':     [1.3, 1.5, 1.4, 1.0, 0.6, 0.4, 0.3, 0.3, 0.5, 0.8, 1.0, 1.3],
    'cedar':      [1.5, 1.4, 1.0, 0.5, 0.3, 0.3, 0.3, 0.3, 0.5, 0.8, 1.2, 1.5],
    'swimming':   [0.4, 0.5, 0.7, 1.0, 1.4, 1.5, 1.5, 1.4, 1.0, 0.7, 0.4, 0.3],
    'swim':       [0.4, 0.5, 0.7, 1.0, 1.4, 1.5, 1.5, 1.4, 1.0, 0.7, 0.4, 0.3],
    'tubing':     [0.3, 0.4, 0.6, 0.9, 1.3, 1.5, 1.5, 1.3, 0.8, 0.5, 0.3, 0.3],
    'kayak':      [0.5, 0.6, 0.8, 1.1, 1.3, 1.4, 1.4, 1.3, 1.0, 0.7, 0.5, 0.4],
    'crawfish':   [0.5, 0.8, 1.3, 1.5, 1.3, 0.8, 0.4, 0.3, 0.3, 0.3, 0.4, 0.5],
    'rodeo':      [0.5, 0.8, 1.5, 1.3, 0.6, 0.4, 0.4, 0.4, 0.5, 0.6, 0.6, 0.5],
    'halloween':  [0.3, 0.3, 0.3, 0.3, 0.3, 0.4, 0.6, 0.9, 1.4, 1.5, 0.4, 0.3],
    'christmas':  [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.4, 0.6, 0.9, 1.4, 1.5],
    'brunch':     [1.1, 1.1, 1.2, 1.2, 1.1, 1.0, 0.9, 0.9, 0.9, 1.0, 1.1, 1.1],
    'hiking':     [0.7, 0.8, 1.1, 1.3, 1.2, 0.8, 0.6, 0.6, 0.8, 1.2, 1.1, 0.8],
    'bat':        [0.3, 0.4, 0.6, 0.9, 1.2, 1.4, 1.5, 1.4, 1.0, 0.7, 0.4, 0.3],
    'festival':   [0.6, 0.7, 1.3, 1.2, 1.0, 0.9, 0.7, 0.7, 1.0, 1.3, 0.8, 0.6],
  }
  const lc = keyword.toLowerCase()
  for (const [fragment, weights] of Object.entries(SEASONAL_KEYWORDS)) {
    if (lc.includes(fragment)) return weights[month]!
  }
  return 1.0
}

// ═══════════════════════════════════════════════════════════════
// Autocomplete
// ═══════════════════════════════════════════════════════════════

const AUTOCOMPLETE_URL = 'https://suggestqueries.google.com/complete/search'

const SUFFIXES = [
  '', 'near me', 'today', 'this weekend', 'schedule', 'map', 'best',
  'free', 'cheap', 'guide', 'spots', 'top', 'new', '2026',
  'hidden gem', 'downtown', 'south', 'east', 'north',
]

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')

export async function fetchAutocompleteSuggestions(seedKeyword: string): Promise<AutocompleteSuggestion[]> {
  const seen = new Set<string>()
  const results: AutocompleteSuggestion[] = []
  const queries: { query: string; source: 'suffix' | 'alpha' }[] = []

  for (const suffix of SUFFIXES) {
    queries.push({ query: suffix ? `${seedKeyword} ${suffix}` : seedKeyword, source: 'suffix' })
  }
  for (const letter of ALPHABET) {
    queries.push({ query: `${seedKeyword} ${letter}`, source: 'alpha' })
  }

  const BATCH_SIZE = 8
  for (let i = 0; i < queries.length; i += BATCH_SIZE) {
    const batch = queries.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.all(
      batch.map(async ({ query, source }) => {
        const suggestions = await fetchSuggest(query)
        return suggestions.map(s => ({ keyword: s.toLowerCase().trim(), source }))
      }),
    )
    for (const items of batchResults) {
      for (const item of items) {
        if (!seen.has(item.keyword) && item.keyword.includes('austin')) {
          seen.add(item.keyword)
          results.push(item)
        }
      }
    }
  }
  return results
}

async function fetchSuggest(query: string): Promise<string[]> {
  try {
    const url = new URL(AUTOCOMPLETE_URL)
    url.searchParams.set('client', 'firefox')
    url.searchParams.set('q', query)
    url.searchParams.set('hl', 'en')
    url.searchParams.set('gl', 'us')
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ATXApps/1.0)' },
    })
    if (!res.ok) return []
    const data = await res.json() as [string, string[]]
    return data[1] || []
  } catch { return [] }
}

// ═══════════════════════════════════════════════════════════════
// Seed Keywords
// ═══════════════════════════════════════════════════════════════

export const BUCKETS = ['food', 'outdoors', 'places', 'events', 'neighborhoods', 'housing', 'weather'] as const
export type Bucket = typeof BUCKETS[number]

export const SEED_KEYWORDS: SeedKeyword[] = [
  // Food & Drink
  { keyword: 'austin restaurants', bucket: 'food', estimatedVolume: 33100 },
  { keyword: 'austin tacos', bucket: 'food', estimatedVolume: 12100 },
  { keyword: 'austin bbq', bucket: 'food', estimatedVolume: 18100 },
  { keyword: 'austin happy hour', bucket: 'food', estimatedVolume: 6600 },
  { keyword: 'austin food trucks', bucket: 'food', estimatedVolume: 8100 },
  { keyword: 'austin brunch', bucket: 'food', estimatedVolume: 9900 },
  { keyword: 'austin coffee shops', bucket: 'food', estimatedVolume: 5400 },
  { keyword: 'austin breakfast tacos', bucket: 'food', estimatedVolume: 4400 },
  { keyword: 'austin pizza', bucket: 'food', estimatedVolume: 4400 },
  { keyword: 'austin sushi', bucket: 'food', estimatedVolume: 3600 },
  { keyword: 'austin breweries', bucket: 'food', estimatedVolume: 5400 },
  { keyword: 'austin crawfish', bucket: 'food', estimatedVolume: 2900 },
  { keyword: 'austin tex mex', bucket: 'food', estimatedVolume: 4400 },
  { keyword: 'austin ramen', bucket: 'food', estimatedVolume: 3600 },
  { keyword: 'austin seafood', bucket: 'food', estimatedVolume: 2900 },
  { keyword: 'austin mexican food', bucket: 'food', estimatedVolume: 6600 },
  { keyword: 'austin steakhouse', bucket: 'food', estimatedVolume: 2400 },
  { keyword: 'austin burger', bucket: 'food', estimatedVolume: 3600 },
  { keyword: 'austin bakery', bucket: 'food', estimatedVolume: 2400 },
  { keyword: 'austin wine bar', bucket: 'food', estimatedVolume: 1900 },
  { keyword: 'austin ice cream', bucket: 'food', estimatedVolume: 2400 },
  { keyword: 'austin dim sum', bucket: 'food', estimatedVolume: 1600 },
  { keyword: 'austin thai food', bucket: 'food', estimatedVolume: 2400 },
  { keyword: 'austin indian food', bucket: 'food', estimatedVolume: 2400 },
  { keyword: 'austin korean food', bucket: 'food', estimatedVolume: 1900 },
  { keyword: 'austin vegan', bucket: 'food', estimatedVolume: 2400 },
  { keyword: 'austin rooftop bar', bucket: 'food', estimatedVolume: 3600 },
  { keyword: 'austin cocktail bar', bucket: 'food', estimatedVolume: 2400 },
  { keyword: 'austin date night', bucket: 'food', estimatedVolume: 4400 },
  { keyword: 'austin late night food', bucket: 'food', estimatedVolume: 2900 },
  // Outdoors
  { keyword: 'austin hiking', bucket: 'outdoors', estimatedVolume: 14800 },
  { keyword: 'austin swimming holes', bucket: 'outdoors', estimatedVolume: 8100 },
  { keyword: 'austin parks', bucket: 'outdoors', estimatedVolume: 6600 },
  { keyword: 'austin greenbelt', bucket: 'outdoors', estimatedVolume: 9900 },
  { keyword: 'austin kayaking', bucket: 'outdoors', estimatedVolume: 3600 },
  { keyword: 'austin disc golf', bucket: 'outdoors', estimatedVolume: 2400 },
  { keyword: 'austin bluebonnets', bucket: 'outdoors', estimatedVolume: 6600 },
  { keyword: 'austin camping', bucket: 'outdoors', estimatedVolume: 3600 },
  { keyword: 'austin tubing', bucket: 'outdoors', estimatedVolume: 6600 },
  { keyword: 'austin fishing', bucket: 'outdoors', estimatedVolume: 2400 },
  { keyword: 'austin biking trails', bucket: 'outdoors', estimatedVolume: 2400 },
  { keyword: 'austin running trails', bucket: 'outdoors', estimatedVolume: 1900 },
  { keyword: 'austin paddle boarding', bucket: 'outdoors', estimatedVolume: 2400 },
  { keyword: 'austin dog parks', bucket: 'outdoors', estimatedVolume: 2900 },
  // Places
  { keyword: 'barton springs austin', bucket: 'places', estimatedVolume: 12100 },
  { keyword: 'austin lake travis', bucket: 'places', estimatedVolume: 5400 },
  { keyword: 'lake austin', bucket: 'places', estimatedVolume: 5400 },
  { keyword: 'mckinney falls austin', bucket: 'places', estimatedVolume: 4400 },
  { keyword: 'mount bonnell austin', bucket: 'places', estimatedVolume: 6600 },
  { keyword: 'hamilton pool austin', bucket: 'places', estimatedVolume: 8100 },
  { keyword: 'austin airport', bucket: 'places', estimatedVolume: 12100 },
  { keyword: 'austin bat bridge', bucket: 'places', estimatedVolume: 4400 },
  { keyword: 'austin zoo', bucket: 'places', estimatedVolume: 4400 },
  { keyword: 'austin museums', bucket: 'places', estimatedVolume: 3600 },
  { keyword: 'austin farmers market', bucket: 'places', estimatedVolume: 3600 },
  { keyword: 'deep eddy pool austin', bucket: 'places', estimatedVolume: 3600 },
  { keyword: 'zilker park austin', bucket: 'places', estimatedVolume: 6600 },
  { keyword: 'lady bird lake austin', bucket: 'places', estimatedVolume: 5400 },
  { keyword: 'austin convention center', bucket: 'places', estimatedVolume: 3600 },
  { keyword: 'south congress austin', bucket: 'places', estimatedVolume: 8100 },
  { keyword: 'austin domain', bucket: 'places', estimatedVolume: 5400 },
  { keyword: 'rainey street austin', bucket: 'places', estimatedVolume: 4400 },
  { keyword: '6th street austin', bucket: 'places', estimatedVolume: 6600 },
  { keyword: 'pennybacker bridge austin', bucket: 'places', estimatedVolume: 2400 },
  // Events
  { keyword: 'austin live music', bucket: 'events', estimatedVolume: 9900 },
  { keyword: 'austin things to do', bucket: 'events', estimatedVolume: 40500 },
  { keyword: 'austin festivals', bucket: 'events', estimatedVolume: 6600 },
  { keyword: 'austin comedy shows', bucket: 'events', estimatedVolume: 2400 },
  { keyword: 'austin rodeo', bucket: 'events', estimatedVolume: 8100 },
  { keyword: 'chicken shit bingo austin', bucket: 'events', estimatedVolume: 3600 },
  { keyword: 'austin street art', bucket: 'events', estimatedVolume: 1900 },
  { keyword: 'austin nightlife', bucket: 'events', estimatedVolume: 6600 },
  { keyword: 'austin concerts', bucket: 'events', estimatedVolume: 4400 },
  { keyword: 'austin food festival', bucket: 'events', estimatedVolume: 2400 },
  { keyword: 'austin halloween', bucket: 'events', estimatedVolume: 2900 },
  { keyword: 'austin christmas', bucket: 'events', estimatedVolume: 3600 },
  { keyword: 'austin fourth of july', bucket: 'events', estimatedVolume: 2400 },
  { keyword: 'austin game room', bucket: 'events', estimatedVolume: 1600 },
  { keyword: 'austin karaoke', bucket: 'events', estimatedVolume: 1900 },
  { keyword: 'austin bowling', bucket: 'events', estimatedVolume: 1600 },
  { keyword: 'austin spa', bucket: 'events', estimatedVolume: 2900 },
  // Neighborhoods
  { keyword: 'austin neighborhoods', bucket: 'neighborhoods', estimatedVolume: 5400 },
  { keyword: 'austin east side', bucket: 'neighborhoods', estimatedVolume: 3600 },
  { keyword: 'austin zilker', bucket: 'neighborhoods', estimatedVolume: 4400 },
  { keyword: 'austin downtown', bucket: 'neighborhoods', estimatedVolume: 6600 },
  { keyword: 'austin mueller', bucket: 'neighborhoods', estimatedVolume: 2400 },
  { keyword: 'austin south lamar', bucket: 'neighborhoods', estimatedVolume: 2400 },
  { keyword: 'austin north loop', bucket: 'neighborhoods', estimatedVolume: 1600 },
  { keyword: 'austin west lake', bucket: 'neighborhoods', estimatedVolume: 2900 },
  { keyword: 'austin cedar park', bucket: 'neighborhoods', estimatedVolume: 4400 },
  { keyword: 'austin round rock', bucket: 'neighborhoods', estimatedVolume: 3600 },
  { keyword: 'austin pflugerville', bucket: 'neighborhoods', estimatedVolume: 2400 },
  { keyword: 'austin parking', bucket: 'neighborhoods', estimatedVolume: 3600 },
  { keyword: 'austin uber', bucket: 'neighborhoods', estimatedVolume: 2400 },
  { keyword: 'austin scooters', bucket: 'neighborhoods', estimatedVolume: 1900 },
  // Housing
  { keyword: 'austin rent', bucket: 'housing', estimatedVolume: 12100 },
  { keyword: 'austin apartments', bucket: 'housing', estimatedVolume: 22200 },
  { keyword: 'austin cost of living', bucket: 'housing', estimatedVolume: 6600 },
  { keyword: 'austin homes for sale', bucket: 'housing', estimatedVolume: 9900 },
  { keyword: 'austin housing market', bucket: 'housing', estimatedVolume: 5400 },
  { keyword: 'austin condos', bucket: 'housing', estimatedVolume: 3600 },
  { keyword: 'moving to austin', bucket: 'housing', estimatedVolume: 8100 },
  // Weather
  { keyword: 'austin allergies', bucket: 'weather', estimatedVolume: 8100 },
  { keyword: 'austin cedar pollen', bucket: 'weather', estimatedVolume: 5400 },
  { keyword: 'austin weather', bucket: 'weather', estimatedVolume: 74000 },
  { keyword: 'austin oak pollen', bucket: 'weather', estimatedVolume: 2400 },
  { keyword: 'austin water temperature', bucket: 'weather', estimatedVolume: 1600 },
  { keyword: 'austin pollen count', bucket: 'weather', estimatedVolume: 3600 },
  { keyword: 'austin heat wave', bucket: 'weather', estimatedVolume: 1900 },
  { keyword: 'austin rainy season', bucket: 'weather', estimatedVolume: 1300 },
  // Family & Kids
  { keyword: 'austin kids activities', bucket: 'events', estimatedVolume: 4400 },
  { keyword: 'austin family fun', bucket: 'events', estimatedVolume: 2400 },
  { keyword: 'austin playgrounds', bucket: 'outdoors', estimatedVolume: 1900 },
  // Sports
  { keyword: 'austin fc', bucket: 'events', estimatedVolume: 9900 },
  { keyword: 'austin rock climbing', bucket: 'outdoors', estimatedVolume: 1900 },
  { keyword: 'austin yoga', bucket: 'events', estimatedVolume: 1600 },
  { keyword: 'austin gym', bucket: 'events', estimatedVolume: 2400 },
]

export const SCORING_MODEL_VERSION = 'v4-2026-02-13'
