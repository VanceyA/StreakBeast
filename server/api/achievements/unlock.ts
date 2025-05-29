import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, achievementId } = body
    
    // Validate required fields
    if (!userId || !achievementId) {
      return {
        error: 'Missing required fields',
        status: 400
      }
    }
    
    // Get Supabase client with SERVICE ROLE (admin) privileges
    const adminClient = await serverSupabaseServiceRole(event)
    
    // Check if achievement already unlocked
    const { data: existingAchievement, error: checkError } = await adminClient
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
      console.error('Error checking existing achievement:', checkError)
      return {
        error: checkError.message,
        status: 500
      }
    }
    
    // If achievement already unlocked, return it
    if (existingAchievement) {
      return {
        data: existingAchievement,
        status: 200,
        message: 'Achievement already unlocked'
      }
    }
    
    // Unlock the achievement
    const { data, error } = await adminClient
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error unlocking achievement:', error)
      return {
        error: error.message,
        status: 500
      }
    }
    
    // Get achievement details
    const { data: achievement, error: achievementError } = await adminClient
      .from('achievements')
      .select('*')
      .eq('id', achievementId)
      .single()
    
    if (achievementError) {
      console.error('Error fetching achievement details:', achievementError)
      return {
        data,
        status: 200,
        message: 'Achievement unlocked, but details not available'
      }
    }
    
    return {
      data: {
        ...data,
        achievement
      },
      status: 200,
      message: 'Achievement unlocked!'
    }
  } catch (error) {
    console.error('Error in unlock achievement endpoint:', error)
    return {
      error: 'Server error',
      status: 500
    }
  }
})
