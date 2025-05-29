<!-- components/ContentSuggestions.vue -->
<template>
  <div class="content-suggestions bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold">Content Suggestions</h2>
      <div class="flex space-x-4">
        <select 
          v-model="selectedPlatform" 
          class="bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-sm"
        >
          <option value="">Select Platform</option>
          <option 
            v-for="connection in connections" 
            :key="connection.provider" 
            :value="connection.provider"
          >
            {{ formatPlatformName(connection.provider) }}
          </option>
        </select>
        
        <button 
          @click="generateSuggestions" 
          class="btn-primary text-sm flex items-center"
          :disabled="loading || !selectedPlatform"
        >
          <span v-if="loading" class="mr-2">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          Generate Ideas
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
    
    <div v-else-if="!suggestions" class="text-center py-8">
      <p class="text-gray-400 mb-4">Select a platform and generate content suggestions</p>
      <p v-if="!hasConnections" class="text-sm text-gray-500">
        You need to connect your social accounts first
      </p>
    </div>
    
    <div v-else>
      <!-- Topic Ideas -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-green-400">Topic Ideas</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="(topic, index) in suggestions.topicIdeas" 
            :key="index"
            class="bg-gray-900 border border-gray-700 p-4 rounded-md hover:border-green-500 transition-all"
          >
            <div class="flex justify-between items-start">
              <h4 class="font-bold">{{ topic.title }}</h4>
              <span 
                class="text-xs px-2 py-1 rounded-full" 
                :class="{
                  'bg-green-900 text-green-300': topic.estimatedEngagement === 'high',
                  'bg-yellow-900 text-yellow-300': topic.estimatedEngagement === 'medium',
                  'bg-red-900 text-red-300': topic.estimatedEngagement === 'low'
                }"
              >
                {{ topic.estimatedEngagement }}
              </span>
            </div>
            <p class="text-sm text-gray-400 mt-2">{{ topic.description }}</p>
          </div>
        </div>
      </div>
      
      <!-- Format Suggestions -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-blue-400">Format Suggestions</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="(format, index) in suggestions.formatSuggestions" 
            :key="index"
            class="bg-gray-900 border border-gray-700 p-4 rounded-md hover:border-blue-500 transition-all"
          >
            <h4 class="font-bold">{{ format.format }}</h4>
            <p class="text-sm text-gray-400 mt-2">{{ format.description }}</p>
            <div class="mt-2 p-2 bg-gray-800 rounded text-xs italic">
              Example: {{ format.example }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Title Suggestions -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-purple-400">Title Suggestions</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div 
            v-for="(title, index) in suggestions.titleSuggestions" 
            :key="index"
            class="bg-gray-900 border border-gray-700 p-3 rounded-md hover:border-purple-500 transition-all"
          >
            <p>{{ title }}</p>
          </div>
        </div>
      </div>
      
      <!-- Hashtag Suggestions -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-yellow-400">Hashtag Suggestions</h3>
        <div class="flex flex-wrap gap-2">
          <div 
            v-for="(hashtag, index) in suggestions.hashtagSuggestions" 
            :key="index"
            class="bg-gray-900 border border-gray-700 px-3 py-1 rounded-full hover:border-yellow-500 transition-all text-sm"
          >
            {{ hashtag }}
          </div>
        </div>
      </div>
      
      <!-- Best Posting Times -->
      <div>
        <h3 class="text-lg font-semibold mb-4 text-red-400">Best Posting Times</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div 
            v-for="(time, index) in suggestions.bestPostingTimes" 
            :key="index"
            class="bg-gray-900 border border-gray-700 p-3 rounded-md hover:border-red-500 transition-all"
          >
            <div class="font-bold">{{ time.day }} at {{ time.time }}</div>
            <p class="text-sm text-gray-400 mt-1">{{ time.reason }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const { $toast: toast } = useNuxtApp()
const { user } = useSupabaseUser()
const { connections, fetchConnections } = useSocialData()

const selectedPlatform = ref('')
const loading = ref(false)
const suggestions = ref(null)

// Check if user has any social connections
const hasConnections = computed(() => {
  return connections.value && connections.value.length > 0
})

// Format platform name for display
const formatPlatformName = (provider) => {
  if (!provider) return ''
  return provider.charAt(0).toUpperCase() + provider.slice(1)
}

// Generate content suggestions
const generateSuggestions = async () => {
  if (!selectedPlatform.value) {
    toast.warning('Please select a platform')
    return
  }
  
  loading.value = true
  suggestions.value = null
  
  try {
    const { data, error } = await $fetch('/api/suggestions/generate', {
      method: 'POST',
      body: {
        userId: user.value.id,
        platform: selectedPlatform.value
      }
    })
    
    if (error) throw new Error(error)
    
    suggestions.value = data
    toast.success('Content suggestions generated!')
  } catch (error) {
    console.error('Error generating suggestions:', error)
    toast.error('Failed to generate suggestions')
  } finally {
    loading.value = false
  }
}

// Load connections on mount
onMounted(async () => {
  await fetchConnections()
})
</script>