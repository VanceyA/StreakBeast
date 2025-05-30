<!-- components/SocialDashboard.vue -->
<template>
  <div class="social-dashboard">
    <div class="mb-6">
      <h2 class="text-2xl font-bold mb-4">Social Media Dashboard</h2>
      <p class="text-gray-400">Connect your social accounts and track your performance across platforms.</p>
    </div>
    
    <!-- Social Connector -->
    <SocialConnector />
    
    <!-- Content Suggestions -->
    <ContentSuggestions v-if="hasConnections" class="mb-6" />
    
    <!-- Dashboard Widgets -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold">Analytics</h3>
        <button 
          @click="showWidgetSelector = true" 
          class="btn-primary text-sm"
        >
          <svg class="w-4 h-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Widget
        </button>
      </div>
      
      <div v-if="!hasConnections" class="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
        <p class="text-gray-400 mb-4">Connect your social accounts to see analytics</p>
        <button 
          @click="scrollToConnector" 
          class="btn-primary"
        >
          Connect Accounts
        </button>
      </div>
      
      <div v-else-if="userWidgets.length === 0" class="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
        <p class="text-gray-400 mb-4">Add widgets to customize your dashboard</p>
        <button 
          @click="showWidgetSelector = true" 
          class="btn-primary"
        >
          Add Your First Widget
        </button>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnalyticsWidget 
          v-for="widget in userWidgets" 
          :key="widget" 
          :widget="widget"
          @remove="removeWidgetFromDashboard(widget)"
        />
      </div>
    </div>
    
    <!-- Widget Selector Modal -->
    <div v-if="showWidgetSelector" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">Add Widget</h3>
          <button @click="showWidgetSelector = false" class="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Platform Selector -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-400 mb-2">Platform</label>
          <div class="grid grid-cols-3 gap-2">
            <template v-if="availableProviders.length > 0">
              <button 
                v-for="provider in availableProviders" 
                :key="provider.id"
                @click="selectedProvider = provider.id"
                class="p-2 rounded-lg border flex items-center justify-center"
                :class="selectedProvider === provider.id ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700'"
              >
                <div class="w-6 h-6 rounded-full flex items-center justify-center" :class="provider.bgClass">
                  <img :src="`/icons/${provider.id}.svg`" :alt="provider.name" class="w-4 h-4">
                </div>
                <span class="ml-2">{{ provider.name }}</span>
              </button>
              <button 
                v-if="availableProviders.length > 0"
                @click="selectedProvider = 'all'"
                class="p-2 rounded-lg border flex items-center justify-center"
                :class="selectedProvider === 'all' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700'"
              >
                <div class="w-6 h-6 rounded-full flex items-center justify-center bg-blue-900/20">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                  </svg>
                </div>
                <span class="ml-2">All Platforms</span>
              </button>
            </template>
            <div v-else class="col-span-3 text-center p-4 bg-gray-800 rounded-lg">
              <p class="text-gray-400">No connected social accounts found. Please connect at least one social account first.</p>
            </div>
          </div>
        </div>
        
        <!-- Widget Type Selector -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-400 mb-2">Widget Type</label>
          <div class="grid grid-cols-2 gap-2">
            <button 
              v-for="type in widgetTypes" 
              :key="type.id"
              @click="selectedWidgetType = type.id"
              class="p-2 rounded-lg border flex items-center"
              :class="selectedWidgetType === type.id ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700'"
            >
              <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-800 mr-2">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="type.icon" />
                </svg>
              </div>
              <div>
                <div class="font-medium">{{ type.name }}</div>
                <div class="text-xs text-gray-400">{{ type.description }}</div>
              </div>
            </button>
          </div>
        </div>
        
        <!-- Metric Selector -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-400 mb-2">Metric</label>
          <div class="grid grid-cols-2 gap-2">
            <button 
              v-for="metric in availableMetrics" 
              :key="metric.id"
              @click="selectedMetric = metric.id"
              class="p-2 rounded-lg border flex items-center"
              :class="selectedMetric === metric.id ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700'"
            >
              <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-800 mr-2">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="metric.icon" />
                </svg>
              </div>
              <div>
                <div class="font-medium">{{ metric.name }}</div>
                <div class="text-xs text-gray-400">{{ metric.description }}</div>
              </div>
            </button>
          </div>
        </div>
        
        <!-- Widget Size -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-400 mb-2">Widget Size</label>
          <div class="flex gap-2">
            <button 
              @click="selectedSize = 'small'"
              class="p-2 rounded-lg border flex items-center"
              :class="selectedSize === 'small' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700'"
            >
              <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-800 mr-2">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="4" y="4" width="16" height="16" rx="2" stroke-width="2" />
                </svg>
              </div>
              <span>Small</span>
            </button>
            <button 
              @click="selectedSize = 'large'"
              class="p-2 rounded-lg border flex items-center"
              :class="selectedSize === 'large' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700'"
            >
              <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-800 mr-2">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke-width="2" />
                </svg>
              </div>
              <span>Large</span>
            </button>
          </div>
        </div>
        
        <div class="flex justify-end">
          <button @click="showWidgetSelector = false" class="btn-secondary mr-2">Cancel</button>
          <button 
            @click="addNewWidget" 
            :disabled="!canAddWidget"
            class="btn-primary w-full"
          >
            Add Widget
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'

const { $toast: toast } = useNuxtApp()
const { connections, fetchConnections, fetchMetrics } = useSocialData()

// Import useWidgets composable
const { userWidgets, addWidget, removeWidget, saveWidgets } = useWidgets()

