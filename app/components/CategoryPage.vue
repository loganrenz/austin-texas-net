<script setup lang="ts">
/**
 * CategoryPage — reusable SEO authority hub for each category.
 * Renders title, long-form overview, sub-app cards, FAQ, and cross-links.
 */
import type { Category, SubApp } from '~/composables/useSiteData'

const props = defineProps<{
  category: Category
  overview: string
  faqItems?: Array<{ question: string; answer: string }>
}>()

const { categories } = useSiteData()
const crossLinks = computed(() =>
  categories.filter((c) => c.slug !== props.category.slug).slice(0, 4),
)

function getStatusLabel(status: SubApp['status']): string {
  return status === 'live' ? 'Live' : 'Coming Soon'
}

/**
 * Canonical link rule (item 3):
 * - "live" → internal path on this site
 * - "coming-soon" with standaloneUrl → standalone subdomain (external)
 * - "coming-soon" without standaloneUrl → no link (disabled card)
 */
function getAppHref(app: SubApp): string | undefined {
  if (app.status === 'live') return `/${props.category.slug}/${app.slug}/`
  return app.standaloneUrl || undefined
}

function isExternal(app: SubApp): boolean {
  return app.status !== 'live' && !!app.standaloneUrl
}

function isDisabled(app: SubApp): boolean {
  return app.status === 'coming-soon' && !app.standaloneUrl
}

// Click tracking
function trackAppClick(appTitle: string, destination: string) {
  const ph = import.meta.client
    ? (
        window as Window & {
          posthog?: { capture: (event: string, properties: Record<string, string>) => void }
        }
      ).posthog
    : undefined
  if (ph) {
    ph.capture('subapp_card_click', {
      category: props.category.slug,
      app: appTitle,
      destination,
    })
  }
}
</script>

<template>
  <UContainer>
    <div>
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-muted mb-6">
        <NuxtLink to="/" class="hover:text-primary transition-colors">Home</NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="size-3" />
        <span class="text-default font-medium">{{ category.title }}</span>
      </div>

      <!-- Hero -->
      <section class="cat-hero">
        <div class="cat-hero-icon" :class="category.color">
          <UIcon :name="category.icon" class="size-8" />
        </div>
        <h1 class="cat-hero-title">{{ category.title }} in Austin</h1>
        <p class="cat-hero-tagline">{{ category.tagline }}</p>
      </section>

      <!-- Live Now module slot (item 4) -->
      <slot name="live-now" />

      <!-- Overview (SEO content) -->
      <section class="content-block">
        <div class="prose-content" v-html="overview" />
      </section>

      <!-- Sub-app cards (item 5: standardized layout) -->
      <section class="subapps">
        <h2 class="section-label">Explore {{ category.title }}</h2>
        <div class="subapp-grid">
          <component
            :is="isDisabled(app) ? 'div' : isExternal(app) ? 'a' : 'NuxtLink'"
            v-for="app in category.subApps"
            :key="app.slug"
            :to="!isDisabled(app) && !isExternal(app) ? getAppHref(app) : undefined"
            :href="isExternal(app) ? app.standaloneUrl : undefined"
            :target="isExternal(app) ? '_blank' : undefined"
            :rel="isExternal(app) ? 'noopener' : undefined"
            class="subapp-card group"
            :class="{ 'subapp-card--disabled': isDisabled(app) }"
            @click="
              !isDisabled(app) &&
              trackAppClick(app.title, getAppHref(app) || app.standaloneUrl || '')
            "
          >
            <div class="subapp-top">
              <h3 class="subapp-title">{{ app.title }}</h3>
              <span
                class="subapp-badge"
                :class="app.status === 'live' ? 'badge-live' : 'badge-soon'"
              >
                {{ getStatusLabel(app.status) }}
              </span>
            </div>
            <p class="subapp-desc">{{ app.description }}</p>
            <span v-if="app.status === 'live'" class="subapp-cta">
              Open
              <UIcon
                name="i-lucide-arrow-right"
                class="size-3 ml-1 group-hover:translate-x-0.5 transition-transform"
              />
            </span>
            <span v-else-if="app.standaloneUrl" class="subapp-cta subapp-cta--external">
              Visit app
              <UIcon name="i-lucide-external-link" class="size-3 ml-1" />
            </span>
          </component>
        </div>
      </section>

      <!-- FAQ -->
      <section v-if="faqItems && faqItems.length > 0" class="faq">
        <h2 class="section-label">Frequently Asked Questions</h2>
        <div class="faq-list">
          <details v-for="(item, i) in faqItems" :key="i" class="faq-item">
            <summary class="faq-q">{{ item.question }}</summary>
            <p class="faq-a">{{ item.answer }}</p>
          </details>
        </div>
      </section>

      <!-- Cross-links -->
      <section class="crosslinks">
        <h2 class="section-label">More from Austin</h2>
        <div class="crosslink-grid">
          <NuxtLink
            v-for="c in crossLinks"
            :key="c.slug"
            :to="`/${c.slug}/`"
            class="crosslink-card"
          >
            <UIcon :name="c.icon" class="size-5" :class="c.color" />
            <span class="crosslink-title">{{ c.title }}</span>
            <UIcon name="i-lucide-arrow-right" class="size-3 text-dimmed" />
          </NuxtLink>
        </div>
      </section>
    </div>
  </UContainer>
