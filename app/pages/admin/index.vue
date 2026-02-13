<script setup lang="ts">
definePageMeta({
  title: 'Admin',
  middleware: 'auth',
})

const { user, loggedIn, isAdmin, ensureLoaded, logout } = useAuth()
await ensureLoaded()

async function handleLogout() {
  await logout()
  navigateTo('/')
}
</script>

<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-8">
    <div
      class="w-full max-w-[480px] bg-elevated border border-default rounded-2xl p-8 flex flex-col gap-6"
    >
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-shield-check" class="size-8 text-primary" />
        <h1 class="text-2xl font-bold m-0">Admin Dashboard</h1>
      </div>

      <div class="flex flex-col gap-3">
        <div
          class="flex justify-between items-center px-3.5 py-2.5 bg-default border border-default rounded-[10px] text-sm"
        >
          <span class="font-medium text-dimmed">Authenticated</span>
          <span class="font-semibold" :class="loggedIn ? 'text-success' : 'text-error'">
            {{ loggedIn ? '✓ Yes' : '✗ No' }}
          </span>
        </div>
        <div
          class="flex justify-between items-center px-3.5 py-2.5 bg-default border border-default rounded-[10px] text-sm"
        >
          <span class="font-medium text-dimmed">Admin</span>
          <span class="font-semibold" :class="isAdmin ? 'text-success' : 'text-warning'">
            {{ isAdmin ? '✓ Yes' : '✗ No' }}
          </span>
        </div>
        <div
          class="flex justify-between items-center px-3.5 py-2.5 bg-default border border-default rounded-[10px] text-sm"
        >
          <span class="font-medium text-dimmed">Email</span>
          <span class="font-semibold">{{ user?.email || '—' }}</span>
        </div>
        <div
          class="flex justify-between items-center px-3.5 py-2.5 bg-default border border-default rounded-[10px] text-sm"
        >
          <span class="font-medium text-dimmed">Name</span>
          <span class="font-semibold">{{ user?.name || '—' }}</span>
        </div>
        <div
          class="flex justify-between items-center px-3.5 py-2.5 bg-default border border-default rounded-[10px] text-sm"
        >
          <span class="font-medium text-dimmed">User ID</span>
          <span
            class="font-semibold font-mono text-xs max-w-[200px] overflow-hidden text-ellipsis"
            >{{ user?.id || '—' }}</span
          >
        </div>
      </div>

      <div class="flex gap-3 justify-between">
        <UButton color="neutral" variant="outline" to="/" icon="i-lucide-arrow-left">
          Back to site
        </UButton>
        <UButton color="primary" variant="soft" to="/admin/radar" icon="i-lucide-radar">
          Search Radar
        </UButton>
        <UButton color="error" variant="soft" icon="i-lucide-log-out" @click="handleLogout">
          Sign Out
        </UButton>
      </div>
    </div>
  </div>
</template>
