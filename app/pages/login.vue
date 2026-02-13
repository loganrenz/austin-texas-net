<script setup lang="ts">
definePageMeta({ title: 'Sign In' })

const {
  user,
  loggedIn,
  ensureLoaded,
  login: doLogin,
  signup: doSignup,
  logout: doLogout,
} = useAuth()
await ensureLoaded()

const form = reactive({
  name: '',
  email: import.meta.dev ? 'admin@austin-texas.net' : '',
  password: import.meta.dev ? 'testpassword123' : '',
})
const error = ref('')
const loading = ref(false)
const emailOpen = ref(false)
const mode = ref<'signin' | 'signup'>('signin')

const route = useRoute()
if (route.query.mode === 'signup') mode.value = 'signup'

const tabItems = computed(() => [
  { label: 'Sign In', value: 'signin' },
  { label: 'Sign Up', value: 'signup' },
])

function toggleMode() {
  mode.value = mode.value === 'signin' ? 'signup' : 'signin'
  error.value = ''
  form.email = ''
  form.password = ''
  form.name = ''
}

async function handleSubmit() {
  error.value = ''
  if (mode.value === 'signup' && form.password.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }
  loading.value = true
  try {
    if (mode.value === 'signin') {
      await doLogin(form.email, form.password)
    } else {
      await doSignup(form.email, form.password, form.name)
    }

    const redirect = route.query.redirect as string
    if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
      await navigateTo(redirect)
    } else {
      await navigateTo('/')
    }
  } catch (e: unknown) {
    const msg = (e as { data?: { message?: string } })?.data?.message
    error.value =
      mode.value === 'signin'
        ? msg || 'Invalid email or password'
        : msg || 'Failed to create account'
  } finally {
    loading.value = false
  }
}

function handleApple() {
  const params = new URLSearchParams({
    client_id: 'com.atxapps',
    redirect_uri: `${window.location.origin}/api/auth/apple-callback`,
    response_type: 'code id_token',
    response_mode: 'form_post',
    scope: 'name email',
    state: (route.query.redirect as string) || '/',
  })
  window.location.href = `https://appleid.apple.com/auth/authorize?${params.toString()}`
}

async function handleLogout() {
  await doLogout()
  navigateTo('/login')
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo & Title -->
      <div class="login-header">
        <div class="login-icon">
          <UIcon name="i-lucide-shield" class="icon" />
        </div>
        <h1>Austin Texas</h1>
        <p class="subtitle">Sign in to your account</p>
      </div>

      <!-- Authenticated State -->
      <template v-if="loggedIn">
        <div class="auth-state">
          <div class="user-info">
            <div class="user-avatar">{{ user?.email?.charAt(0).toUpperCase() }}</div>
            <div>
              <p class="user-name">{{ user?.name || 'Anonymous' }}</p>
              <p class="user-email">{{ user?.email }}</p>
            </div>
          </div>
          <UButton color="neutral" variant="outline" label="Sign Out" block @click="handleLogout" />
        </div>
      </template>

      <!-- Guest State -->
      <template v-else>
        <!-- Apple Sign In -->
        <UButton
          block
          size="lg"
          icon="i-lucide-apple"
          label="Continue with Apple"
          class="apple-btn"
          @click="handleApple"
        />

        <!-- Divider -->
        <div class="divider">
          <span>or</span>
        </div>

        <!-- Email Toggle -->
        <UButton
          block
          variant="outline"
          color="neutral"
          :icon="emailOpen ? 'i-lucide-chevron-up' : 'i-lucide-mail'"
          :label="
            emailOpen ? 'Hide' : mode === 'signin' ? 'Sign in with email' : 'Sign up with email'
          "
          @click="emailOpen = !emailOpen"
        />

        <!-- Email Form -->
        <Transition name="slide">
          <div v-if="emailOpen" class="email-form">
            <!-- Tabs -->
            <UTabs
              v-model="mode"
              :items="tabItems"
              :content="false"
              color="neutral"
              variant="pill"
              class="w-full"
              @update:model-value="error = ''"
            />

            <!-- Error -->
            <div v-if="error" class="error-banner">
              <UIcon name="i-lucide-alert-circle" class="error-icon" />
              <span>{{ error }}</span>
              <UButton
                icon="i-lucide-x"
                variant="ghost"
                color="neutral"
                size="xs"
                class="ml-auto"
                @click="error = ''"
              />
            </div>

            <UForm :state="form" class="form-fields" @submit="handleSubmit">
              <!-- Name (signup only) -->
              <Transition name="slide">
                <UFormField v-if="mode === 'signup'" label="Name" name="name">
                  <UInput v-model="form.name" placeholder="Your name" required class="w-full" />
                </UFormField>
              </Transition>

              <UFormField label="Email" name="email">
                <UInput
                  v-model="form.email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Password"
                name="password"
                :hint="mode === 'signup' ? 'Min. 8 characters' : undefined"
              >
                <UInput
                  v-model="form.password"
                  type="password"
                  placeholder="••••••••"
                  required
                  class="w-full"
                />
              </UFormField>

              <UButton
                type="submit"
                color="primary"
                block
                size="lg"
                :loading="loading"
                :label="mode === 'signin' ? 'Sign In' : 'Create Account'"
              />
            </UForm>

            <!-- Toggle mode text -->
            <p class="mode-toggle-text">
              <template v-if="mode === 'signin'">
                Don't have an account?
                <UButton variant="link" label="Create one" size="xs" @click="toggleMode" />
              </template>
              <template v-else>
                Already have an account?
                <UButton variant="link" label="Sign in" size="xs" @click="toggleMode" />
              </template>
            </p>
          </div>
        </Transition>
      </template>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  padding: 2rem 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header */
.login-header {
  text-align: center;
}

.login-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15));
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.login-icon .icon {
  width: 28px;
  height: 28px;
  color: #3b82f6;
}

.login-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 0.25rem;
}

.login-header .subtitle {
  font-size: 0.875rem;
  color: var(--ui-text-dimmed, #6b7280);
  margin: 0;
}

/* Apple Button */
.apple-btn {
  background: #000 !important;
  color: white !important;
  border: none !important;
}

:root.dark .apple-btn {
  background: white !important;
  color: black !important;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--ui-text-dimmed, #9ca3af);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--ui-border, #e5e7eb);
}

/* Email Form */
.email-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Error */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
  color: #dc2626;
  font-size: 0.875rem;
}

.error-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Form Fields */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Mode toggle */
.mode-toggle-text {
  text-align: center;
  font-size: 0.8125rem;
  color: var(--ui-text-dimmed, #6b7280);
}

/* Auth state */
.auth-state {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
  background: var(--ui-bg-elevated, #f9fafb);
  border: 1px solid var(--ui-border, #e5e7eb);
  border-radius: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  font-weight: 600;
  font-size: 1.125rem;
}

.user-name {
  font-weight: 600;
  margin: 0;
}

.user-email {
  font-size: 0.8125rem;
  color: var(--ui-text-dimmed, #6b7280);
  margin: 0;
}

/* Slide transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 600px;
  transform: translateY(0);
}

/* Dark mode adjustments */
:root.dark .error-banner {
  background: rgba(239, 68, 68, 0.15);
}
</style>
