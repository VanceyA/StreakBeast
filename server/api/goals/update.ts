import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { goalId, title, platform, frequency, target, targetUnit } = body
    
    // Validate required fields
    if (!goalId) {
      return {
        error: 'Missing goal ID',
        status: 400
      }
    }
    
    // Get Supabase client with SERVICE ROLE (admin) privileges
    const adminClient = await serverSupabaseServiceRole(event)
    
    // Update fields that are provided
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    if (title !== undefined) updateData.title = title
    if (platform !== undefined) updateData.platform = platform
    if (frequency !== undefined) updateData.frequency = frequency
    if (target !== undefined) updateData.target = target
    if (targetUnit !== undefined) updateData.targetUnit = targetUnit
    
    // Update the goal with admin privileges to bypass RLS
    const { data, error } = await adminClient
      .from('goals')
      .update(updateData)
      .eq('id', goalId)
      .select()
      .single()
    
    if (error) {
      console.error('Server goal update error:', error)
      return {
        error: error.message,
        status: 500
      }
    }
    
    return {
      data,
      status: 200
    }
  } catch (err) {
    console.error('Server error updating goal:', err)
    return {
      error: 'Internal server error',
      status: 500
    }
  }
})
