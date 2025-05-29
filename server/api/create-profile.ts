import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, email, createdAt } = body
    
    // Validate required fields
    if (!userId || !email) {
      return {
        error: 'Missing required fields',
        status: 400
      }
    }
    
    // Get Supabase client with SERVICE ROLE (admin) privileges
    const adminClient = await serverSupabaseServiceRole(event)
    
    // Create the profile with admin privileges to bypass RLS
    const { data, error } = await adminClient
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        created_at: createdAt || new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Server profile creation error:', error)
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
    console.error('Server error creating profile:', err)
    return {
      error: 'Internal server error',
      status: 500
    }
  }
})
