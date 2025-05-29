import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, title, platform, frequency, target, targetUnit } = body
    
    // Validate required fields
    if (!userId || !title || !platform || !frequency) {
      return {
        error: 'Missing required fields',
        status: 400
      }
    }
    
    // Get Supabase client with SERVICE ROLE (admin) privileges
    const adminClient = await serverSupabaseServiceRole(event)
    
    // Create the goal with admin privileges to bypass RLS
    const { data, error } = await adminClient
      .from('goals')
      .insert({
        user_id: userId,
        title,
        platform,
        frequency,
        target: target || 1,
        targetUnit: targetUnit || 'posts',
        streak: 0,
        bestStreak: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Server goal creation error:', error)
      return {
        error: error.message,
        status: 500
      }
    }
    
    return {
      data,
      status: 201
    }
  } catch (err) {
    console.error('Server error creating goal:', err)
    return {
      error: 'Internal server error',
      status: 500
    }
  }
})
