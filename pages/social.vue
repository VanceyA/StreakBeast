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
        <!-- Social Dashboard -->
        <SocialDashboard />
        
        <!-- Achievements Section -->
        <div class="mt-8">
          <h2 class="text-2xl font-bold mb-4">Social Media Achievements</h2>
          <AchievementsSection category="social" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { checkAchievements } = useAchievements()

// Track loading state
const loading = ref(false)

// Computed property to check if user is authenticated
const isAuthenticated = computed(() => !!user.value)

// Login function
const login = () => {
  router.push('/login')
}

// Check for achievements when the page loads
onMounted(async () => {
  loading.value = true
  
  try {
    // Wait a moment to ensure auth state is properly loaded
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (user.value) {
      // Check for social media related achievements
      await checkAchievements('social')
    }
  } catch (error) {
    console.error('Error in social page:', error)
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
