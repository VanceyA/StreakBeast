export const useAchievements = () => {
  const achievements = ref([])
  const loading = ref(false)
  const newUnlocks = ref([])
  const { $toast: toast } = useNuxtApp()
  
  // Get the current user
  const user = useSupabaseUser()
  
  // Load all achievements for the current user
  const loadAchievements = async () => {
    if (!user.value) return
    
    loading.value = true
    
    try {
      console.log('Loading achievements for user:', user.value.id)
      const response = await $fetch(`/api/achievements/list?userId=${user.value.id}`)
      
      if (response.error) {
        console.error('API returned error:', response.error)
        throw new Error(response.error)
      }
      
      achievements.value = response.data || []
      console.log(`Loaded ${achievements.value.length} achievements`)
      return achievements.value
    } catch (error) {
      console.error('Error loading achievements:', error)
      toast.error('Failed to load achievements')
      return []
    } finally {
      loading.value = false
    }
  }
  
  // Check for new achievements that should be unlocked
  const checkAchievements = async (category) => {
    if (!user.value) return []
    
    try {
      console.log('Checking for new achievements for user:', user.value.id, category ? `(category: ${category})` : '')
      const response = await $fetch('/api/achievements/check', {
        method: 'POST',
        body: {
          userId: user.value.id,
          category: category || undefined
        }
      })
      
      if (response.error) {
        console.error('API returned error:', response.error)
        throw new Error(response.error)
      }
      
      const newAchievements = response.data || []
      console.log(`Found ${newAchievements.length} new achievements to unlock`)
      
      if (newAchievements.length > 0) {
        newUnlocks.value = newAchievements
        
        // Notify the user of new achievements
        newAchievements.forEach(achievement => {
          toast.success(`🏆 Achievement Unlocked: ${achievement.name}`)
        })
        
        // Refresh the achievements list
        await loadAchievements()
      }
      
      return newAchievements
    } catch (error) {
      console.error('Error checking achievements:', error)
      toast.error('Error checking achievements')
      return []
    }
  }
  
  // Manually unlock an achievement (for testing or special cases)
  const unlockAchievement = async (achievementId) => {
    if (!user.value) return null
    
    try {
      console.log('Manually unlocking achievement:', achievementId)
      const response = await $fetch('/api/achievements/unlock', {
        method: 'POST',
        body: {
          userId: user.value.id,
          achievementId
        }
      })
      
      if (response.error) {
        console.error('API returned error:', response.error)
        throw new Error(response.error)
      }
      
      toast.success(response.message || 'Achievement unlocked!')
      
      // Refresh the achievements list
      await loadAchievements()
      
      return response.data
    } catch (error) {
      console.error('Error unlocking achievement:', error)
      toast.error('Failed to unlock achievement')
      return null
    }
  }
  
  // Get achievement progress
  const getProgress = (achievementId) => {
    const achievement = achievements.value.find(a => a.id === achievementId)
    if (!achievement) return 0
    
    // For now, achievements are either unlocked (100%) or not (0%)
    return achievement.unlocked ? 100 : 0
  }
  
  return {
    achievements,
    loading,
    newUnlocks,
    loadAchievements,
    checkAchievements,
    unlockAchievement,
    getProgress
  }
}
