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
      <section class="text-center pt-8 pb-6">
        <div
          class="size-16 rounded-[18px] inline-flex items-center justify-center bg-current mb-4 [&>*]:text-white"
          :class="category.color"
        >
          <UIcon :name="category.icon" class="size-8" />
        </div>
        <h1 class="text-[clamp(1.5rem,4vw,2rem)] font-extrabold tracking-tight mb-2">
          {{ category.title }} in Austin
        </h1>
        <p class="text-[0.95rem] text-muted max-w-[480px] mx-auto leading-relaxed">
          {{ category.tagline }}
        </p>
      </section>

      <!-- Live Now module slot (item 4) -->
      <slot name="live-now" />

      <!-- Overview (SEO content) — app-controlled prop, not user input -->
      <section
        class="bg-elevated border border-default rounded-2xl py-7 px-6 max-sm:py-5 max-sm:px-4 mb-6"
      >
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="prose-content text-[0.88rem] leading-[1.8] text-muted" v-html="overview" />
      </section>

      <!-- Sub-app cards (item 5: standardized layout) -->
      <section class="mb-6">
        <h2 class="text-xs font-bold uppercase tracking-wider text-muted mb-3.5">
          Explore {{ category.title }}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
          <component
            :is="isDisabled(app) ? 'div' : isExternal(app) ? 'a' : 'NuxtLink'"
            v-for="app in category.subApps"
            :key="app.slug"
            :to="!isDisabled(app) && !isExternal(app) ? getAppHref(app) : undefined"
            :href="isExternal(app) ? app.standaloneUrl : undefined"
            :target="isExternal(app) ? '_blank' : undefined"
            :rel="isExternal(app) ? 'noopener' : undefined"
            class="bg-elevated border border-default rounded-[14px] p-5 no-underline text-inherit transition-all duration-200 hover:border-(--color-border-hover) hover:-translate-y-px hover:shadow-md group"
            :class="{
              'opacity-60 cursor-default hover:translate-y-0 hover:shadow-none': isDisabled(app),
            }"
            @click="
              !isDisabled(app) &&
              trackAppClick(app.title, getAppHref(app) || app.standaloneUrl || '')
            "
          >
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-[0.95rem] font-bold">{{ app.title }}</h3>
              <span
                class="text-[0.6rem] font-semibold py-0.5 px-2 rounded-full uppercase tracking-[0.04em]"
                :class="
                  app.status === 'live' ? 'bg-success/12 text-success' : 'bg-muted text-muted'
                "
              >
                {{ getStatusLabel(app.status) }}
              </span>
            </div>
            <p class="text-[0.8rem] text-muted leading-normal mb-3">{{ app.description }}</p>
            <span
              v-if="app.status === 'live'"
              class="text-xs font-semibold text-primary inline-flex items-center"
            >
              Open
              <UIcon
                name="i-lucide-arrow-right"
                class="size-3 ml-1 group-hover:translate-x-0.5 transition-transform"
              />
            </span>
            <span
              v-else-if="app.standaloneUrl"
              class="text-xs font-semibold text-muted inline-flex items-center"
            >
              Visit app
              <UIcon name="i-lucide-external-link" class="size-3 ml-1" />
            </span>
          </component>
        </div>
      </section>

      <!-- FAQ -->
      <section v-if="faqItems && faqItems.length > 0" class="mb-6">
        <h2 class="text-xs font-bold uppercase tracking-wider text-muted mb-3.5">
          Frequently Asked Questions
        </h2>
        <div class="flex flex-col gap-2">
          <details
            v-for="(item, i) in faqItems"
            :key="i"
            class="faq-item bg-elevated border border-default rounded-xl overflow-hidden"
          >
            <summary class="faq-q py-4 px-5 text-[0.85rem] font-semibold cursor-pointer list-none">
              {{ item.question }}
            </summary>
            <p class="px-5 pb-4 text-[0.82rem] text-muted leading-relaxed">{{ item.answer }}</p>
          </details>
        </div>
      </section>

      <!-- Cross-links -->
      <section class="mb-2">
        <h2 class="text-xs font-bold uppercase tracking-wider text-muted mb-3.5">
          More from Austin
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
          <NuxtLink
            v-for="c in crossLinks"
            :key="c.slug"
            :to="`/${c.slug}/`"
            class="flex items-center gap-2.5 py-3.5 px-4 bg-elevated border border-default rounded-xl no-underline text-inherit transition-colors duration-200 hover:border-(--color-border-hover)"
          >
            <UIcon :name="c.icon" class="size-5" :class="c.color" />
            <span class="text-[0.8rem] font-semibold flex-1">{{ c.title }}</span>
            <UIcon name="i-lucide-arrow-right" class="size-3 text-dimmed" />
          </NuxtLink>
        </div>
      </section>
    </div>
  </UContainer>
</template>

<style>
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
.faq-q::marker,
.faq-q::-webkit-details-marker {
  display: none;
}
</style>
