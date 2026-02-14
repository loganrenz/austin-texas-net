/**
 * GET /api/neighborhoods/:slug
 *
 * Public endpoint returning a single neighborhood by slug.
 */
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { neighborhoodsTable } from '~~/server/database/schema'

const paramsSchema = z.object({
  slug: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const { slug } = paramsSchema.parse(getRouterParams(event))

  const db = useDatabase()

  const neighborhood = await db.select()
    .from(neighborhoodsTable)
    .where(eq(neighborhoodsTable.slug, slug))
    .get()

  if (!neighborhood) {
    throw createError({ statusCode: 404, statusMessage: 'Neighborhood not found' })
  }

  return { neighborhood }
})
