export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware for public pages
  if (['/login', '/register', '/'].includes(to.path)) {
    return;
  }

  // Get the Supabase client and user
  const client = useSupabaseClient();
  const user = useSupabaseUser();

  // Check if we have a session
  try {
    const { data } = await client.auth.getSession();
    
    // If no session and trying to access protected route, redirect to login
    if (!data.session && !user.value && to.path !== '/login') {
      console.log('No active session, redirecting to login');
      return navigateTo('/login');
    }
  } catch (error) {
    console.error('Error checking session:', error);
    return navigateTo('/login');
  }
});
