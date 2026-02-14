#!/usr/bin/env node
/**
 * merge-npa-geojson.mjs
 *
 * Fetches official City of Austin Neighborhood Planning Area (NPA)
 * polygons from their ArcGIS MapServer and merges them with the
 * existing blackmad-neighborhoods GeoJSON.
 *
 * Strategy:
 *   - OVERLAP (28):  Replace blackmad polygon with city NPA polygon
 *   - NPA-ONLY (37): Add new features from city data
 *   - EXISTING-ONLY (56): Keep blackmad polygon unchanged
 *
 * Multi-record NPAs (e.g., Highland = 5 records) are combined
 * into a single MultiPolygon feature.
 *
 * Usage:  node scripts/merge-npa-geojson.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ── 1. Fetch NPA data from City of Austin ArcGIS ────────────────

const NPA_URL = new URL(
  'https://maps.austintexas.gov/arcgis/rest/services/PropertyProfile/LongRangePlanning/MapServer/6/query'
)
NPA_URL.searchParams.set('where', '1=1')
NPA_URL.searchParams.set('outFields', '*')
NPA_URL.searchParams.set('outSR', '4326')
NPA_URL.searchParams.set('f', 'geojson')

console.log('⏳ Fetching NPA data from City of Austin ArcGIS…')
const npaRes = await fetch(NPA_URL.toString())
if (!npaRes.ok) throw new Error(`NPA fetch failed: ${npaRes.status}`)
const npaData = await npaRes.json()
console.log(`   ✓ Received ${npaData.features.length} NPA records`)

// ── 2. Load existing GeoJSON ────────────────────────────────────

const EXISTING_PATH = resolve(ROOT, 'server/assets/data/austin-neighborhoods.geojson')
const existing = JSON.parse(readFileSync(EXISTING_PATH, 'utf-8'))
console.log(`   ✓ Loaded ${existing.features.length} existing features`)

// ── 3. Name normalisation & mapping ─────────────────────────────

function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accent marks
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function titleCase(str) {
  // Special words that stay lowercase
  const lowerWords = new Set(['of', 'the', 'and', 'in', 'at', 'for', 'to', 'a'])
  return str
    .toLowerCase()
    .split(/[\s-]+/)
    .map((w, i) => {
      if (i > 0 && lowerWords.has(w)) return w
      return w.charAt(0).toUpperCase() + w.slice(1)
    })
    .join(' ')
}

/**
 * Manual name mapping: NPA_NAME → our display name
 * Only needed where the names don't trivially match.
 */
const NPA_TO_DISPLAY_NAME = {
  'EAST CESAR CHAVEZ': 'East César Chávez',
  'ST. EDWARDS': 'St. Edwards',
  'ST. JOHN': 'St. John',
  'MLK': 'MLK',
  'MLK-183': 'MLK-183',
  'RMMA': 'RMMA',
  'UT': 'UT',
  'NORTH AUSTIN CIVIC ASSOCIATION': 'North Austin Civic Association',
  'WEST AUSTIN NEIGHBORHOOD GROUP': 'West Austin Neighborhood Group',
  'PECAN SPRINGS-SPRINGDALE': 'Pecan Springs-Springdale',
}

function npaToDisplayName(npaName) {
  if (NPA_TO_DISPLAY_NAME[npaName]) return NPA_TO_DISPLAY_NAME[npaName]
  return titleCase(npaName)
}

/**
 * Region assignment for NPA neighborhoods.
 * For overlapping names, we keep the existing region from the seed.
 * For NPA-only names, we assign based on geography / COMBINED_NPA.
 */
