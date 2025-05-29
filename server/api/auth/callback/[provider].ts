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
    console.log(`Exchanging code for tokens with ${config.tokenUrl}`)
    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'authorization_code',
        code: code.toString(),
        redirect_uri: redirectUri
      })
    })
    
    // Check if the response is valid
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error(`Token response error (${tokenResponse.status}):`, errorText)
      return sendRedirect(event, `/dashboard?error=token_error&status=${tokenResponse.status}`)
    }
    
    // Try to parse the response as JSON
    let tokenData
    try {
      const responseText = await tokenResponse.text()
      console.log('Token response:', responseText.substring(0, 100) + '...')
      tokenData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Error parsing token response:', parseError)
      return sendRedirect(event, `/dashboard?error=invalid_token_response`)
    }
    
    if (tokenData.error) {
      console.error('Token error:', tokenData.error)
      return sendRedirect(event, `/dashboard?error=${tokenData.error}`)
    }
    
    // Get user info from the provider
    let userInfo
    try {
      let userInfoUrl
      let headers = {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
      
      // Handle provider-specific user info endpoints
      if (provider === 'youtube') {
        userInfoUrl = `${config.apiBase}/${config.userInfoEndpoint}?${config.userInfoParams}`
        console.log(`Fetching YouTube user info from ${userInfoUrl}`)
      } else {
        userInfoUrl = `${config.apiBase}/me`
        console.log(`Fetching user info from ${userInfoUrl}`)
      }
      
      const userInfoResponse = await fetch(userInfoUrl, { headers })
      
      if (!userInfoResponse.ok) {
        const errorText = await userInfoResponse.text()
        console.error(`User info error (${userInfoResponse.status}):`, errorText)
        return sendRedirect(event, `/dashboard?error=user_info_error&status=${userInfoResponse.status}`)
      }
      
      const responseData = await userInfoResponse.json()
      
      // Handle provider-specific response formats
      if (provider === 'youtube') {
        // YouTube returns a list of channels, we need the first one
        if (responseData.items && responseData.items.length > 0) {
          userInfo = {
            id: responseData.items[0].id,
            name: responseData.items[0].snippet.title,
            description: responseData.items[0].snippet.description,
            thumbnail: responseData.items[0].snippet.thumbnails?.default?.url,
            originalResponse: responseData
          }
        } else {
          throw new Error('No YouTube channel found')
        }
      } else {
        userInfo = responseData
      }
      
      console.log('User info:', JSON.stringify(userInfo).substring(0, 100) + '...')
    } catch (userInfoError) {
      console.error('Error fetching user info:', userInfoError)
      return sendRedirect(event, `/dashboard?error=user_info_fetch_error`)
    }
    
    // Get current user from Supabase
    const supabase = await serverSupabaseServiceRole(event)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return sendRedirect(event, '/login?error=not_authenticated')
    }
    
    // Extract provider user ID based on the provider
    let providerUserId = '';
    switch(provider) {
      case 'youtube':
        providerUserId = userInfo.id || '';
        break;
      case 'instagram':
        providerUserId = userInfo.id || userInfo.username || '';
        break;
      case 'tiktok':
        providerUserId = userInfo.open_id || userInfo.id || '';
        break;
      case 'twitter':
        providerUserId = userInfo.id_str || userInfo.id || '';
        break;
      case 'linkedin':
        providerUserId = userInfo.id || '';
        break;
      default:
        providerUserId = userInfo.id || '';
    }
    
    console.log(`Saving connection for user ${user.id} with provider ${provider} and provider_user_id ${providerUserId}`)
    
    // Store connection in database
    const connectionData = {
      user_id: user.id,
      provider,
      provider_user_id: providerUserId,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      expires_at: tokenData.expires_in 
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null,
      metadata: userInfo
    }
    
    console.log('Connection data:', JSON.stringify(connectionData).substring(0, 100) + '...')
    
    const { data, error } = await supabase
      .from('social_connections')
      .upsert(connectionData, {
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