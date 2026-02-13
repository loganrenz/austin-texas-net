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

// ─── Type helpers ───────────────────────────────────────────
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type PollenReading = typeof pollenReadings.$inferSelect
export type NewPollenReading = typeof pollenReadings.$inferInsert
export type Keyword = typeof keywords.$inferSelect
export type NewKeyword = typeof keywords.$inferInsert
