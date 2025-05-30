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
              <div class="absolute bottom-0 left-0 right-0 h-px bg-white opacity-30"></div>
              
              <!-- Line path -->
              <svg class="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path 
                  :d="generateRandomPath()" 
                  fill="none"
                  stroke="white" 
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="opacity-80"
                />
                <!-- Optional subtle gradient background -->
                <linearGradient :id="`grad-${widget?.id || 'default'}`" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stop-color="rgba(255,255,255,0.1)" />
                  <stop offset="100%" stop-color="rgba(255,255,255,0)" />
                </linearGradient>
              </svg>
              
              <!-- Current value -->
              <div class="absolute top-2 right-2 text-2xl font-bold text-white">
                {{ getCurrentValue }}
              </div>
              
              <!-- Change indicator -->
              <div class="absolute top-10 right-2 text-sm flex items-center">
                <template v-if="getRandomTrend() > 0">
                  <svg class="w-4 h-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span class="text-green-500">{{ Math.abs(getRandomTrend()).toFixed(1) }}%</span>
                </template>
                <template v-else>
                  <svg class="w-4 h-4 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                  <span class="text-red-500">{{ Math.abs(getRandomTrend()).toFixed(1) }}%</span>
                </template>
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
            <div class="text-gray-400 text-sm mb-4">
              {{ formatMetricName(widget?.dataKey || 'metric') }}
            </div>
            <div class="flex items-center text-sm">
              <template v-if="getRandomTrend() > 0">
                <svg class="w-4 h-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span class="text-green-500">{{ Math.abs(getRandomTrend()).toFixed(1) }}% from last period</span>
              </template>
              <template v-else>
                <svg class="w-4 h-4 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                <span class="text-red-500">{{ Math.abs(getRandomTrend()).toFixed(1) }}% from last period</span>
              </template>
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

// Parse widget info from ID or use provided object
const widgetParts = computed(() => {
  if (typeof props.widget === 'string') {
    const parts = props.widget.split('-')
    return {
      provider: parts[0],
      metric: parts[1],
      type: parts[2] || 'line-chart'
    }
  }
  
  return props.widget
})

// Computed widget object with defaults
const widget = computed(() => {
  // Handle YouTube-specific metrics mapping
  let dataKey = widgetParts.value.metric
  if (widgetParts.value.provider === 'youtube' && widgetParts.value.metric === 'followers') {
    dataKey = 'subscribers'
  }
  
  return {
    ...widgetParts.value,
    name: `${formatProviderName(widgetParts.value.provider)} ${formatMetricName(widgetParts.value.metric)}`,
    dataKey: dataKey,
    type: widgetParts.value.type || 'line-chart',
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

// Check if platform is connected
const isConnected = computed(() => {
  const provider = typeof props.widget === 'string' ? props.widget.split('-')[0] : props.widget?.provider
  return connections.value && connections.value.some(c => c.provider === provider)
})

// Check if data is available for this widget
const hasData = computed(() => {
  const provider = typeof props.widget === 'string' ? props.widget.split('-')[0] : props.widget?.provider
  const metricKey = typeof props.widget === 'string' ? props.widget.split('-')[1] || 'followers' : props.widget?.dataKey
  
  // Handle YouTube-specific metrics
  let dataKey = metricKey
  if (provider === 'youtube' && metricKey === 'followers') {
    dataKey = 'subscribers'
  }
  
  // For debugging
  if (provider === 'youtube') {
    console.log('Checking YouTube data:', {
      provider,
      dataKey,
      hasMetrics: !!metrics.value[provider],
      hasDataKey: metrics.value[provider] ? !!metrics.value[provider][dataKey] : false,
      isArray: metrics.value[provider] && metrics.value[provider][dataKey] ? Array.isArray(metrics.value[provider][dataKey]) : false,
      length: metrics.value[provider] && metrics.value[provider][dataKey] && Array.isArray(metrics.value[provider][dataKey]) ? metrics.value[provider][dataKey].length : 0
    })
  }
  
  // If no data is available yet but we're connected, return true to show mock data
  if (isConnected.value && !metrics.value[provider]) {
    return true
  }
  
  return metrics.value[provider] && 
         metrics.value[provider][dataKey] && 
         Array.isArray(metrics.value[provider][dataKey]) && 
         metrics.value[provider][dataKey].length > 0
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
  loading.value = true;
  try {
    const provider = typeof props.widget === 'string' ? props.widget.split('-')[0] : props.widget?.provider
    
    if (provider === 'all') {
      // Fetch data for all connected platforms
      for (const connection of connections.value) {
        await fetchMetrics(connection.provider)
      }
    } else {
      // Fetch metrics for the specific provider
      const data = await fetchMetrics(provider)
      
      // Log the fetched data for debugging
      console.log(`Fetched ${provider} metrics:`, data)
      
      // If we're looking for YouTube subscribers but it's not in the data,
      // check if we need to map it from a different field
      if (provider === 'youtube' && 
          widget.value.dataKey === 'subscribers' && 
          data && 
          !data.subscribers && 
          data.followers) {
        // Map followers to subscribers for YouTube
        metrics.value = {
          ...metrics.value,
          [provider]: {
            ...data,
            subscribers: data.followers
          }
        }
      }
    }
  } catch (error) {
    console.error('Error refreshing data:', error)
    toast.error('Failed to refresh data')
  } finally {
    loading.value = false;
  }
}

// Get current value for the widget
const getCurrentValue = computed(() => {
  if (!hasData.value) return '0'
  
  const provider = typeof props.widget === 'string' ? props.widget.split('-')[0] : props.widget?.provider
  const metricKey = typeof props.widget === 'string' ? props.widget.split('-')[1] || 'followers' : props.widget?.dataKey
  
  // Handle YouTube-specific metrics
  let dataKey = metricKey
  if (provider === 'youtube' && metricKey === 'followers') {
    dataKey = 'subscribers'
  }
  
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
  // Force immediate data refresh when component mounts
  await refreshData()
})
</script>