<script setup lang="ts">
const route = useRoute()
const colorMode = useColorMode()
const runtimeConfig = useRuntimeConfig()
const { loggedIn, isAdmin } = useAuth()

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (val: boolean) => { colorMode.preference = val ? 'dark' : 'light' }
})

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

const mobileMenuOpen = ref(false)

watch(route, () => {
  mobileMenuOpen.value = false
})
</script>

<template>
  <UApp>
    <div class="min-h-screen flex flex-col">
      <!-- Header -->
      <header class="sticky top-0 z-50 bg-default/85 backdrop-blur-xl border-b border-default">
        <div class="max-w-[1200px] mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2.5 no-underline text-inherit">
            <div class="size-9 rounded-xl bg-primary/12 flex items-center justify-center text-primary">
              <UIcon name="i-lucide-map-pin" class="size-5" />
            </div>
            <div class="flex flex-col leading-tight">
              <span class="font-display font-bold text-base tracking-tight">Austin Texas</span>
              <span class="text-[10px] text-dimmed tracking-wider uppercase hidden sm:block">.net</span>
            </div>
          </NuxtLink>

          <!-- Desktop nav — category links -->
          <nav class="hidden lg:flex gap-0.5">
            <NuxtLink
              v-for="cat in categories"
              :key="cat.slug"
              :to="`/${cat.slug}/`"
              class="px-3 py-1.5 text-xs font-medium text-muted rounded-lg transition-colors duration-200 hover:text-default hover:bg-elevated flex items-center gap-1.5"
              :class="{ 'text-primary bg-primary/8': route.path.startsWith(`/${cat.slug}`) }"
            >
              <UIcon :name="cat.icon" class="size-3.5" />
              {{ cat.title }}
            </NuxtLink>
          </nav>

          <div class="flex items-center gap-3">
            <ClientOnly>
              <USwitch
                v-model="isDark"
                size="sm"
                unchecked-icon="i-lucide-sun"
                checked-icon="i-lucide-moon"
              />
              <template #fallback>
                <span class="inline-block w-10 h-5" />
              </template>
            </ClientOnly>

            <!-- Mobile hamburger -->
            <UButton
              class="lg:hidden"
              variant="ghost"
              color="neutral"
              size="sm"
              :icon="mobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'"
              aria-label="Toggle menu"
              @click="mobileMenuOpen = !mobileMenuOpen"
            />
          </div>
        </div>

        <!-- Mobile nav -->
        <Transition name="slide-down">
          <nav v-if="mobileMenuOpen" class="lg:hidden flex flex-col gap-0.5 px-4 sm:px-6 pb-4">
            <NuxtLink
              to="/"
              class="px-3.5 py-2.5 text-sm font-medium text-muted no-underline rounded-lg transition-colors hover:text-primary hover:bg-primary/6 flex items-center gap-2.5"
              :class="{ 'text-primary bg-primary/6': route.path === '/' }"
            >
              <UIcon name="i-lucide-home" class="size-4" />
              Home
            </NuxtLink>
            <NuxtLink
              v-for="cat in categories"
              :key="cat.slug"
              :to="`/${cat.slug}/`"
              class="px-3.5 py-2.5 text-sm font-medium text-muted no-underline rounded-lg transition-colors hover:text-primary hover:bg-primary/6 flex items-center gap-2.5"
              :class="{ 'text-primary bg-primary/6': route.path.startsWith(`/${cat.slug}`) }"
            >
              <UIcon :name="cat.icon" class="size-4" />
              {{ cat.title }}
            </NuxtLink>
          </nav>
        </Transition>
      </header>

      <!-- Main -->
      <main class="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <NuxtPage />
      </main>

      <!-- Footer -->
      <footer class="border-t border-default px-4 sm:px-6 py-10">
        <div class="max-w-[1200px] mx-auto">
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6 mb-8">
            <div v-for="cat in categories" :key="cat.slug">
              <NuxtLink
                :to="`/${cat.slug}/`"
                class="text-xs font-semibold text-default uppercase tracking-wider hover:text-primary transition-colors mb-2 block"
              >
                {{ cat.title }}
              </NuxtLink>
              <ul class="space-y-1">
                <li v-for="app in cat.subApps" :key="app.slug">
                  <component
                    :is="app.status === 'live' ? 'NuxtLink' : (app.standaloneUrl ? 'a' : 'span')"
                    :to="app.status === 'live' ? `/${cat.slug}/${app.slug}/` : undefined"
                    :href="app.status !== 'live' && app.standaloneUrl ? app.standaloneUrl : undefined"
                    :target="app.status !== 'live' && app.standaloneUrl ? '_blank' : undefined"
                    :rel="app.status !== 'live' && app.standaloneUrl ? 'noopener' : undefined"
                    class="text-[11px] transition-colors"
                    :class="app.standaloneUrl || app.status === 'live' ? 'text-muted hover:text-primary cursor-pointer' : 'text-dimmed'"
                  >
                    {{ app.title }}
                  </component>
                </li>
              </ul>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-default">
            <span class="text-xs text-dimmed">&copy; {{ new Date().getFullYear() }} Austin-Texas.net</span>
            <div class="flex items-center gap-4 text-xs text-dimmed">
              <span class="hover:text-primary transition-colors cursor-pointer">About</span>
              <span class="hover:text-primary transition-colors cursor-pointer">Contact</span>
              <span class="hover:text-primary transition-colors cursor-pointer">Privacy</span>
              <NuxtLink v-if="loggedIn && isAdmin" to="/admin/radar" class="hover:text-primary transition-colors">Admin</NuxtLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </UApp>
</template>

<style>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}
.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 600px;
  opacity: 1;
}
</style>
