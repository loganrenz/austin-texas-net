/**
 * GET /api/live/events
 * Returns weekend events summary (mock stub).
 */
export default defineEventHandler(() => {
  const now = new Date()
  const updatedAt = new Date(now.getTime() - 6 * 60 * 1000).toISOString()

  return {
    count: 73,
    events: [
      { name: "Eveor's Birthday Party", date: 'Saturday 7pm', venue: 'Zilker Park' },
      { name: 'Jugglefest', date: 'Sunday 2pm', venue: 'Republic Square' },
      { name: 'Live Music Marathon', date: 'Friday 6pm', venue: '6th Street' },
    ],
    updatedAt,
  }
})
