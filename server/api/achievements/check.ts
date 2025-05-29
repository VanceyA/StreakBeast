import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, category } = body
    
    if (!userId) {
      return {
        error: 'Missing user ID',
        status: 400
      }
    }
    
    // Get Supabase client with SERVICE ROLE (admin) privileges
    const adminClient = await serverSupabaseServiceRole(event)
    
    // Initialize stats object
    let stats = {}
    
    // Check if we're checking social achievements or regular achievements
    if (category === 'social') {
      // Fetch social connections
      const { data: connections, error: connectionsError } = await adminClient
        .from('social_connections')
        .select('*')
        .eq('user_id', userId)
      
      if (connectionsError) {
        console.error('Error fetching social connections:', connectionsError)
        return {
          error: connectionsError.message,
          status: 500
        }
      }
      
      // Fetch content suggestions
      const { data: suggestions, error: suggestionsError } = await adminClient
        .from('content_suggestions')
        .select('*')
        .eq('user_id', userId)
      
      if (suggestionsError) {
        console.error('Error fetching content suggestions:', suggestionsError)
      }
      
      // Calculate social stats
      const userConnections = connections || []
      const userSuggestions = suggestions || []
      
      // Calculate total followers across all platforms
      let totalFollowers = 0
      let highestEngagementRate = 0
      
      // Fetch metrics for each connection
      for (const connection of userConnections) {
        const { data: metrics, error: metricsError } = await adminClient
          .from('social_metrics')
          .select('*')
          .eq('connection_id', connection.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        if (!metricsError && metrics) {
          totalFollowers += metrics.followers || 0
          
          // Calculate engagement rate if we have both engagement and followers
          if (metrics.engagement && metrics.followers) {
            const engagementRate = (metrics.engagement / metrics.followers) * 100
            highestEngagementRate = Math.max(highestEngagementRate, engagementRate)
          }
        }
      }
      
      stats = {
        platformCount: userConnections.length,
        suggestionCount: userSuggestions.length,
        followerCount: totalFollowers,
        engagementRate: highestEngagementRate
      }
      
      console.log('User social stats for achievements:', stats)
    } else {
      // Fetch user goals for regular achievements
      const { data: goals, error: goalsError } = await adminClient
        .from('goals')
        .select('*')
        .eq('user_id', userId)
      
      if (goalsError) {
        console.error('Error fetching goals:', goalsError)
        return {
          error: goalsError.message,
          status: 500
        }
      }
      
      // Default to empty array if no goals found
      const userGoals = goals || []
      
      // Calculate regular stats
      stats = {
        totalGoals: userGoals.length,
        completedGoals: userGoals.filter(goal => goal.completed).length,
        longestStreak: userGoals.reduce((max, goal) => Math.max(max, goal.bestStreak || 0), 0),
        totalPlatforms: new Set(userGoals.map(goal => goal.platform).filter(Boolean)).size
      }
      
      console.log('User goal stats for achievements:', stats)
    }
    
    // Fetch already unlocked achievements
    const { data: unlockedAchievements, error: unlockedError } = await adminClient
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId)
    
    if (unlockedError) {
      console.error('Error fetching unlocked achievements:', unlockedError)
      return {
        error: unlockedError.message,
        status: 500
      }
    }
    
    // Get array of unlocked achievement IDs, defaulting to empty array
    const unlockedIds = (unlockedAchievements || []).map(a => a.achievement_id)
    
    // Check if the category column exists in the achievements table
    const { data: columnInfo, error: columnError } = await adminClient
      .rpc('check_column_exists', { 
        table_name: 'achievements',
        column_name: 'category'
      })
    
    // If there's an error or the column doesn't exist, we'll need to handle it
    const categoryExists = columnInfo === true
    console.log('Category column exists:', categoryExists)
    
    // Fetch all achievements that haven't been unlocked yet
    let achievementsQuery = adminClient.from('achievements')
    
    // Only select columns that exist
    achievementsQuery = achievementsQuery.select(
      categoryExists 
        ? '*' 
        : 'id, name, description, icon, trigger_type, trigger_value, created_at'
    )
    
    // Filter by category if provided and if the column exists
    if (category && categoryExists) {
      achievementsQuery = achievementsQuery.eq('category', category)
    }
    
    // Only filter by unlocked IDs if there are any
    if (unlockedIds.length > 0) {
      achievementsQuery = achievementsQuery.not('id', 'in', `(${unlockedIds.join(',')})`)
    }
    
    const { data: achievements, error: achievementsError } = await achievementsQuery
    
    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError)
      return {
        error: achievementsError.message,
        status: 500
      }
    }
    
    // Default to empty array if no achievements found
    const availableAchievements = achievements || []
    console.log(`Checking ${availableAchievements.length} achievements for unlocking`)
    
    // Check which achievements should be unlocked
    const achievementsToUnlock = []
    
    for (const achievement of availableAchievements) {
      let shouldUnlock = false
      
      switch (achievement.trigger_type) {
        // Regular achievement triggers
        case 'goal_count':
          shouldUnlock = stats.totalGoals >= achievement.trigger_value
          break
        case 'streak_length':
          shouldUnlock = stats.longestStreak >= achievement.trigger_value
          break
        case 'completed_count':
          shouldUnlock = stats.completedGoals >= achievement.trigger_value
          break
        case 'platform_count':
          if (category === 'social') {
            shouldUnlock = stats.platformCount >= achievement.trigger_value
          } else {
            shouldUnlock = stats.totalPlatforms >= achievement.trigger_value
          }
          break
          
        // Social achievement triggers
        case 'suggestion_count':
          shouldUnlock = stats.suggestionCount >= achievement.trigger_value
          break
        case 'follower_count':
          shouldUnlock = stats.followerCount >= achievement.trigger_value
          break
        case 'engagement_rate':
          shouldUnlock = stats.engagementRate >= achievement.trigger_value
          break
        default:
          break
      }
      
      console.log(`Achievement ${achievement.name}: should unlock = ${shouldUnlock}`)
      
      if (shouldUnlock) {
        try {
          // Unlock the achievement
          const { data, error } = await adminClient
            .from('user_achievements')
            .insert({
              user_id: userId,
              achievement_id: achievement.id,
              unlocked_at: new Date().toISOString()
            })
          
          if (error) {
            console.error(`Error unlocking achievement ${achievement.id}:`, error)
          } else {
            achievementsToUnlock.push({
              ...achievement,
              unlocked: true,
              unlocked_at: new Date().toISOString()
            })
            console.log(`Unlocked achievement: ${achievement.name}`)
          }
        } catch (unlockError) {
          console.error(`Exception unlocking achievement ${achievement.id}:`, unlockError)
        }
      }
    }
    
    return {
      data: achievementsToUnlock,
      status: 200
    }
  } catch (error) {
    console.error('Error in check achievements endpoint:', error)
    return {
      error: 'Server error',
      status: 500
    }
  }
})
