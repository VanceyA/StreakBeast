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
    
    // Delete the goal with admin privileges to bypass RLS
    const { error } = await adminClient
      .from('goals')
      .delete()
      .eq('id', goalId)
    
    if (error) {
      console.error('Server goal deletion error:', error)
      return {
        error: error.message,
        status: 500
      }
    }
    
    return {
      success: true,
      status: 200
    }
  } catch (err) {
    console.error('Server error deleting goal:', err)
    return {
      error: 'Internal server error',
      status: 500
    }
  }
})
