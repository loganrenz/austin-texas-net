<script setup lang="ts">
definePageMeta({ title: 'Sign In' })

const { user, loggedIn, ensureLoaded, login: doLogin, signup: doSignup, logout: doLogout } = useAuth()
await ensureLoaded()

const form = reactive({ name: '', email: '', password: '' })
const error = ref('')
const loading = ref(false)
const emailOpen = ref(false)
const mode = ref<'signin' | 'signup'>('signin')

const route = useRoute()
if (route.query.mode === 'signup') mode.value = 'signup'

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
  } catch (e: any) {
    error.value = mode.value === 'signin'
      ? (e.data?.message || 'Invalid email or password')
      : (e.data?.message || 'Failed to create account')
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
    state: route.query.redirect as string || '/',
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
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
          <button class="btn btn-secondary" @click="handleLogout">Sign Out</button>
        </div>
      </template>

      <!-- Guest State -->
      <template v-else>
        <!-- Apple Sign In -->
        <button type="button" class="apple-btn" @click="handleApple">
          <svg class="apple-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          <span>Continue with Apple</span>
        </button>

        <!-- Divider -->
        <div class="divider">
          <span>or</span>
        </div>

        <!-- Email Toggle -->
        <button type="button" class="email-toggle" @click="emailOpen = !emailOpen">
          <svg v-if="!emailOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toggle-icon">
            <rect width="20" height="16" x="2" y="4" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toggle-icon">
            <path d="m18 15-6-6-6 6"/>
          </svg>
          <span>{{ emailOpen ? 'Hide' : (mode === 'signin' ? 'Sign in with email' : 'Sign up with email') }}</span>
        </button>

        <!-- Email Form -->
        <Transition name="slide">
          <div v-if="emailOpen" class="email-form">
            <!-- Tabs -->
            <div class="tabs">
              <button type="button" class="tab" :class="{ active: mode === 'signin' }" @click="mode = 'signin'; error = ''">
                Sign In
              </button>
              <button type="button" class="tab" :class="{ active: mode === 'signup' }" @click="mode = 'signup'; error = ''">
                Sign Up
              </button>
            </div>

            <!-- Error -->
            <div v-if="error" class="error-banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="error-icon">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{{ error }}</span>
              <button type="button" class="error-close" @click="error = ''">&times;</button>
            </div>

            <form @submit.prevent="handleSubmit">
              <!-- Name (signup only) -->
              <Transition name="slide">
                <div v-if="mode === 'signup'" class="field">
                  <label for="name">Name</label>
                  <input id="name" v-model="form.name" type="text" placeholder="Your name" required />
                </div>
              </Transition>

              <div class="field">
                <label for="email">Email</label>
                <input id="email" v-model="form.email" type="email" placeholder="you@example.com" required />
              </div>

              <div class="field">
                <label for="password">Password</label>
                <input id="password" v-model="form.password" type="password" placeholder="••••••••" required />
                <span v-if="mode === 'signup'" class="hint">Min. 8 characters</span>
              </div>

              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner"></span>
                {{ mode === 'signin' ? 'Sign In' : 'Create Account' }}
              </button>
            </form>

            <!-- Toggle mode text -->
            <p class="mode-toggle-text">
              <template v-if="mode === 'signin'">
                Don't have an account?
                <button type="button" @click="toggleMode">Create one</button>
              </template>
              <template v-else>
                Already have an account?
                <button type="button" @click="toggleMode">Sign in</button>
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: white;
  background: #000;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.15s ease;
  letter-spacing: -0.01em;
}

.apple-btn:hover { opacity: 0.85; }
:root.dark .apple-btn { background: white; color: black; }

.apple-icon { width: 20px; height: 20px; }

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

/* Email Toggle */
.email-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ui-text-dimmed, #6b7280);
  background: transparent;
  border: 1px solid var(--ui-border, #e5e7eb);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.email-toggle:hover {
  color: var(--ui-text, #111);
  border-color: var(--ui-border-hover, #d1d5db);
  background: var(--ui-bg-elevated, #f9fafb);
}

.toggle-icon { width: 16px; height: 16px; }

/* Email Form */
.email-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--ui-bg-elevated, #f3f4f6);
  border-radius: 10px;
}

.tab {
  flex: 1;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  color: var(--ui-text-dimmed, #6b7280);
  background: transparent;
}

.tab.active {
  background: var(--ui-bg, white);
  color: var(--ui-text, #111);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.tab:not(.active):hover { color: var(--ui-text-muted, #4b5563); }

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

.error-icon { width: 16px; height: 16px; flex-shrink: 0; }
.error-close {
  margin-left: auto;
  background: none;
  border: none;
  color: inherit;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0 0.25rem;
}

/* Form Fields */
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ui-text, #111);
}

.field input {
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  border: 1px solid var(--ui-border, #e5e7eb);
  border-radius: 10px;
  background: var(--ui-bg, white);
  color: var(--ui-text, #111);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.field input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.field input::placeholder { color: var(--ui-text-dimmed, #9ca3af); }

.field .hint {
  font-size: 0.75rem;
  color: var(--ui-text-dimmed, #9ca3af);
}

/* Buttons */
.btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary {
  background: var(--ui-bg-elevated, #f3f4f6);
  color: var(--ui-text, #111);
  border: 1px solid var(--ui-border, #e5e7eb);
}

.btn-secondary:hover {
  background: var(--ui-bg-hover, #e5e7eb);
}

/* Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Mode toggle */
.mode-toggle-text {
  text-align: center;
  font-size: 0.8125rem;
  color: var(--ui-text-dimmed, #6b7280);
}

.mode-toggle-text button {
  background: none;
  border: none;
  color: #3b82f6;
  font-weight: 500;
  cursor: pointer;
}

.mode-toggle-text button:hover { text-decoration: underline; }

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
:root.dark .field input {
  background: var(--ui-bg-elevated, #1f2937);
}

:root.dark .error-banner {
  background: rgba(239, 68, 68, 0.15);
}
</style>
