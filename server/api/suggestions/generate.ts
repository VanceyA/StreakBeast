// server/api/suggestions/generate.ts
import { serverSupabaseServiceRole } from '#supabase/server'
import OpenAI from 'openai'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, platform } = body
    
    if (!userId) {
      return {
        error: 'Missing user ID',
        status: 400
      }
    }
    
    // Get Supabase client with SERVICE ROLE
    const adminClient = await serverSupabaseServiceRole(event)
    
    // Get user's social connection for the platform
    const { data: connection, error: connectionError } = await adminClient
      .from('social_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', platform)
      .single()
    
    if (connectionError && connectionError.code !== 'PGRST116') {
      console.error('Error fetching connection:', connectionError)
      return {
        error: connectionError.message,
        status: 500
      }
    }
    
    // Fetch recent content performance data
    let contentData = {}
    if (connection) {
      // Fetch platform-specific data
      const { data: metrics, error: metricsError } = await adminClient
        .rpc('get_platform_metrics', {
          p_user_id: userId,
          p_platform: platform
        })
      
      if (!metricsError) {
        contentData = metrics
      }
    }
    
    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    
    // Fetch trending topics for the platform
    const trendingTopics = await fetchTrendingTopics(platform)
    
    // Generate suggestions using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert content strategist for ${platform}. 
                   Generate content suggestions based on the user's performance data and current trends. 
                   Your suggestions should be specific, actionable, and designed to maximize engagement.
                   Format your response as JSON with the following structure:
                   {
                     "topicIdeas": [{"title": "Topic title", "description": "Brief description", "estimatedEngagement": "high/medium/low"}],
                     "formatSuggestions": [{"format": "Format name", "description": "Why this format works", "example": "Brief example"}],
                     "titleSuggestions": ["Title 1", "Title 2", "Title 3"],
                     "hashtagSuggestions": ["#hashtag1", "#hashtag2", "#hashtag3"],
                     "bestPostingTimes": [{"day": "Monday", "time": "8:00 AM", "reason": "Reason"}]
                   }`
        },
        {
          role: "user",
          content: `Generate content suggestions for a creator on ${platform}.
                   Current trends: ${JSON.stringify(trendingTopics)}
                   User's content performance: ${JSON.stringify(contentData)}
                   Make the suggestions feel badass and motivational, like they're going to crush it with this content.`
        }
      ],
      response_format: { type: "json_object" }
    })
    
    const suggestions = JSON.parse(completion.choices[0].message.content)
    
    // Store suggestions in database for future reference
    await adminClient
      .from('content_suggestions')
      .insert({
        user_id: userId,
        platform,
        suggestions,
        created_at: new Date().toISOString()
      })
    
    return {
      data: suggestions,
      status: 200
    }
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return {
      error: 'Failed to generate suggestions',
      status: 500
    }
  }
})

// Helper function to fetch trending topics
async function fetchTrendingTopics(platform) {
  // This would be implemented with platform-specific API calls
  // For now, return mock data
  const trendingByPlatform = {
    youtube: ["AI tools for creators", "Day in the life", "Creator economy"],
    instagram: ["Aesthetic minimalism", "Behind the scenes", "Quick tutorials"],
    tiktok: ["Viral sounds", "POV storytelling", "Quick hacks"],
    twitter: ["Industry news", "Hot takes", "Thread storytelling"],
    linkedin: ["Career milestones", "Industry insights", "Professional development"]
  }
  
  return trendingByPlatform[platform] || []
}