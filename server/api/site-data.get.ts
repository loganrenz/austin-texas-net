/**
 * GET /api/site-data
 *
 * Public endpoint to fetch site hierarchy (categories + topics).
 * Used by useSiteData() composable.
 */
import { siteCategoriesTable, contentPipelineTopics } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = useDatabase()

  // 1. Fetch Categories
  const categories = await db.select().from(siteCategoriesTable).all()

  // 2. Fetch all Topics
  const allTopics = await db
    .select()
    .from(contentPipelineTopics)
    .where(eq(contentPipelineTopics.enabled, true))
    .all()

  // 3. Assemble hierarchy
  return {
    categories: categories.map((cat) => ({
      slug: cat.slug,
      title: cat.title,
      tagline: cat.tagline,
      icon: cat.icon,
      color: cat.color,
      bgColor: cat.bgColor,
      seo: {
        title: cat.seoTitle,
        description: cat.seoDescription,
      },
      subApps: allTopics
        .filter((t) => t.categorySlug === cat.slug)
        .map((t) => ({
          slug: t.topicKey,
          title: t.topicLabel,
          description: t.description || '',
          status: t.status as 'live' | 'coming-soon',
          contentType: t.contentType,
          accentColor: t.accentColor || undefined,
          pinColor: t.pinColor || undefined,
          icon: t.icon || undefined,
          standaloneUrl: t.standaloneUrl || undefined,
        })),
    })),
  }
})
