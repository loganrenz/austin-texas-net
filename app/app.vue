<script setup lang="ts">
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
  link: [{ rel: 'canonical', href: canonicalUrl }],
})

const footerLinks = [
  { label: 'About', to: '/about/' },
  { label: 'Contact', to: '/contact/' },
  { label: 'Privacy', to: '/privacy/' },
]

const adminLinks = [{ label: 'Admin', to: '/admin/radar' }]
</script>

<template>
  <UApp>
    <!-- Main — unconstrained so pages control their own layout -->
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <!-- Footer -->
    <UFooter>
      <template #left>
        <span class="text-xs text-muted"
          >&copy; {{ new Date().getFullYear() }} Austin-Texas.net</span
        >
      </template>

      <div class="flex items-center gap-x-3">
        <UNavigationMenu :items="footerLinks" variant="link" />
        <ClientOnly>
          <UNavigationMenu v-if="loggedIn && isAdmin" :items="adminLinks" variant="link" />
        </ClientOnly>
      </div>

      <template #right>
        <UColorModeButton />
      </template>
    </UFooter>
  </UApp>
</template>
