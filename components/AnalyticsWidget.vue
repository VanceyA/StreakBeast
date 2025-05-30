<!-- components/AnalyticsWidget.vue -->
<template>
  <div 
    class="analytics-widget bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-all"
    :class="{ 'col-span-2': widget?.size === 'large' }"
  >
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center">
          <div 
            class="w-6 h-6 rounded-full flex items-center justify-center mr-2" 
            :style="{ backgroundColor: `${widget?.color || '#3b82f6'}22` }"
          >
            <img 
              v-if="widget?.provider !== 'all'" 
              :src="`/icons/${widget?.provider}.svg`" 
              :alt="widget?.provider" 
              class="w-4 h-4"
            >
            <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
            </svg>
          </div>
          <h3 class="font-bold text-lg">{{ widget?.name || 'Widget' }}</h3>
        </div>
        <div class="flex items-center">
          <button 
            @click="refreshData" 
            class="text-gray-400 hover:text-white mr-2"
            :disabled="loading"
          >
            <svg class="h-4 w-4" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button @click="$emit('remove')" class="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" :style="`border-color: ${widget?.color || '#3b82f6'}`"></div>
      </div>
      
      <div v-else-if="!hasData" class="text-center py-8">
        <p class="text-gray-400">No data available</p>
        <button 
          v-if="!isConnected"
          @click="connect(widget?.provider || 'all')"
          class="btn-primary mt-4 text-sm"
        >
          Connect {{ formatProviderName(widget?.provider || 'all') }}
        </button>
        <button 
          v-else
          @click="refreshData"
          class="btn-primary mt-4 text-sm"
        >
          Refresh Data
        </button>
      </div>
      
      <div v-else class="h-64">
        <!-- Line Chart -->
        <template v-if="widget?.type === 'line-chart'">
          <div class="h-full w-full flex items-center justify-center">
            <div class="w-full h-full relative">
              <!-- Placeholder for actual chart implementation -->
              <div 
                class="absolute bottom-0 left-0 right-0 bg-opacity-20 rounded-md" 
                :style="{
                  height: `${getRandomHeight()}%`,
                  backgroundColor: widget?.color || '#3b82f6',
                  backgroundImage: `linear-gradient(to top, ${widget?.color || '#3b82f6'}22, ${widget?.color || '#3b82f6'}00)`
                }"
              ></div>
              <div class="absolute bottom-0 left-0 right-0 h-px" :style="{backgroundColor: widget?.color || '#3b82f6'}"></div>
              
              <!-- Line path -->
              <svg class="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path 
                  :d="generateRandomPath()" 
                  :stroke="widget?.color || '#3b82f6'" 
                  stroke-width="2" 
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              
              <!-- Current value -->
              <div class="absolute top-2 right-2 text-2xl font-bold" :style="{color: widget?.color || '#3b82f6'}">
                {{ getCurrentValue }}
              </div>
              
              <!-- Change indicator -->
              <div class="absolute top-10 right-2 text-sm flex items-center">
                <svg v-if="getRandomTrend() > 0" class="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"></path>
                </svg>
                <svg v-else class="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1v-5a1 1 0 112 0v2.586l4.293-4.293a1 1 0 011.414 0L16 9.586l4.293-4.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0L13 9.414 9.414 13H12z" clip-rule="evenodd"></path>
                </svg>
                <span :class="getRandomTrend() > 0 ? 'text-green-500' : 'text-red-500'">
                  {{ Math.abs(getRandomTrend()).toFixed(1) }}%
                </span>
              </div>
            </div>
          </div>
        </template>
        
        <!-- Bar Chart -->
        <template v-else-if="widget.type === 'bar-chart'">
          <div class="h-full w-full flex items-end justify-between px-4">
            <div 
              v-for="i in 7" 
              :key="i"
              class="w-8 rounded-t-md mx-1 transition-all duration-500"
              :style="{
                height: `${getRandomHeight()}%`,
                backgroundColor: widget.color
              }"
            ></div>
          </div>
        </template>
        
        <!-- Heatmap -->
        <template v-else-if="widget.type === 'heatmap'">
          <div class="h-full w-full grid grid-cols-7 gap-1">
            <div v-for="day in 7" :key="'day-'+day" class="grid grid-rows-4 gap-1">
              <div 
                v-for="hour in 4" 
                :key="'hour-'+hour"
                class="rounded-sm"
                :style="{
                  backgroundColor: `${widget.color}${getRandomOpacity()}`
                }"
              ></div>
            </div>
          </div>
          <div class="mt-2 grid grid-cols-7 text-xs text-center text-gray-500">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>
        </template>
        
        <!-- Stats Card -->
        <template v-else-if="widget?.type === 'stats-card'">
          <div class="h-full w-full flex flex-col justify-center items-center">
            <div class="text-4xl font-bold mb-2" :style="{color: widget?.color || '#3b82f6'}">
              {{ getRandomValue() }}
            </div>
            <div class="text-sm text-gray-400 mb-4">
              {{ widget?.dataKey?.replace('_', ' ') || 'Metric' }}
            </div>
            <div class="flex items-center">
              <svg v-if="getRandomTrend() > 0" class="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"></path>
              </svg>
              <svg v-else class="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1v-5a1 1 0 112 0v2.586l4.293-4.293a1 1 0 011.414 0L16 9.586l4.293-4.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0L13 9.414 9.414 13H12z" clip-rule="evenodd"></path>
              </svg>
              <span :class="getRandomTrend() > 0 ? 'text-green-500' : 'text-red-500'">
                {{ Math.abs(getRandomTrend()).toFixed(1) }}% from last period
              </span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const { $toast: toast } = useNuxtApp()

