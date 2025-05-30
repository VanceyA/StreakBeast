<!-- pages/social.vue -->
<template>
  <div class="social-page">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Social Media Hub</h1>
      
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      
      <!-- Not authenticated -->
      <div v-else-if="!isAuthenticated" class="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
        <h2 class="text-xl font-bold mb-4">Authentication Required</h2>
        <p class="text-gray-400 mb-6">You need to be logged in to access the Social Media Hub</p>
        <button @click="login" class="btn-primary">Log In</button>
      </div>
      
      <!-- Main content -->
      <div v-else-if="isAuthenticated">
        <!-- Connection status message -->
        <div v-if="connectionStatus" class="mb-6 p-4 rounded-lg" :class="connectionStatus.success ? 'bg-green-800 border border-green-700' : 'bg-red-800 border border-red-700'">
          <div class="flex items-center">
            <div v-if="connectionStatus.success" class="mr-3 text-green-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div v-else class="mr-3 text-red-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-lg">{{ connectionStatus.title }}</h3>
              <p>{{ connectionStatus.message }}</p>
            </div>
          </div>
        </div>
        
        <!-- Social Dashboard -->
        <SocialDashboard />
        
        <!-- Achievements Section -->
        <div class="mt-8">
          <h2 class="text-2xl font-bold mb-4">Social Media Achievements</h2>
          <AchievementsSection category="social" />
        </div>
        
        <!-- Debug Section (only visible in development) -->
        <div v-if="isDev" class="mt-8 p-6 bg-gray-900 border border-gray-700 rounded-lg">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">Debug Information</h2>
            <button @click="refreshConnectionStatus" class="btn-secondary text-sm">
              Refresh Status
            </button>
          </div>
          
          <div class="mb-4">
            <h3 class="font-bold mb-2">Connection Status:</h3>
            <div v-if="connectionStatusLoading" class="text-gray-400">Loading...</div>
            <div v-else-if="connectionStatusError" class="text-red-400">{{ connectionStatusError }}</div>
            <div v-else-if="connectionStatusData">
              <div class="bg-gray-800 p-4 rounded-lg mb-2">
                <p><span class="font-bold">Connected Providers:</span> {{ connectionStatusData.connectedProviders && connectionStatusData.connectedProviders.length ? connectionStatusData.connectedProviders.join(', ') : 'None' }}</p>
                <p><span class="font-bold">Connection Count:</span> {{ connectionStatusData.connectionCount || 0 }}</p>
                <p><span class="font-bold">Table Exists:</span> {{ connectionStatusData.tableExists ? 'Yes' : 'No' }}</p>
                <p><span class="font-bold">User ID:</span> {{ connectionStatusData.user && connectionStatusData.user.id }}</p>
              </div>
              
              <div v-if="connectionStatusData.connections && connectionStatusData.connections.length > 0">
                <h4 class="font-bold mb-2">Connections:</h4>
                <div v-for="conn in connectionStatusData.connections" :key="conn.id" class="bg-gray-800 p-4 rounded-lg mb-2">
                  <p><span class="font-bold">Provider:</span> {{ conn.provider }}</p>
                  <p><span class="font-bold">Provider User ID:</span> {{ conn.provider_user_id }}</p>
                  <p><span class="font-bold">Created At:</span> {{ conn.created_at ? new Date(conn.created_at).toLocaleString() : 'Unknown' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { checkAchievements } = useAchievements()
const { $toast: toast } = useNuxtApp()

// Track loading state
const loading = ref(false)

// Connection status for feedback
const connectionStatus = ref(null)

// Debug information
const isDev = process.env.NODE_ENV !== 'production'
const connectionStatusLoading = ref(false)
const connectionStatusError = ref(null)
const connectionStatusData = ref(null)

// Computed property to check if user is authenticated
const isAuthenticated = computed(() => !!user.value)

// Login function
const login = () => {
  router.push('/login')
}

// Fetch connection status for debugging
const fetchConnectionStatus = async () => {
  if (!user.value) return
  
  connectionStatusLoading.value = true
  connectionStatusError.value = null
  
  try {
    const response = await $fetch('/api/social/connections/status')
    connectionStatusData.value = response
  } catch (error) {
    console.error('Error fetching connection status:', error)
    connectionStatusError.value = error.message || 'Failed to fetch connection status'
  } finally {
    connectionStatusLoading.value = false
  }
}

// Refresh connection status
const refreshConnectionStatus = () => {
  fetchConnectionStatus()
  toast.info('Connection status refreshed')
}

// Initialize the page on load
onMounted(async () => {
  loading.value = true
  
  try {
    // Use nextTick to ensure the component is fully mounted before handling route params
    await nextTick()
    
    // Check for connection status in URL
    if (route.query.connected) {
      const provider = route.query.connected
      const success = route.query.success === 'true'
      
      if (success) {
        connectionStatus.value = {
          success: true,
          title: 'Connection Successful!',
          message: `Your ${provider} account has been successfully connected.`
        }
        // Wrap in try/catch to prevent errors from breaking the page
        try {
          toast.success(`Connected to ${provider} successfully!`)
        } catch (toastError) {
          console.error('Toast error:', toastError)
        }
      }
    }
    
    // Check for error in URL
    if (route.query.error) {
      connectionStatus.value = {
        success: false,
        title: 'Connection Failed',
        message: `Error: ${route.query.error}${route.query.message ? ` - ${route.query.message}` : ''}`
      }
      // Wrap in try/catch to prevent errors from breaking the page
      try {
        toast.error('Failed to connect account')
      } catch (toastError) {
        console.error('Toast error:', toastError)
      }
    }
    
    // Clean up URL parameters after processing to prevent issues on refresh
    if (route.query.connected || route.query.error) {
      // Use replace to avoid adding to browser history
      router.replace({
        path: route.path,
        query: { timestamp: Date.now() }
      })
    }
    
    // Check for achievements
    if (user.value) {
      await checkAchievements('social')
    }
    
    // Fetch connection status for debugging
    if (isDev) {
      await fetchConnectionStatus()
    }
  } catch (error) {
    console.error('Error in onMounted:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.social-page {
  min-height: calc(100vh - 64px);
}
</style>