</template>

<style scoped>
/* Hero */
.cat-hero {
  text-align: center;
  padding: 32px 0 24px;
}

.cat-hero-icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: currentColor;
  margin-bottom: 16px;
}

.cat-hero-icon > * {
  color: white;
}

.cat-hero-title {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.cat-hero-tagline {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  max-width: 480px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Content block */
.content-block {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 28px 24px;
  margin-bottom: 24px;
}

.prose-content {
  font-size: 0.88rem;
  line-height: 1.8;
  color: var(--color-text-secondary);
}

.prose-content :deep(h2) {
  font-size: 1.05rem;
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 10px;
  color: var(--color-text);
}

.prose-content :deep(h3) {
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 20px;
  margin-bottom: 8px;
  color: var(--color-text);
}

.prose-content :deep(p) {
  margin-bottom: 14px;
}

.prose-content :deep(strong) {
  color: var(--color-text);
}

.prose-content :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* Sub-apps */
.subapps {
  margin-bottom: 24px;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: 14px;
}

.subapp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.subapp-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 20px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.subapp-card:hover {
  border-color: var(--color-border-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.subapp-card--disabled {
  opacity: 0.6;
  cursor: default;
}

.subapp-card--disabled:hover {
  transform: none;
  box-shadow: none;
}

.subapp-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.subapp-title {
  font-size: 0.95rem;
  font-weight: 700;
}

.subapp-badge {
  font-size: 0.6rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.badge-live {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}

.badge-soon {
  background: var(--color-surface-hover);
  color: var(--color-text-muted);
}

.subapp-desc {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin-bottom: 12px;
}

.subapp-cta {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
}

.subapp-cta--external {
  color: var(--color-text-muted);
}

/* FAQ */
.faq {
  margin-bottom: 24px;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.faq-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.faq-q {
  padding: 16px 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  list-style: none;
}

.faq-q::marker,
.faq-q::-webkit-details-marker {
  display: none;
}

.faq-a {
  padding: 0 20px 16px;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  line-height: 1.7;
}

/* Cross-links */
.crosslinks {
  margin-bottom: 8px;
}

.crosslink-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
}

.crosslink-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s ease;
}

.crosslink-card:hover {
  border-color: var(--color-border-hover);
}

.crosslink-title {
  font-size: 0.8rem;
  font-weight: 600;
  flex: 1;
}

@media (max-width: 640px) {
  .subapp-grid {
    grid-template-columns: 1fr;
  }
  .crosslink-grid {
    grid-template-columns: 1fr 1fr;
  }
  .content-block {
    padding: 20px 16px;
  }
}
</style>
