/**
 * GET /api/live/water-temps
 * Returns current water temperature data (mock stub).
 */
export default defineEventHandler(() => {
  const now = new Date()
  const updatedAt = new Date(now.getTime() - 7 * 60 * 1000).toISOString()

  return {
    _mock: true, // TODO: replace with real water temp data source
    primary: {
      location: 'Lake Travis',
      tempF: 78,
      depth: 'Surface',
    },
    secondary: [
      { location: 'Barton Springs', tempF: 70, depth: 'Surface' },
    ],
    lightingTrails: true,
    updatedAt,
  }
})