const props = defineProps({
  widget: {
    type: [String, Object],
    required: true
  }
})

// Determine if the widget prop is a string ID or a full widget object
const isWidgetId = computed(() => typeof props.widget === 'string')

// Parse the widget ID to extract provider and metric if it's a string
const widgetParts = computed(() => {
  if (!isWidgetId.value) return null
  
  const parts = props.widget.split('-')
  return {
    provider: parts[0],
    metric: parts[1] || 'followers',
    id: props.widget
  }
})

// Get the widget object - either from the prop directly or create it from the ID
const widget = computed(() => {
  if (!isWidgetId.value) return props.widget
  
  return {
    id: widgetParts.value.id,
    provider: widgetParts.value.provider,
    dataKey: widgetParts.value.metric,
    name: `${formatProviderName(widgetParts.value.provider)} ${formatMetricName(widgetParts.value.metric)}`,
    type: 'line-chart',
    size: widgetParts.value.provider === 'all' ? 'large' : 'medium',
    color: getWidgetColor(widgetParts.value.provider)
  }
})

defineEmits(['remove'])

const { connections, metrics, loading, fetchMetrics } = useSocialData()

// Get color for widget based on provider
const getWidgetColor = (provider) => {
  const colorMap = {
    youtube: '#FF0000',
    instagram: '#E1306C',
    tiktok: '#00F2EA',
    twitter: '#1DA1F2',
    linkedin: '#0077B5',
    all: '#3b82f6'
  }
  return colorMap[provider] || '#3b82f6'
}

// Check if the provider is connected
const isConnected = computed(() => {
  const provider = typeof props.widget === 'string' ? props.widget.split('-')[0] : props.widget?.provider
  
  if (provider === 'all') {
    return connections.value.length > 0
  }
  return connections.value.some(c => c.provider === provider)
})

// Check if we have data for this widget
const hasData = computed(() => {
  if (!isConnected.value) return false
  
  const provider = typeof props.widget === 'string' ? props.widget.split('-')[0] : props.widget?.provider
  
  if (provider === 'all') {
    return Object.keys(metrics.value).length > 0
  }
  
  // Check if we have any data for this provider
  return !!metrics.value[provider]
})

// Format provider name for display
const formatProviderName = (provider) => {
  if (provider === 'all') return 'All Platforms'
  return provider.charAt(0).toUpperCase() + provider.slice(1)
}

