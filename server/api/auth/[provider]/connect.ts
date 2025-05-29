// server/api/auth/[provider]/connect.ts
import { serverSupabaseServiceRole } from '#supabase/server'
import oauthProviders from '~/server/config/oauth-providers'

export default defineEventHandler(async (event) => {
  const provider = event.context.params.provider
  
  if (!oauthProviders[provider]) {
    return {
      error: 'Invalid provider',
      status: 400
    }
  }
  
  const config = oauthProviders[provider]
  const redirectUri = `${process.env.APP_URL}/api/auth/callback/${provider}`
  const state = crypto.randomUUID()
  
  // Store state in session for validation
  setCookie(event, `oauth_state_${provider}`, state, {
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    path: '/'
  })
  
  // Build authorization URL
  const authUrl = new URL(config.authUrl)
  authUrl.searchParams.append('client_id', config.clientId)
  authUrl.searchParams.append('redirect_uri', redirectUri)
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('scope', config.scope)
  authUrl.searchParams.append('state', state)
  
  return sendRedirect(event, authUrl.toString())
})