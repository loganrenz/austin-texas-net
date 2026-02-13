<script setup lang="ts">
import type { NavigationMenuItem, FooterColumn } from '@nuxt/ui'

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const { loggedIn, isAdmin } = useAuth()

const siteName = runtimeConfig.public.appName || 'Austin Texas'
const siteUrl = (runtimeConfig.public.appUrl || 'https://austin-texas.net').replace(/\/$/, '')

useSeoMeta({
  titleTemplate: `%s — ${siteName}`,
  ogSiteName: siteName,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

const canonicalUrl = computed(() => `${siteUrl}${route.path}`)

useHead({
  htmlAttrs: { lang: 'en' },
  link: [
    { rel: 'canonical', href: canonicalUrl },
  ],
})

const { categories } = useSiteData()

/* ── Header nav items ─────────────────────────────────────── */
const navItems = computed<NavigationMenuItem[]>(() => [
  { label: 'Search', icon: 'i-lucide-search', to: '/search/' },
  { label: 'Categories', icon: 'i-lucide-layout-grid', to: '/food/' },
  { label: 'About', icon: 'i-lucide-info', to: '/about/' },
])

/* ── Footer columns ───────────────────────────────────────── */
const footerColumns = computed<FooterColumn[]>(() =>
  categories.value.map(cat => ({
    label: cat.title,
    children: cat.subApps.map(app => ({
      label: app.title,
      to: app.status === 'live'
        ? `/${cat.slug}/${app.slug}/`
        : app.standaloneUrl || undefined,
      target: app.status !== 'live' && app.standaloneUrl ? '_blank' : undefined,
      disabled: app.status !== 'live' && !app.standaloneUrl,
    })),
  })),
)

const footerLinks = computed<NavigationMenuItem[]>(() => {
  const items: NavigationMenuItem[] = [
    { label: 'About', to: '/about/' },
    { label: 'Contact', to: '/contact/' },
    { label: 'Privacy', to: '/privacy/' },
  ]
  if (loggedIn.value && isAdmin.value) {
    items.push({ label: 'Admin', to: '/admin/radar' })
  }
  return items
})
</script>

<template>
  <UApp>
    <!-- Header -->
    <UHeader title="Austin-Texas.net" to="/">
      <template #title>
        <span class="font-display text-lg font-bold tracking-tight italic">Austin-Texas.net</span>
      </template>

      <UNavigationMenu :items="navItems" />

      <template #body>
        <UNavigationMenu :items="navItems" orientation="vertical" class="-mx-2.5" />
      </template>
    </UHeader>

    <!-- Main — unconstrained so pages control their own layout -->
    <UMain>
      <NuxtPage />
    </UMain>

    <!-- Footer -->
    <UFooter>
      <template #top>
        <UContainer>
          <UFooterColumns :columns="footerColumns" />
        </UContainer>
      </template>

      <template #left>
        <span class="text-xs text-muted">&copy; {{ new Date().getFullYear() }} Austin-Texas.net</span>
      </template>

      <UNavigationMenu :items="footerLinks" variant="link" />

      <template #right>
        <UColorModeButton />
      </template>
    </UFooter>
  </UApp>
</template>