// Format metric name for display
const formatMetricName = (metric) => {
  if (!metric) return ''
  return metric.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

// Connect to a provider
const connect = (providerId) => {
  if (providerId === 'all') {
    // Show a modal or dropdown to select a platform
    return
  }
  window.location.href = `/api/auth/${providerId}/connect`
}

// Refresh data for this widget
const refreshData = async () => {
  try {
    const provider = typeof props.widget === 'string' ? props.widget.split('-')[0] : props.widget?.provider
    
    if (provider === 'all') {
      // Fetch data for all connected platforms
      for (const connection of connections.value) {
        await fetchMetrics(connection.provider)
      }
    } else {
      await fetchMetrics(provider)
    }
    toast.success('Data refreshed successfully')
  } catch (error) {
    console.error('Error refreshing data:', error)
    toast.error('Failed to refresh data')
  }
}

// Format data for the chart
const chartData = computed(() => {
  if (!hasData.value) return []
  
  if (props.widget.provider === 'all') {
    // Format data for multi-platform widgets
    return formatMultiPlatformData()
  }
  
  // Format data for single platform widgets
  return formatSinglePlatformData()
})

// Format data for single platform widgets
const formatSinglePlatformData = () => {
  const data = metrics.value[widget.value.provider][widget.value.dataKey]
  
  if (Array.isArray(data)) {
    return data
  }
  
  // Convert object to array if needed
  return Object.entries(data).map(([date, value]) => ({
    date,
    value
  }))
}

// Format data for multi-platform widgets
const formatMultiPlatformData = () => {
  if (props.widget.type === 'bar-chart') {
    return Object.entries(metrics.value).map(([platform, data]) => ({
      platform,
      value: data[props.widget.dataKey]?.length 
        ? data[props.widget.dataKey][data[props.widget.dataKey].length - 1].value 
        : 0
    }))
  }
  
  if (props.widget.type === 'heatmap') {
    // Format data for heatmap
    const heatmapData = []
    
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        let value = 0
        
        // Aggregate engagement across platforms
        Object.values(metrics.value).forEach(platformData => {
          if (platformData.engagementByTime) {
            value += platformData.engagementByTime[day]?.[hour] || 0
          }
        })
        
        heatmapData.push({
          day,
          hour,
          value
        })
      }
    }
    
    return heatmapData
  }
  
  return []
}

// Get current value for the widget
const getCurrentValue = computed(() => {
  if (!hasData.value) return '0'
  
  const provider = typeof props.widget === 'string' ? props.widget.split('-')[0] : props.widget?.provider
  const metricKey = typeof props.widget === 'string' ? props.widget.split('-')[1] || 'followers' : props.widget?.dataKey
  
  // Handle YouTube subscribers as followers
  const dataKey = metricKey === 'subscribers' && provider === 'youtube' ? 'followers' : metricKey
  
  if (metrics.value[provider] && metrics.value[provider][dataKey]) {
    const data = metrics.value[provider][dataKey]
    if (Array.isArray(data) && data.length > 0) {
      // Return the most recent value
      return data[data.length - 1].value.toLocaleString()
    }
  }
  
  // Fallback to random value
  return getRandomValue()
})

// Placeholder functions for demo visualization
const getRandomHeight = () => {
  return 30 + Math.random() * 60
}

const getRandomValue = () => {
  return Math.floor(1000 + Math.random() * 9000).toLocaleString()
}

const getRandomTrend = () => {
  return (Math.random() * 20) - 10
}

const getRandomOpacity = () => {
  const opacities = ['11', '22', '44', '66', '88', 'aa', 'cc']
  return opacities[Math.floor(Math.random() * opacities.length)]
}

// Generate a random SVG path for the line chart
const generateRandomPath = () => {
  let path = 'M0,100 '
  const points = 10
  
  for (let i = 1; i <= points; i++) {
    const x = (i / points) * 100
    const y = Math.max(10, Math.min(90, 50 + (Math.random() - 0.5) * 60))
    path += `L${x},${y} `
  }
  
  return path
}

// Load data on mount
onMounted(async () => {
  await refreshData()
})
</script>