const NPA_REGION_OVERRIDES = {
  // New NPA-only neighborhoods
  'CENTRAL EAST AUSTIN': 'East',
  'CORONADO HILLS': 'North-Central',
  'EAST CONGRESS': 'South-Central',
  'EAST OAK HILL': 'South',
  'FRANKLIN PARK': 'South',
  'GARRISON PARK': 'South',
  'GATEWAY': 'North Austin',
  'GEORGIAN ACRES': 'North Austin',
  'HERITAGE HILLS': 'Central',
  'MCKINNEY': 'South',
  'MLK-183': 'East',
  'MONTOPOLIS': 'East',
  'NORTH AUSTIN CIVIC ASSOCIATION': 'North Austin',
  'NORTH BURNET': 'North Austin',
  'NORTH LAMAR': 'North Austin',
  'NORTH SHOAL CREEK': 'North-Central',
  'OLD ENFIELD': 'Central',
  'PARKER LANE': 'South-Central',
  'PECAN SPRINGS-SPRINGDALE': 'East',
  'PLEASANT VALLEY': 'East',
  'RIVERSIDE': 'South-Central',
  'RMMA': 'Central',
  'SOUTH MANCHACA': 'South',
  'SOUTH RIVER CITY': 'South-Central',
  'SOUTHEAST': 'South',
  'ST. JOHN': 'North-Central',
  'SWEETBRIAR': 'South-Central',
  'TRIANGLE STATE': 'North-Central',
  'UPPER BOGGY CREEK': 'East',
  'UT': 'Central',
  'WEST AUSTIN NEIGHBORHOOD GROUP': 'Central',
  'WEST CONGRESS': 'South-Central',
  'EAST CESAR CHAVEZ': 'East',
  'WEST OAK HILL': 'South',
  'WEST UNIVERSITY': 'Central',
  'WINDSOR HILLS': 'Central',
  'WINDSOR ROAD': 'Central',
}

// ── 4. Group NPA records by name & merge polygons ───────────────

/** Group NPA features by PLANNING_AREA_NAME */
const npaByName = new Map()
for (const feat of npaData.features) {
  const name = feat.properties.PLANNING_AREA_NAME
  if (!npaByName.has(name)) {
    npaByName.set(name, [])
  }
  npaByName.get(name).push(feat)
}

console.log(`   ✓ ${npaByName.size} unique NPA neighborhood names`)

/**
 * Merge multiple NPA records into a single MultiPolygon geometry.
 * ArcGIS returns Polygon geometries — we collect all coordinate rings.
 */
function mergeNpaGeometries(features) {
  const allPolygonCoords = []

  for (const feat of features) {
    const geom = feat.geometry
    if (geom.type === 'Polygon') {
      allPolygonCoords.push(geom.coordinates)
    } else if (geom.type === 'MultiPolygon') {
      for (const poly of geom.coordinates) {
        allPolygonCoords.push(poly)
      }
    }
  }

  if (allPolygonCoords.length === 1) {
    return { type: 'Polygon', coordinates: allPolygonCoords[0] }
  }
  return { type: 'MultiPolygon', coordinates: allPolygonCoords }
}

/**
 * Compute centroid of a polygon/multipolygon geometry (simple average).
 */
function computeCentroid(geometry) {
  let sumLat = 0, sumLng = 0, count = 0

  function addCoords(ring) {
    for (const [lng, lat] of ring) {
      sumLng += lng
      sumLat += lat
      count++
    }
  }

  if (geometry.type === 'Polygon') {
    addCoords(geometry.coordinates[0]) // outer ring only
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates) {
      addCoords(polygon[0]) // outer ring of each
    }
  }

  if (count === 0) return { lat: null, lng: null }
  return {
    lat: Math.round((sumLat / count) * 1e6) / 1e6,
    lng: Math.round((sumLng / count) * 1e6) / 1e6,
  }
}

// Build merged NPA features keyed by slug
const mergedNpa = new Map()
for (const [npaName, features] of npaByName.entries()) {
  const displayName = npaToDisplayName(npaName)
  const slug = slugify(displayName)
  const geometry = mergeNpaGeometries(features)
  const centroid = computeCentroid(geometry)

  mergedNpa.set(slug, {
    npaName,
    displayName,
    slug,
    geometry,
    centroid,
    combinedNpa: features[0].properties.COMBINED_NPA,
    recordCount: features.length,
  })
}

