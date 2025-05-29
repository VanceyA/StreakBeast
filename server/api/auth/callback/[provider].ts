// server/api/auth/callback/[provider].ts
import { serverSupabaseServiceRole } from '#supabase/server'
import oauthProviders from '~/server/config/oauth-providers'

export default defineEventHandler(async (event) => {
  const provider = event.context.params.provider
  const query = getQuery(event)
  const { code, state } = query
  
  // Validate state to prevent CSRF
  const savedState = getCookie(event, `oauth_state_${provider}`)
  if (!savedState || savedState !== state) {
    return sendRedirect(event, '/dashboard?error=invalid_state')
  }
  
  // Clear state cookie
  setCookie(event, `oauth_state_${provider}`, '', {
    maxAge: -1,
    path: '/'
  })
  
  try {
    const config = oauthProviders[provider]
    
    // Get the request host and protocol
    const host = getRequestHost(event) || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    
    // Construct the redirect URI using the current host
    const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || `${protocol}://${host}`
    const redirectUri = `${siteUrl}/api/auth/callback/${provider}`
    
    console.log(`OAuth callback for ${provider} with redirect URI: ${redirectUri}`)
    
    // Exchange code for tokens
    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    })
    
    const tokenData = await tokenResponse.json()
    
    if (tokenData.error) {
      console.error('Token error:', tokenData.error)
      return sendRedirect(event, `/dashboard?error=${tokenData.error}`)
    }
    
    // Get user info from the provider
    const userInfoResponse = await fetch(`${config.apiBase}/me`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    })
    
    const userInfo = await userInfoResponse.json()
    
    // Get current user from Supabase
    const supabase = await serverSupabaseServiceRole(event)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return sendRedirect(event, '/login?error=not_authenticated')
    }
    
    // Store connection in database
    const { data, error } = await supabase
      .from('social_connections')
      .upsert({
        user_id: user.id,
        provider,
        provider_user_id: userInfo.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null,
        metadata: userInfo
      }, {
        onConflict: 'user_id, provider'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return sendRedirect(event, `/dashboard?error=database_error`)
    }
    
    return sendRedirect(event, `/dashboard?connected=${provider}`)
  } catch (error) {
    console.error('OAuth callback error:', error)
    return sendRedirect(event, `/dashboard?error=server_error`)
  }
})