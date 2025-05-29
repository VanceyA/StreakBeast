import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    // Get the user ID from query parameters
    const query = getQuery(event)
    const userId = query.userId as string
    
    if (!userId) {
      return {
        error: 'Missing user ID',
        status: 400
      }
    }
    
    // Get Supabase client with SERVICE ROLE (admin) privileges
    const adminClient = await serverSupabaseServiceRole(event)
    
    // Fetch all achievement definitions first
    const { data: achievements, error: achievementsError } = await adminClient
      .from('achievements')
      .select('*')
    
    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError)
      return {
        error: achievementsError.message,
        status: 500
      }
    }
    
    if (!achievements || achievements.length === 0) {
      return {
        data: [],
        status: 200
      }
    }
    
    // Fetch user achievements
    const { data: userAchievements, error: userAchievementsError } = await adminClient
      .from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', userId)
    
    if (userAchievementsError) {
      console.error('Error fetching user achievements:', userAchievementsError)
      return {
        error: userAchievementsError.message,
        status: 500
      }
    }
    
    // Combine the data to show which achievements are unlocked
    const combinedAchievements = achievements.map(achievement => {
      const userAchievement = userAchievements && userAchievements.length > 0 ?
        userAchievements.find(ua => ua.achievement_id === achievement.id) : null;
      
      return {
        ...achievement,
        unlocked: !!userAchievement,
        unlocked_at: userAchievement ? userAchievement.unlocked_at : null
      }
    })
    
    return {
      data: combinedAchievements,
      status: 200
    }
  } catch (error) {
    console.error('Error in achievements list endpoint:', error)
    return {
      error: 'Server error',
      status: 500
    }
  }
})
