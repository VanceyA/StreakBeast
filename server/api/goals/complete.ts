import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { goalId } = body
    
    // Validate required fields
    if (!goalId) {
      return {
        error: 'Missing goal ID',
        status: 400
      }
    }
    
    // Get Supabase client with SERVICE ROLE (admin) privileges
    const adminClient = await serverSupabaseServiceRole(event)
    
    // First, get the current goal to check the streak
    const { data: goal, error: fetchError } = await adminClient
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .single()
    
    if (fetchError) {
      console.error('Server error fetching goal:', fetchError)
      return {
        error: fetchError.message,
        status: 500
      }
    }
    
    // Calculate new streak based on last completion date
    let newStreak = goal.streak
    const today = new Date()
    const lastCompleted = goal.last_completed ? new Date(goal.last_completed) : null
    
    // If already completed today, don't increment streak
    if (lastCompleted && lastCompleted.toDateString() === today.toDateString()) {
      return {
        success: true,
        message: 'Already completed today',
        data: goal
      }
    }
    
    // Increment streak if this is a new day
    newStreak += 1
    
    // Update the best streak if current streak exceeds it
    const bestStreak = Math.max(goal.bestStreak || 0, newStreak)
    
    // Update the goal
    const { data, error: updateError } = await adminClient
      .from('goals')
      .update({
        streak: newStreak,
        bestStreak: bestStreak,
        last_completed: today.toISOString(),
      })
      .eq('id', goalId)
      .select()
      .single()
    
    if (updateError) {
      console.error('Server error updating goal completion:', updateError)
      return {
        error: updateError.message,
        status: 500
      }
    }
    
    return {
      success: true,
      newStreak,
      bestStreak,
      data,
      status: 200
    }
  } catch (err) {
    console.error('Server error completing goal:', err)
    return {
      error: 'Internal server error',
      status: 500
    }
  }
})
