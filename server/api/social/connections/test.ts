// server/api/social/connections/test.ts
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
    
    // Check if the social_connections table exists
    const { data: tableExists, error: tableError } = await adminClient.rpc(
      'check_table_exists',
      { table_name: 'social_connections' }
    )
    
    // If the table doesn't exist, create it
    if (!tableExists || tableError) {
      console.log('Creating social_connections table...')
      
      // Create the table
      const createTableResult = await adminClient.rpc('create_social_connections_table')
      console.log('Create table result:', createTableResult)
    }
    
    // Try to insert a test connection
    const testConnection = {
      user_id: user.id,
      provider: 'test',
      provider_user_id: 'test_user_id',
      access_token: 'test_token',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data: insertData, error: insertError } = await adminClient
      .from('social_connections')
      .insert(testConnection)
    
    // Return the results
    return {
      status: 200,
      user: {
        id: user.id,
        email: user.email
      },
      tableExists: tableExists,
      tableError: tableError ? tableError.message : null,
      insertData: insertData,
      insertError: insertError ? insertError.message : null,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error in test endpoint:', error)
    return {
      error: error.message,
      status: 500
    }
  }
})
