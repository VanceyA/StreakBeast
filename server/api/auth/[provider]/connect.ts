// server/api/auth/[provider]/connect.ts
import { serverSupabaseServiceRole } from '#supabase/server'
import oauthProviders from '~/server/config/oauth-providers'

export default defineEventHandler(async (event) => {
  const provider = event.context.params.provider
  
  if (!oauthProviders[provider]) {
    throw createError({
      statusCode: 400,
      message: `Unsupported provider: ${provider}`
    })
  }
  
  const config = oauthProviders[provider]
  const state = Math.random().toString(36).substring(2, 15)
  
  // Store state in cookie for CSRF protection
  setCookie(event, `oauth_state_${provider}`, state, {
    maxAge: 60 * 10, // 10 minutes
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  })
  
  // Get the request host and protocol
  const host = getRequestHost(event) || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  
  // Construct the redirect URI using the current host
  const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || `${protocol}://${host}`
  const redirectUri = `${siteUrl}/api/auth/callback/${provider}`
  
  console.log(`OAuth connect for ${provider} with redirect URI: ${redirectUri}`)
  
  // Construct the authorization URL
  const authUrl = new URL(config.authUrl)
  authUrl.searchParams.append('client_id', config.clientId)
  authUrl.searchParams.append('redirect_uri', redirectUri)
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('scope', config.scope)
  authUrl.searchParams.append('state', state)
  
  return sendRedirect(event, authUrl.toString())
})