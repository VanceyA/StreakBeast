<template>
  <div class="min-h-screen bg-gray-950 text-gray-100">
    <NavBar />
    
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Achievements</h1>
      
      <div class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-6">Unlocked Achievements</h2>
          
          <AchievementsSection 
            :achievements="achievements" 
            :loading="loading"
            :showViewAll="false"
            :showUnlockedOnly="true"
            emptyMessage="You haven't unlocked any achievements yet. Keep going!"
          />
        </div>
      </div>
      
      <div class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-6">All Achievements</h2>
          
          <AchievementsSection 
            :achievements="achievements" 
            :loading="loading"
            :showViewAll="false"
            emptyMessage="No achievements available yet."
          >
            <template #empty-action>
              <button @click="refreshAchievements" class="btn-primary mt-4">
                Check for Achievements
              </button>
            </template>
          </AchievementsSection>
        </div>
      </div>
      
      <div class="text-center mt-12">
        <button @click="refreshAchievements" class="btn-primary">
          Refresh Achievements
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const { achievements, loading, loadAchievements, checkAchievements } = useAchievements()
const user = useSupabaseUser()
const { $toast: toast } = useNuxtApp()

// Function to refresh achievements
const refreshAchievements = async () => {
  try {
    // First check for new achievements
    const newAchievements = await checkAchievements()
    
    // Then reload all achievements to get the updated list
    await loadAchievements()
    
    if (newAchievements && newAchievements.length > 0) {
      toast.success(`Unlocked ${newAchievements.length} new achievement${newAchievements.length > 1 ? 's' : ''}!`)
    } else {
      toast.info('No new achievements unlocked yet. Keep going!')
    }
  } catch (error) {
    console.error('Error refreshing achievements:', error)
    toast.error('Failed to refresh achievements')
  }
}

// Load achievements when the component mounts
onMounted(async () => {
  if (user.value) {
    await loadAchievements()
  }
})

// Watch for user changes and reload achievements
watch(user, async (newUser) => {
  if (newUser) {
    await loadAchievements()
  }
})

// Route guard to ensure authenticated access
definePageMeta({
  middleware: 'auth'
})
</script>
