<!-- components/SocialConnector.vue -->
<template>
  <div class="social-connector bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
    <h3 class="text-xl font-bold mb-4">Connect Your Accounts</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="provider in providers" 
        :key="provider.id"
        class="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="provider.bgClass">
              <img :src="`/icons/${provider.id}.svg`" :alt="provider.name" class="w-6 h-6">
            </div>
            <div class="ml-3">
              <h4 class="font-semibold">{{ provider.name }}</h4>
              <p class="text-xs text-gray-400">
                {{ isConnected(provider.id) ? 'Connected' : 'Not connected' }}
              </p>
            </div>
          </div>
          
          <button 
            v-if="isConnected(provider.id)"
            @click="disconnect(provider.id)"
            class="btn-danger text-sm"
            :disabled="loading && activeProvider === provider.id"
          >
            <span v-if="loading && activeProvider === provider.id" class="mr-1">
              <svg class="animate-spin h-4 w-4 inline" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            Disconnect
          </button>
          <button 
            v-else
            @click="connect(provider.id)"
            class="btn-primary text-sm"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const { $toast: toast } = useNuxtApp()
const loading = ref(false)
const activeProvider = ref(null)

const providers = [
  { id: 'youtube', name: 'YouTube', bgClass: 'bg-red-900/20' },
  { id: 'instagram', name: 'Instagram', bgClass: 'bg-pink-900/20' },
  { id: 'tiktok', name: 'TikTok', bgClass: 'bg-blue-900/20' },
  { id: 'twitter', name: 'Twitter', bgClass: 'bg-blue-900/20' },
  { id: 'linkedin', name: 'LinkedIn', bgClass: 'bg-blue-900/20' }
]

const { connections, fetchConnections, disconnect: disconnectAccount } = useSocialData()

// Check if a provider is connected
const isConnected = (providerId) => {
  return connections.value.some(c => c.provider === providerId)
}

// Connect to a provider
const connect = (providerId) => {
  window.location.href = `/api/auth/${providerId}/connect`
}

// Disconnect from a provider
const disconnect = async (providerId) => {
  loading.value = true
  activeProvider.value = providerId
  
  try {
    await disconnectAccount(providerId)
    toast.success(`Disconnected from ${providerId}`)
  } catch (error) {
    console.error(`Error disconnecting from ${providerId}:`, error)
    toast.error(`Failed to disconnect from ${providerId}`)
  } finally {
    loading.value = false
    activeProvider.value = null
  }
}

// Load connections on mount
onMounted(async () => {
  await fetchConnections()
})
</script>