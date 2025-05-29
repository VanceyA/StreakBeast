// composables/useSocialData.js
import { ref, watch, onMounted } from 'vue'

export const useSocialData = () => {
  const connections = ref([])
  const metrics = ref({})
  const loading = ref(false)
  const error = ref(null)
  const { $toast: toast } = useNuxtApp()
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()
  
  // Get user's social connections
  const fetchConnections = async () => {
    if (!user.value) return []
    
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('social_connections')
        .select('*')
      
      if (fetchError) throw fetchError
      
      connections.value = data || []
      return connections.value
    } catch (err) {
      console.error('Error fetching social connections:', err)
      error.value = err.message
      toast.error('Failed to load social connections')
      return []
    } finally {
      loading.value = false
    }
  }
  
  // Fetch metrics for a specific platform
  const fetchMetrics = async (provider) => {
    if (!user.value) return null
    if (!connections.value.find(c => c.provider === provider)) {
      return null
    }
    
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await $fetch(`/api/social/${provider}/metrics`)
      
      if (fetchError) throw new Error(fetchError)
      
      metrics.value = {
        ...metrics.value,
        [provider]: data
      }
      
      return data
    } catch (err) {
      console.error(`Error fetching ${provider} metrics:`, err)
      error.value = err.message
      toast.error(`Failed to load ${provider} metrics`)
      return null
    } finally {
      loading.value = false
    }
  }
  
  // Fetch metrics for all connected platforms
  const fetchAllMetrics = async () => {
    if (!user.value) return {}
    await fetchConnections()
    
    const results = {}
    for (const connection of connections.value) {
      results[connection.provider] = await fetchMetrics(connection.provider)
    }
    
    return results
  }
  
  // Disconnect a social account
  const disconnect = async (provider) => {
    if (!user.value) return false
    
    try {
      const { error: deleteError } = await supabase
        .from('social_connections')
        .delete()
        .eq('provider', provider)
      
      if (deleteError) throw deleteError
      
      // Remove from local state
      connections.value = connections.value.filter(c => c.provider !== provider)
      if (metrics.value[provider]) {
        delete metrics.value[provider]
      }
      
      toast.success(`Disconnected from ${provider}`)
      return true
    } catch (err) {
      console.error(`Error disconnecting ${provider}:`, err)
      toast.error(`Failed to disconnect from ${provider}`)
      return false
    }
  }
  
  // Initialize on mount
  onMounted(() => {
    if (user.value) {
      fetchConnections()
    }
  })
  
  // Watch for user changes
  watch(() => user.value, (newUser) => {
    if (newUser) {
      fetchConnections()
    } else {
      connections.value = []
      metrics.value = {}
    }
  })
  
  return {
    connections,
    metrics,
    loading,
    error,
    fetchConnections,
    fetchMetrics,
    fetchAllMetrics,
    disconnect
  }
}