// Widget selector state
const showWidgetSelector = ref(false)
const selectedProvider = ref('all')
const selectedWidgetType = ref('line-chart')
const selectedMetric = ref('followers')
const selectedSize = ref('small')

// Check if user has any social connections
const hasConnections = computed(() => connections.value && connections.value.length > 0)

// Set initial selected provider to the first available provider or 'youtube' if available
onMounted(() => {
  if (availableProviders.value.length > 0) {
    // If YouTube is connected, select it by default
    const youtubeProvider = availableProviders.value.find(p => p.id === 'youtube')
    if (youtubeProvider) {
      selectedProvider.value = 'youtube'
    } else {
      selectedProvider.value = availableProviders.value[0].id
    }
  }
})

// Available providers - filtered based on connected accounts
const availableProviders = computed(() => {
  // If we have connections, only show the ones that are connected
  if (connections.value && connections.value.length > 0) {
    const connectedProviderIds = connections.value.map(conn => conn.provider);
    const providers = [
      { id: 'youtube', name: 'YouTube', bgClass: 'bg-red-900/20' },
      { id: 'instagram', name: 'Instagram', bgClass: 'bg-purple-900/20' },
      { id: 'twitter', name: 'Twitter', bgClass: 'bg-blue-900/20' },
      { id: 'tiktok', name: 'TikTok', bgClass: 'bg-gray-900/20' },
      { id: 'facebook', name: 'Facebook', bgClass: 'bg-blue-900/20' }
    ];
    return providers.filter(provider => connectedProviderIds.includes(provider.id));
  }
  return [];
})

// Process widget data for display and API interactions
const processWidgetData = (widgetId) => {
  const parts = widgetId.split('-')
  const provider = parts[0]
  const metric = parts[1]
  const widgetType = parts[2] || 'line-chart'
  
  // Map YouTube-specific metrics
  let dataKey = metric
  if (provider === 'youtube' && metric === 'followers') {
    dataKey = 'subscribers'
  }
  
  return {
    id: widgetId,
    provider,
    metric,
    dataKey,
    type: widgetType,
    name: `${formatProviderName(provider)} ${formatMetricName(metric)}`,
    color: getRandomColor()
  }
}

// Widget types
const widgetTypes = [
  { 
    id: 'line-chart', 
    name: 'Line Chart', 
    description: 'Shows trend over time',
    icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z'
  },
  { 
    id: 'bar-chart', 
    name: 'Bar Chart', 
    description: 'Compare different values',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 011-2h2a2 2 0 011 2v10m-6 0a2 2 0 01-2 2h-2a2 2 0 01-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  },
  { 
    id: 'heatmap', 
    name: 'Heatmap', 
    description: 'View patterns by time',
    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
  },
  { 
    id: 'stats-card', 
    name: 'Stats Card', 
    description: 'Show key metrics',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  }
]

// Available metrics
const availableMetrics = [
  { 
    id: 'followers', 
    name: 'Followers', 
    description: 'Total followers count',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
  },
  { 
    id: 'engagement', 
    name: 'Engagement', 
    description: 'Likes, comments, shares',
    icon: 'M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5'
  },
  { 
    id: 'views', 
    name: 'Views', 
    description: 'Content views',
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
  },
  { 
    id: 'growth_rate', 
    name: 'Growth Rate', 
    description: 'Follower growth percentage',
    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
  },
  {
    id: 'post_frequency', 
    name: 'Post Frequency', 
    description: 'Posts per time period',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
  },
  {
    id: 'best_times', 
    name: 'Best Times', 
    description: 'Optimal posting times',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
  }
]

// Widget colors
const widgetColors = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
]

// Check if widget can be added
const canAddWidget = computed(() => {
  return selectedProvider.value && selectedWidgetType.value && selectedMetric.value && selectedSize.value
})

// Add a new widget
const addNewWidget = async () => {
  if (!canAddWidget.value) return
  
  // Create a unique widget ID that includes the widget type
  const widgetId = `${selectedProvider.value}-${selectedMetric.value}-${selectedWidgetType.value}-${uuidv4().substring(0, 8)}`
  
  try {
    // Add the widget using the useWidgets composable
    await addWidget(widgetId)
    toast.success('Widget added successfully')
    showWidgetSelector.value = false
    
    // Reset selection but keep the provider the same if there's only one available
    if (availableProviders.value.length === 1) {
      selectedProvider.value = availableProviders.value[0].id
    } else {
      selectedProvider.value = 'all'
    }
    selectedWidgetType.value = 'line-chart'
    selectedMetric.value = 'followers'
    selectedSize.value = 'small'
    
    // Fetch metrics for the selected provider to ensure data is available
    await fetchMetrics(selectedProvider.value)
  } catch (error) {
    console.error('Error saving widget:', error)
    toast.error('Failed to add widget')
  }
}

// Remove a widget (wrapper for useWidgets.removeWidget)
const removeWidgetFromDashboard = async (widgetId) => {
  try {
    await removeWidget(widgetId)
    toast.success('Widget removed')
  } catch (error) {
    console.error('Error removing widget:', error)
    toast.error('Failed to remove widget')
  }
}

// Format provider name
const formatProviderName = (provider) => {
  if (provider === 'all') return 'All Platforms'
  return provider.charAt(0).toUpperCase() + provider.slice(1)
}

// Format metric name
const formatMetricName = (metric) => {
  return metric.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

// Get a random color
const getRandomColor = () => {
  return widgetColors[Math.floor(Math.random() * widgetColors.length)]
}

// Scroll to connector section
const scrollToConnector = () => {
  const connector = document.querySelector('.social-connector')
  if (connector) {
    connector.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>
