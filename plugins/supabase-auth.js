export default defineNuxtPlugin(nuxtApp => {
  // Only run on client-side
  if (process.client) {
    // Add auth state change listener when app is mounted
    nuxtApp.hook('app:mounted', () => {
      // Get the Supabase client using the composable
      const supabase = useSupabaseClient()
      
      if (supabase && supabase.auth) {
        console.log('Setting up auth state listener')
        
        // Listen for auth state changes
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('Auth state changed:', event)
          
          if (event === 'SIGNED_IN') {
            console.log('User signed in')
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out')
            // Use navigateTo for client-side navigation
            navigateTo('/login')
          }
        })
      }
    })
  }
})
