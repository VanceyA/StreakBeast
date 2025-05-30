// server/api/social/connections/status.ts
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    // Get Supabase client with SERVICE ROLE (admin) privileges
    const adminClient = await serverSupabaseServiceRole(event)
    
    // Get the current user
    const { data: { user } } = await adminClient.auth.getUser()
    
    if (!user) {
      return {
        error: 'Not authenticated',
        status: 401
      }
    }
    
    // Fetch all social connections for the user
    const { data: connections, error: connectionsError } = await adminClient
      .from('social_connections')
      .select('*')
      .eq('user_id', user.id)
    
    if (connectionsError) {
      console.error('Error fetching social connections:', connectionsError)
      return {
        error: connectionsError.message,
        status: 500
      }
    }
    
    // Check if the table exists - handle the case where the function might not exist yet
    let tableExists = true
    try {
      const { data, error } = await adminClient
        .rpc('check_table_exists', { table_name: 'social_connections' })
      
      if (error) {
        console.error('Error checking if table exists:', error)
        // If the function doesn't exist, we'll just assume the table exists
        tableExists = true
      } else {
        tableExists = !!data
      }
    } catch (e) {
      console.error('Exception checking if table exists:', e)
      // If there's an exception, we'll just assume the table exists
      tableExists = true
    }
    
    return {
      status: 200,
      connections: connections || [],
      connectionCount: (connections || []).length,
      connectedProviders: (connections || []).map(c => c.provider),
      tableExists: tableExists || false,
      user: {
        id: user.id,
        email: user.email
      },
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error in connections status endpoint:', error)
    return {
      error: error.message,
      status: 500
    }
  }
})
