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
  <div class="admin-page">
    <div class="admin-card">
      <div class="admin-header">
        <UIcon name="i-lucide-shield-check" class="size-8 text-primary" />
        <h1>Admin Dashboard</h1>
      </div>

      <div class="status-grid">
        <div class="status-item">
          <span class="status-label">Authenticated</span>
          <span class="status-value" :class="loggedIn ? 'text-green' : 'text-red'">
            {{ loggedIn ? '✓ Yes' : '✗ No' }}
          </span>
        </div>
        <div class="status-item">
          <span class="status-label">Admin</span>
          <span class="status-value" :class="isAdmin ? 'text-green' : 'text-orange'">
            {{ isAdmin ? '✓ Yes' : '✗ No' }}
          </span>
        </div>
        <div class="status-item">
          <span class="status-label">Email</span>
          <span class="status-value">{{ user?.email || '—' }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Name</span>
          <span class="status-value">{{ user?.name || '—' }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">User ID</span>
          <span class="status-value mono">{{ user?.id || '—' }}</span>
        </div>
      </div>

      <div class="admin-actions">
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

<style scoped>
.admin-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: 2rem 1rem;
}

.admin-card {
  width: 100%;
  max-width: 480px;
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.admin-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.admin-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.status-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0.875rem;
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
  border-radius: 10px;
  font-size: 0.875rem;
}

.status-label {
  font-weight: 500;
  color: var(--ui-text-dimmed);
}

.status-value {
  font-weight: 600;
}

.status-value.mono {
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-green { color: #22c55e; }
.text-red { color: #ef4444; }
.text-orange { color: #f59e0b; }

.admin-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
}
</style>