// ── 5. Build existing features lookup ───────────────────────────

const existingBySlug = new Map()
for (const feat of existing.features) {
  existingBySlug.set(feat.properties.slug, feat)
}

// Special case: match East César Chávez → east-cesar-chavez
// The NPA uses "EAST CESAR CHAVEZ" which slugifies to "east-cesar-chavez"
// Our existing uses "East César Chávez" which also slugifies to "east-cesar-chavez"
// So slug-based matching should work naturally.

// ── 6. Three-way merge ─────────────────────────────────────────

const outputFeatures = []
let replaced = 0, added = 0, kept = 0

// Process each existing feature
for (const [slug, existingFeat] of existingBySlug.entries()) {
  const npa = mergedNpa.get(slug)

  if (npa) {
    // OVERLAP — replace geometry with city NPA data, keep our metadata
    outputFeatures.push({
      type: 'Feature',
      geometry: npa.geometry,
      properties: {
        ...existingFeat.properties,
        centerLat: npa.centroid.lat ?? existingFeat.properties.centerLat,
        centerLng: npa.centroid.lng ?? existingFeat.properties.centerLng,
        source: 'city-of-austin-npa',
      },
    })
    mergedNpa.delete(slug) // mark as consumed
    replaced++
  } else {
    // EXISTING-ONLY — keep unchanged
    outputFeatures.push(existingFeat)
    kept++
  }
}

// Process remaining NPA-only features (not in existing)
for (const [slug, npa] of mergedNpa.entries()) {
  const region = NPA_REGION_OVERRIDES[npa.npaName] || 'Unknown'

  outputFeatures.push({
    type: 'Feature',
    geometry: npa.geometry,
    properties: {
      name: npa.displayName,
      slug,
      region,
      city: 'Austin',
      centerLat: npa.centroid.lat,
      centerLng: npa.centroid.lng,
      source: 'city-of-austin-npa',
    },
  })
  added++
}

// Sort features by name for readability
outputFeatures.sort((a, b) => a.properties.name.localeCompare(b.properties.name))

const output = {
  type: 'FeatureCollection',
  features: outputFeatures,
}

// ── 7. Write output ─────────────────────────────────────────────

const outputJson = JSON.stringify(output)

// Write to both locations
const serverPath = resolve(ROOT, 'server/assets/data/austin-neighborhoods.geojson')
const publicPath = resolve(ROOT, 'public/data/austin-neighborhoods.geojson')

writeFileSync(serverPath, outputJson, 'utf-8')
writeFileSync(publicPath, outputJson, 'utf-8')

console.log('\n── Results ──────────────────────────────────────')
console.log(`   Replaced (blackmad → city NPA): ${replaced}`)
console.log(`   Added (NPA-only):               ${added}`)
console.log(`   Kept (existing-only):           ${kept}`)
console.log(`   Total features:                 ${outputFeatures.length}`)
console.log(`   Output size:                    ${(outputJson.length / 1024).toFixed(0)} KB`)
console.log(`\n   ✓ Written to ${serverPath}`)
console.log(`   ✓ Written to ${publicPath}`)

// ── 8. Print new neighborhoods for seed file reference ──────────

console.log('\n── New NPA neighborhoods (add to neighborhoodSeed.ts) ──')
const newEntries = outputFeatures
  .filter(f => f.properties.source === 'city-of-austin-npa' && !existingBySlug.has(f.properties.slug))
  .sort((a, b) => {
    const regionCmp = (a.properties.region || '').localeCompare(b.properties.region || '')
    if (regionCmp !== 0) return regionCmp
    return a.properties.name.localeCompare(b.properties.name)
  })

for (const feat of newEntries) {
  const p = feat.properties
  console.log(`  { name: '${p.name}', region: '${p.region}', city: '${p.city}' },`)
}
