/**
 * Admin route guard middleware.
 *
 * Routes under /admin require the user to be authenticated
 * AND have isAdmin set to true. Non-admin users are redirected home.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Only protect /admin routes
  if (!to.path.startsWith('/admin')) return

  const { ensureLoaded, loggedIn, isAdmin } = useAuth()
  await ensureLoaded()

  if (!loggedIn.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (!isAdmin.value) {
    return navigateTo('/')
  }
})
