// server/api/social/[provider]/metrics.ts
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    // Get the provider from the URL
    const provider = event.context.params.provider
    
    // Get the Supabase client
    const supabase = await serverSupabaseClient(event)
    const user = await supabase.auth.getUser()
    
    if (!user.data.user) {
      return createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }
    
    // Check if the user has a connection to this provider
    const { data: connection, error: connectionError } = await supabase
      .from('social_connections')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('provider', provider)
      .single()
    
    if (connectionError || !connection) {
      return createError({
        statusCode: 404,
        message: `No ${provider} connection found`
      })
    }
    
    // For now, return mock data based on the provider
    // In a real application, you would use the access_token to fetch real metrics from the provider's API
    return {
      followers: generateMockTimeSeriesData(provider === 'youtube' ? 'subscribers' : 'followers'),
      engagement: generateMockTimeSeriesData('engagement'),
      views: generateMockTimeSeriesData('views'),
      likes: generateMockTimeSeriesData('likes'),
      comments: generateMockTimeSeriesData('comments'),
      shares: generateMockTimeSeriesData('shares'),
      growth_rate: generateMockGrowthRate(),
      post_frequency: generateMockPostFrequency(),
      best_times: generateMockBestTimes(),
      demographics: generateMockDemographics(provider)
    }
  } catch (error) {
    console.error(`Error fetching ${event.context.params.provider} metrics:`, error)
    return createError({
      statusCode: 500,
      message: `Failed to fetch ${event.context.params.provider} metrics`
    })
  }
})

// Helper function to generate mock time series data
function generateMockTimeSeriesData(metric) {
  const data = []
  const now = new Date()
  const baseValue = getBaseValueForMetric(metric)
  
  // Generate 30 days of data
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    // Add some randomness to the data
    const randomFactor = 0.95 + Math.random() * 0.1 // Between 0.95 and 1.05
    const growthFactor = 1 + (0.01 * (30 - i) / 30) // Slight growth over time
    
    const value = Math.floor(baseValue * randomFactor * growthFactor)
    
    data.push({
      date: date.toISOString().split('T')[0],
      value
    })
  }
  
  return data
}

// Get a base value for different metrics
function getBaseValueForMetric(metric) {
  switch (metric) {
    case 'subscribers':
    case 'followers':
      return 5000 + Math.floor(Math.random() * 15000)
    case 'views':
      return 10000 + Math.floor(Math.random() * 40000)
    case 'likes':
      return 500 + Math.floor(Math.random() * 1500)
    case 'comments':
      return 50 + Math.floor(Math.random() * 150)
    case 'shares':
      return 20 + Math.floor(Math.random() * 80)
    case 'engagement':
      return 300 + Math.floor(Math.random() * 700)
    default:
      return 100 + Math.floor(Math.random() * 900)
  }
}

// Generate mock growth rate data
function generateMockGrowthRate() {
  return {
    daily: (Math.random() * 0.5).toFixed(2),
    weekly: (Math.random() * 2 + 0.5).toFixed(2),
    monthly: (Math.random() * 5 + 2).toFixed(2),
    yearly: (Math.random() * 20 + 10).toFixed(2)
  }
}

// Generate mock post frequency data
function generateMockPostFrequency() {
  return {
    daily: (Math.random() * 2).toFixed(1),
    weekly: Math.floor(Math.random() * 10 + 5),
    monthly: Math.floor(Math.random() * 30 + 15)
  }
}

// Generate mock best times data
function generateMockBestTimes() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const bestTimes = []
  
  days.forEach(day => {
    // Generate 1-3 best times per day
    const timesCount = Math.floor(Math.random() * 3) + 1
    
    for (let i = 0; i < timesCount; i++) {
      const hour = Math.floor(Math.random() * 24)
      const minute = Math.floor(Math.random() * 4) * 15 // 0, 15, 30, or 45
      
      bestTimes.push({
        day,
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        score: Math.floor(Math.random() * 50 + 50) // Score between 50-100
      })
    }
  })
  
  // Sort by score descending
  return bestTimes.sort((a, b) => b.score - a.score)
}

// Generate mock demographics data
function generateMockDemographics(provider) {
  return {
    age: [
      { group: '13-17', percentage: Math.floor(Math.random() * 10) },
      { group: '18-24', percentage: Math.floor(Math.random() * 20 + 15) },
      { group: '25-34', percentage: Math.floor(Math.random() * 20 + 25) },
      { group: '35-44', percentage: Math.floor(Math.random() * 15 + 15) },
      { group: '45-54', percentage: Math.floor(Math.random() * 10 + 5) },
      { group: '55+', percentage: Math.floor(Math.random() * 10) }
    ],
    gender: [
      { group: 'Male', percentage: Math.floor(Math.random() * 30 + 35) },
      { group: 'Female', percentage: Math.floor(Math.random() * 30 + 35) },
      { group: 'Other', percentage: Math.floor(Math.random() * 10) }
    ],
    location: [
      { country: 'United States', percentage: Math.floor(Math.random() * 30 + 40) },
      { country: 'United Kingdom', percentage: Math.floor(Math.random() * 10 + 5) },
      { country: 'Canada', percentage: Math.floor(Math.random() * 10 + 5) },
      { country: 'Australia', percentage: Math.floor(Math.random() * 5 + 3) },
      { country: 'Germany', percentage: Math.floor(Math.random() * 5 + 3) },
      { country: 'France', percentage: Math.floor(Math.random() * 5 + 2) },
      { country: 'Other', percentage: Math.floor(Math.random() * 20 + 10) }
    ]
  }
}
