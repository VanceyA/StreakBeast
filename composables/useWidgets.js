// composables/useWidgets.js
import { ref, computed, onMounted, watch } from 'vue'

export const useWidgets = () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()
  const { $toast: toast } = useNuxtApp()
  
  const userWidgets = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Available widget definitions
  const availableWidgets = [
    {
      id: 'youtube-subscribers',
      name: 'YouTube Subscribers',
      provider: 'youtube',
      size: 'medium',
      type: 'line-chart',
      dataKey: 'subscribers',
      color: '#FF0000'
    },
    {
      id: 'instagram-followers',
      name: 'Instagram Followers',
      provider: 'instagram',
      size: 'medium',
      type: 'line-chart',
      dataKey: 'followers',
      color: '#E1306C'
    },
    {
      id: 'tiktok-followers',
      name: 'TikTok Followers',
      provider: 'tiktok',
      size: 'medium',
      type: 'line-chart',
      dataKey: 'followers',
      color: '#00F2EA'
    },
    {
      id: 'twitter-followers',
      name: 'Twitter Followers',
      provider: 'twitter',
      size: 'medium',
      type: 'line-chart',
      dataKey: 'followers',
      color: '#1DA1F2'
    },
    {
      id: 'linkedin-connections',
      name: 'LinkedIn Connections',
      provider: 'linkedin',
      size: 'medium',
      type: 'line-chart',
      dataKey: 'connections',
      color: '#0077B5'
    },
    {
      id: 'best-posting-times',
      name: 'Best Posting Times',
      provider: 'all',
      size: 'large',
      type: 'heatmap',
      dataKey: 'engagement',
      color: '#00FF00'
    },
    {
      id: 'platform-comparison',
      name: 'Platform Comparison',
      provider: 'all',
      size: 'large',
      type: 'bar-chart',
      dataKey: 'engagement',
      color: '#9B59B6'
    },
    {
      id: 'recent-engagement',
      name: 'Recent Engagement',
      provider: 'all',
      size: 'medium',
      type: 'line-chart',
      dataKey: 'engagement',
      color: '#3498DB'
    },
    {
      id: 'content-performance',
      name: 'Content Performance',
      provider: 'all',
      size: 'large',
      type: 'bar-chart',
      dataKey: 'performance',
      color: '#F39C12'
    }
  ]
  
  // Fetch user's widget configuration from database
  const fetchUserWidgets = async () => {
    if (!user.value) return
    
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('user_widgets')
        .select('widget_ids')
        .eq('user_id', user.value.id)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected if user has no widgets yet
        throw fetchError
      }
      
      if (data) {
        userWidgets.value = data.widget_ids
      } else {
        // If no configuration exists, create default widgets
        await saveDefaultWidgets()
      }
    } catch (err) {
      console.error('Error fetching user widgets:', err)
      error.value = err.message
      toast.error('Failed to load dashboard widgets')
    } finally {
      loading.value = false
    }
  }
  
  // Save default widgets for new users
  const saveDefaultWidgets = async () => {
    if (!user.value) return
    
    // Default widget configuration
    const defaultWidgets = [
      'youtube-subscribers',
      'instagram-followers',
      'tiktok-followers',
      'twitter-followers',
      'best-posting-times',
      'platform-comparison'
    ]
    
    userWidgets.value = defaultWidgets
    
    try {
      const { error: saveError } = await supabase
        .from('user_widgets')
        .upsert({
          user_id: user.value.id,
          widget_ids: defaultWidgets
        })
      
      if (saveError) throw saveError
    } catch (err) {
      console.error('Error saving default widgets:', err)
      toast.error('Failed to save default widgets')
    }
  }
  
  // Save widget configuration to database
  const saveWidgets = async () => {
    if (!user.value) return
    
    loading.value = true
    error.value = null
    
    try {
      const { error: saveError } = await supabase
        .from('user_widgets')
        .upsert({
          user_id: user.value.id,
          widget_ids: userWidgets.value
        })
      
      if (saveError) throw saveError
      
      toast.success('Dashboard layout saved')
    } catch (err) {
      console.error('Error saving widgets:', err)
      error.value = err.message
      toast.error('Failed to save dashboard layout')
    } finally {
      loading.value = false
    }
  }
  
  // Add a widget to the dashboard
  const addWidget = async (widgetId) => {
    if (!userWidgets.value.includes(widgetId)) {
      userWidgets.value.push(widgetId)
      await saveWidgets()
    }
  }
  
  // Remove a widget from the dashboard
  const removeWidget = async (widgetId) => {
    userWidgets.value = userWidgets.value.filter(id => id !== widgetId)
    await saveWidgets()
  }
  
  // Reorder widgets
  const reorderWidgets = async (newOrder) => {
    userWidgets.value = newOrder
    await saveWidgets()
  }
  
  // Get widget details by ID
  const getWidgetById = (widgetId) => {
    return availableWidgets.find(w => w.id === widgetId)
  }
  
  // Get social connections from the useSocialData composable
  const { connections } = useSocialData()
  
  // Get all active widgets with details
  const activeWidgets = computed(() => {
    // Map widget IDs to their full widget objects
    const widgets = userWidgets.value.map(id => getWidgetById(id)).filter(Boolean)
    
    // Filter widgets to only include those for connected providers or 'all'
    return widgets.filter(widget => {
      // Always include 'all' provider widgets if there are any connections
      if (widget.provider === 'all') {
        return connections.value.length > 0
      }
      
      // Only include provider-specific widgets if that provider is connected
      return connections.value.some(conn => conn.provider === widget.provider)
    })
  })
  
  // Get available widgets that aren't already on the dashboard
  const availableToAdd = computed(() => {
    return availableWidgets.filter(widget => !userWidgets.value.includes(widget.id))
  })
  
  // Initialize on component mount
  onMounted(() => {
    if (user.value) {
      fetchUserWidgets()
    }
  })
  
  // Watch for user changes
  watch(() => user.value, (newUser) => {
    if (newUser) {
      fetchUserWidgets()
    } else {
      userWidgets.value = []
    }
  })
  
  return {
    userWidgets,
    availableWidgets,
    activeWidgets,
    availableToAdd,
    loading,
    error,
    fetchUserWidgets,
    addWidget,
    removeWidget,
    reorderWidgets,
    getWidgetById
  }
}