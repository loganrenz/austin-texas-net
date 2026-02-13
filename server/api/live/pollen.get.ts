/**
 * GET /api/live/pollen
 * Returns current cedar pollen data (mock stub).
 */
export default defineEventHandler(() => {
  const now = new Date()
  const updatedAt = new Date(now.getTime() - 5 * 60 * 1000).toISOString()

  return {
    count: 439,
    level: 'High',
    type: 'Cedar',
    updatedAt,
    details: [
      { label: 'Green', severity: 'Low' },
      { label: 'Orange', severity: 'Med' },
      { label: 'Red', severity: 'Red' },
      { label: 'Dark', severity: 'Very High' },
    ],
  }
})
