export const useAuth = () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()
  const router = useRouter()
  const { $toast: toast } = useNuxtApp()

  // Check if user is authenticated
  const isAuthenticated = computed(() => !!user.value)

  // Login function
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Login error:', error.message)
      return { data: null, error }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Navigate to login page after logout
      router.push('/login')
      return { error: null }
    } catch (error) {
      console.error('Logout error:', error.message)
      return { error }
    }
  }

  // Register function
  const register = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Registration error:', error.message)
      return { data: null, error }
    }
  }

  // Get current session
  const getSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      return { session: data.session, error: null }
    } catch (error) {
      console.error('Get session error:', error.message)
      return { session: null, error }
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    register,
    getSession
  }
}
