export default defineNuxtPlugin(() => {
  addRouteMiddleware('global-auth', async (to) => {
    // Skip middleware for login and register pages
    if (to.path === '/login' || to.path === '/register' || to.path === '/') {
      return
    }
    
    // Get current user
    const user = useSupabaseUser()
    
    // If no user and not on excluded pages, redirect to login
    if (!user.value) {
      console.log('No authenticated user, redirecting to login')
      return navigateTo('/login')
    }
  }, { global: true })
})
