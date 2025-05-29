import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = query.userId as string
    
    // Validate required fields
    if (!userId) {
      return {
        error: 'Missing user ID',
        status: 400
      }
    }
    
    // Get Supabase client with SERVICE ROLE (admin) privileges
    const adminClient = await serverSupabaseServiceRole(event)
    
    // Get all goals for the user
    const { data, error } = await adminClient
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Server error fetching goals:', error)
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
    console.error('Server error listing goals:', err)
    return {
      error: 'Internal server error',
      status: 500
    }
  }
})
