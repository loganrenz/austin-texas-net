import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// ─── Users ──────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name'),
  passwordHash: text('password_hash'), // nullable for Apple-only users
  appleSub: text('apple_id').unique(),
  isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ─── Sessions ───────────────────────────────────────────────
// Server-side session tracking for revocation support
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ─── Pollen Readings ────────────────────────────────────────
export const pollenReadings = sqliteTable('pollen_readings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),           // YYYY-MM-DD
  count: real('count').notNull(),          // grains/m³
  severity: text('severity').notNull(),    // low | medium | high | very-high | extreme
  source: text('source').default('kxan'), // data source
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ─── Radar Keywords ─────────────────────────────────────────
export const keywords = sqliteTable('keywords', {
  id:             integer('id').primaryKey({ autoIncrement: true }),
  keyword:        text('keyword').notNull().unique(),
  bucket:         text('bucket').notNull(),
  monthlyVolume:  integer('monthly_volume').default(0),
  competition:    text('competition').default('LOW'),
  trendScore:     integer('trend_score').default(0),
  risingScore:    integer('rising_score').default(0),
  firstSeen:      text('first_seen').notNull().$defaultFn(() => new Date().toISOString()),
  lastSeen:       text('last_seen').notNull().$defaultFn(() => new Date().toISOString()),
  pageExists:     integer('page_exists', { mode: 'boolean' }).default(false),
  compositeScore: integer('composite_score').default(0),
  // Roadmap columns (v2)
  intent:                   text('intent').default('informational'),
  difficulty:               integer('difficulty').default(50),
  seasonality:              text('seasonality'),
  opportunityScore:         integer('opportunity_score').default(0),
  matchedApp:               text('matched_app'),
  matchedUrl:               text('matched_url'),
  suggestedTitle:           text('suggested_title'),
  suggestedInternalLinks:   text('suggested_internal_links'),
  // Strategic scoring (v3)
  subtypes:                 text('subtypes'),           // JSON array of KeywordSubtype[]
  strategicScore:           integer('strategic_score').default(0),
  // Difficulty validation (v4)
  difficultySource:         text('difficulty_source').default('estimated'),
  difficultyConfidence:     text('difficulty_confidence').default('medium'),
  difficultyAnomaly:        text('difficulty_anomaly'),
})

// ─── Map Spots (Apple Maps — generic content type) ──────────
export const mapSpotsTable = sqliteTable('map_spots', {
  id: text('id').primaryKey(),                          // Apple Maps place ID
  name: text('name').notNull(),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  address: text('address'),
  neighborhood: text('neighborhood'),
  category: text('category'),
  contentType: text('content_type').notNull().default('breakfast-tacos'),
  phone: text('phone'),
  url: text('url'),
  // Editorial overrides
  rank: integer('rank'),
  knownFor: text('known_for'),
  description: text('description'),
  priceRange: text('price_range').default('$'),
  rating: real('rating'),
  featured: integer('featured', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ─── Neighborhoods ──────────────────────────────────────────
export const neighborhoodsTable = sqliteTable('neighborhoods', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  city: text('city').default('Austin'),
  region: text('region'),
  zipCode: text('zip_code'),
  description: text('description'),
  population: integer('population'),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ─── Water Readings (USGS time-series) ──────────────────────
export const waterReadings = sqliteTable('water_readings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  siteId: text('site_id').notNull(),            // USGS site number, e.g. "08155500"
  siteName: text('site_name').notNull(),         // "Barton Springs"
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  parameterCode: text('parameter_code').notNull(), // "00010" = temp, "00065" = gage height
  value: real('value').notNull(),
  unit: text('unit').notNull(),                  // "deg C", "ft"
  timestamp: text('timestamp').notNull(),        // ISO 8601 from USGS
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ─── Lake Readings (TWDB reservoir levels) ──────────────────
export const lakeReadings = sqliteTable('lake_readings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  lakeKey: text('lake_key').notNull(),           // "Travis", "Austin", etc.
  lakeName: text('lake_name').notNull(),         // "Lake Travis"
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  elevation: real('elevation').notNull(),         // ft above sea level
  percentFull: real('percent_full'),
  conservationCapacity: real('conservation_capacity'),
  conservationStorage: real('conservation_storage'),
  timestamp: text('timestamp').notNull(),         // date from API (YYYY-MM-DD)
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ─── Type helpers ───────────────────────────────────────────
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type PollenReading = typeof pollenReadings.$inferSelect
export type NewPollenReading = typeof pollenReadings.$inferInsert
export type Keyword = typeof keywords.$inferSelect
export type NewKeyword = typeof keywords.$inferInsert
export type MapSpotRow = typeof mapSpotsTable.$inferSelect
export type NewMapSpotRow = typeof mapSpotsTable.$inferInsert
export type Neighborhood = typeof neighborhoodsTable.$inferSelect
export type NewNeighborhood = typeof neighborhoodsTable.$inferInsert
export type WaterReading = typeof waterReadings.$inferSelect
export type NewWaterReading = typeof waterReadings.$inferInsert
export type LakeReading = typeof lakeReadings.$inferSelect
export type NewLakeReading = typeof lakeReadings.$inferInsert
