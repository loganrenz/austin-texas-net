/**
 * neighborhoodSeed — Curated list of Austin-area neighborhoods
 * covering Leander (north) to Buda (south).
 *
 * Each entry has a name, region grouping, and parent city.
 * The ingest pipeline geocodes each via Apple Maps to get lat/lng.
 */

export interface NeighborhoodSeedEntry {
  name: string
  region: string
  city: string
}

export const NEIGHBORHOOD_SEED: NeighborhoodSeedEntry[] = [
  // ── Far North (Leander / Cedar Park / Georgetown) ──────────
  { name: 'Leander', region: 'Far North', city: 'Leander' },
  { name: 'Crystal Falls', region: 'Far North', city: 'Leander' },
  { name: 'Cedar Park', region: 'Far North', city: 'Cedar Park' },
  { name: 'Brushy Creek', region: 'Far North', city: 'Cedar Park' },
  { name: 'Avery Ranch', region: 'Far North', city: 'Austin' },
  { name: 'Georgetown', region: 'Far North', city: 'Georgetown' },

  // ── North (Round Rock / Pflugerville / Hutto) ──────────────
  { name: 'Round Rock', region: 'North', city: 'Round Rock' },
  { name: 'Pflugerville', region: 'North', city: 'Pflugerville' },
  { name: 'Hutto', region: 'North', city: 'Hutto' },
  { name: 'Wells Branch', region: 'North', city: 'Austin' },
  { name: 'Jollyville', region: 'North', city: 'Austin' },
  { name: 'Anderson Mill', region: 'North', city: 'Austin' },
  { name: 'McNeil', region: 'North', city: 'Austin' },

  // ── North Austin ───────────────────────────────────────────
  { name: 'The Domain', region: 'North Austin', city: 'Austin' },
  { name: 'Arboretum', region: 'North Austin', city: 'Austin' },
  { name: 'Great Hills', region: 'North Austin', city: 'Austin' },
  { name: 'Balcones Woods', region: 'North Austin', city: 'Austin' },
  { name: 'Milwood', region: 'North Austin', city: 'Austin' },
  { name: 'Gracywoods', region: 'North Austin', city: 'Austin' },
  { name: 'Walnut Creek', region: 'North Austin', city: 'Austin' },
  { name: 'Wooten', region: 'North Austin', city: 'Austin' },
  { name: 'Copperfield', region: 'North Austin', city: 'Austin' },
  { name: 'Gateway', region: 'North Austin', city: 'Austin' },
  { name: 'Georgian Acres', region: 'North Austin', city: 'Austin' },
  { name: 'North Austin Civic Association', region: 'North Austin', city: 'Austin' },
  { name: 'North Burnet', region: 'North Austin', city: 'Austin' },
  { name: 'North Lamar', region: 'North Austin', city: 'Austin' },

  // ── North-Central ──────────────────────────────────────────
  { name: 'Allandale', region: 'North-Central', city: 'Austin' },
  { name: 'Brentwood', region: 'North-Central', city: 'Austin' },
  { name: 'Crestview', region: 'North-Central', city: 'Austin' },
  { name: 'North Loop', region: 'North-Central', city: 'Austin' },
  { name: 'Rosedale', region: 'North-Central', city: 'Austin' },
  { name: 'Highland', region: 'North-Central', city: 'Austin' },
  { name: 'Mueller', region: 'North-Central', city: 'Austin' },
  { name: 'Windsor Park', region: 'North-Central', city: 'Austin' },
  { name: 'University Hills', region: 'North-Central', city: 'Austin' },
  { name: 'Coronado Hills', region: 'North-Central', city: 'Austin' },
  { name: 'North Shoal Creek', region: 'North-Central', city: 'Austin' },
  { name: 'St. John', region: 'North-Central', city: 'Austin' },
  { name: 'Triangle State', region: 'North-Central', city: 'Austin' },

  // ── Central ────────────────────────────────────────────────
  { name: 'Downtown', region: 'Central', city: 'Austin' },
  { name: 'Hyde Park', region: 'Central', city: 'Austin' },
  { name: 'Hancock', region: 'Central', city: 'Austin' },
  { name: 'West Campus', region: 'Central', city: 'Austin' },
  { name: 'North University', region: 'Central', city: 'Austin' },
  { name: 'Clarksville', region: 'Central', city: 'Austin' },
  { name: 'Old West Austin', region: 'Central', city: 'Austin' },
  { name: 'Tarrytown', region: 'Central', city: 'Austin' },
  { name: 'Pemberton Heights', region: 'Central', city: 'Austin' },
  { name: 'Heritage', region: 'Central', city: 'Austin' },
  { name: 'Rainey Street', region: 'Central', city: 'Austin' },
  { name: 'Heritage Hills', region: 'Central', city: 'Austin' },
  { name: 'Old Enfield', region: 'Central', city: 'Austin' },
  { name: 'RMMA', region: 'Central', city: 'Austin' },
  { name: 'UT', region: 'Central', city: 'Austin' },
  { name: 'West Austin Neighborhood Group', region: 'Central', city: 'Austin' },
  { name: 'West University', region: 'Central', city: 'Austin' },
  { name: 'Windsor Hills', region: 'Central', city: 'Austin' },
  { name: 'Windsor Road', region: 'Central', city: 'Austin' },

  // ── East ───────────────────────────────────────────────────
  { name: 'East Austin', region: 'East', city: 'Austin' },
  { name: 'East César Chávez', region: 'East', city: 'Austin' },
  { name: 'Holly', region: 'East', city: 'Austin' },
  { name: 'Govalle', region: 'East', city: 'Austin' },
  { name: 'Johnston Terrace', region: 'East', city: 'Austin' },
  { name: 'Rosewood', region: 'East', city: 'Austin' },
  { name: 'MLK', region: 'East', city: 'Austin' },
  { name: 'Chestnut', region: 'East', city: 'Austin' },
  { name: 'Manor', region: 'East', city: 'Manor' },
  { name: 'Del Valle', region: 'East', city: 'Austin' },
  { name: 'Central East Austin', region: 'East', city: 'Austin' },
  { name: 'MLK-183', region: 'East', city: 'Austin' },
  { name: 'Montopolis', region: 'East', city: 'Austin' },
  { name: 'Pecan Springs-Springdale', region: 'East', city: 'Austin' },
  { name: 'Pleasant Valley', region: 'East', city: 'Austin' },
  { name: 'Upper Boggy Creek', region: 'East', city: 'Austin' },

  // ── South-Central ──────────────────────────────────────────
  { name: 'South Congress', region: 'South-Central', city: 'Austin' },
  { name: 'Bouldin Creek', region: 'South-Central', city: 'Austin' },
  { name: 'Travis Heights', region: 'South-Central', city: 'Austin' },
  { name: 'Zilker', region: 'South-Central', city: 'Austin' },
  { name: 'Barton Hills', region: 'South-Central', city: 'Austin' },
  { name: 'Galindo', region: 'South-Central', city: 'Austin' },
  { name: 'South Lamar', region: 'South-Central', city: 'Austin' },
  { name: 'South First', region: 'South-Central', city: 'Austin' },
  { name: 'Dawson', region: 'South-Central', city: 'Austin' },
  { name: 'St. Edwards', region: 'South-Central', city: 'Austin' },
  { name: 'East Congress', region: 'South-Central', city: 'Austin' },
  { name: 'Parker Lane', region: 'South-Central', city: 'Austin' },
  { name: 'Riverside', region: 'South-Central', city: 'Austin' },
  { name: 'South River City', region: 'South-Central', city: 'Austin' },
  { name: 'Sweetbriar', region: 'South-Central', city: 'Austin' },
  { name: 'West Congress', region: 'South-Central', city: 'Austin' },

  // ── South Austin ───────────────────────────────────────────
  { name: 'Westgate', region: 'South', city: 'Austin' },
  { name: 'Cherry Creek', region: 'South', city: 'Austin' },
  { name: 'Onion Creek', region: 'South', city: 'Austin' },
  { name: 'Slaughter Creek', region: 'South', city: 'Austin' },
  { name: 'Circle C Ranch', region: 'South', city: 'Austin' },
  { name: 'Shady Hollow', region: 'South', city: 'Austin' },
  { name: 'Manchaca', region: 'South', city: 'Austin' },
  { name: 'Southpark Meadows', region: 'South', city: 'Austin' },
  { name: 'McKinney Falls', region: 'South', city: 'Austin' },
  { name: 'East Oak Hill', region: 'South', city: 'Austin' },
  { name: 'Franklin Park', region: 'South', city: 'Austin' },
  { name: 'Garrison Park', region: 'South', city: 'Austin' },
  { name: 'Mckinney', region: 'South', city: 'Austin' },
  { name: 'South Manchaca', region: 'South', city: 'Austin' },
  { name: 'Southeast', region: 'South', city: 'Austin' },
  { name: 'West Oak Hill', region: 'South', city: 'Austin' },

  // ── Far South (Buda / Kyle) ────────────────────────────────
  { name: 'Buda', region: 'Far South', city: 'Buda' },
  { name: 'Kyle', region: 'Far South', city: 'Kyle' },
  { name: 'Dripping Springs', region: 'Far South', city: 'Dripping Springs' },

  // ── West / Hill Country ────────────────────────────────────
  { name: 'Westlake Hills', region: 'West', city: 'West Lake Hills' },
  { name: 'Rollingwood', region: 'West', city: 'Rollingwood' },
  { name: 'Bee Cave', region: 'West', city: 'Bee Cave' },
  { name: 'Lakeway', region: 'West', city: 'Lakeway' },
  { name: 'Steiner Ranch', region: 'West', city: 'Austin' },
  { name: 'River Place', region: 'West', city: 'Austin' },
  { name: 'Lost Creek', region: 'West', city: 'Austin' },
  { name: 'Barton Creek', region: 'West', city: 'Austin' },
  { name: 'Rob Roy', region: 'West', city: 'Austin' },
  { name: 'Spicewood Springs', region: 'West', city: 'Austin' },
]
