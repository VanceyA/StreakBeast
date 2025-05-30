export function useStreak() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const toast = inject('toast');
  const { $dayjs } = useNuxtApp();
  
  // Check if a goal is completed today
  const isCompletedToday = (goal) => {
    if (!goal.last_completed) return false;
    
    const lastCompleted = new Date(goal.last_completed);
    const today = new Date();
    
    return lastCompleted.toDateString() === today.toDateString();
  };
  
  // Calculate time remaining until streak reset
  const getTimeUntilReset = (goal) => {
    if (!goal.last_completed) {
      // Default values if no completion yet
      return { hours: 24, minutes: 0, expired: false, totalHours: 24 };
    }
    
    const lastCompleted = new Date(goal.last_completed);
    const now = new Date();
    
    // Determine reset interval based on goal frequency
    let hoursToAdd = 24; // Default daily
    
    if (goal.frequency.startsWith('Weekly')) {
      hoursToAdd = 7 * 24; // 7 days
    } else if (goal.frequency.startsWith('Monthly')) {
      hoursToAdd = 30 * 24; // Approximately 30 days
    }
    
    // Add appropriate hours to last completed time
    const resetTime = new Date(lastCompleted.getTime() + hoursToAdd * 60 * 60 * 1000);
    
    // Calculate difference in milliseconds
    const diffMs = resetTime - now;
    
    // If negative, streak should be reset
    if (diffMs < 0) return { hours: 0, minutes: 0, expired: true, totalHours: hoursToAdd };
    
    // Calculate hours and minutes
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes, expired: false, totalHours: hoursToAdd };
  };
  
  // Mark a goal as completed
  const completeGoal = async (goalId) => {
    if (!user.value) return { success: false, error: 'User not authenticated' };
    
    try {
      // Get the current goal to check the streak
      const { data: goal, error: fetchError } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Calculate new streak based on last completion date
      let newStreak = goal.streak;
      const today = new Date();
      const lastCompleted = goal.last_completed ? new Date(goal.last_completed) : null;
      
      // If already completed today, don't increment streak
      if (lastCompleted && lastCompleted.toDateString() === today.toDateString()) {
        return { success: true, message: 'Already completed today' };
      }
      
      // Increment streak if this is a new day
      newStreak += 1;
      
      // Update the best streak if current streak exceeds it
      const bestStreak = Math.max(goal.bestStreak || 0, newStreak);
      
      // Update the goal
      const { error: updateError } = await supabase
        .from('goals')
        .update({
          streak: newStreak,
          bestStreak: bestStreak,
          last_completed: today.toISOString(),
        })
        .eq('id', goalId);
      
      if (updateError) throw updateError;
      
      // Check for streak milestones
      checkStreakMilestones(newStreak);
      
      return { 
        success: true, 
        newStreak, 
        bestStreak,
        message: 'Goal completed successfully' 
      };
    } catch (error) {
      console.error('Error completing goal:', error);
      return { success: false, error };
    }
  };
  
  // Check if any goals have missed their streak and reset them
  const checkMissedStreaks = async () => {
    if (!user.value) return;
    
    try {
      const { data: goals, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.value.id);
      
      if (error) throw error;
      
      const now = new Date();
      const missedGoals = [];
      
      for (const goal of goals) {
        if (goal.streak > 0 && goal.last_completed) {
          const lastCompleted = new Date(goal.last_completed);
          
          // Check time since last completion
          const hoursSinceLastCompleted = (now - lastCompleted) / (1000 * 60 * 60);
          let resetThreshold = 24; // Default for daily goals
          
          // Determine reset threshold based on goal frequency
          if (goal.frequency.startsWith('Weekly')) {
            resetThreshold = 24 * 7; // 7 days for weekly goals
          } else if (goal.frequency.startsWith('Monthly')) {
            resetThreshold = 24 * 30; // ~30 days for monthly goals
          }
          
          // Check if time threshold has been exceeded
          if (hoursSinceLastCompleted >= resetThreshold) {
            // Reset streak
            await supabase
              .from('goals')
              .update({ streak: 0 })
              .eq('id', goal.id);
            
            missedGoals.push(goal);
          }
        }
      }
      
      return missedGoals;
    } catch (error) {
      console.error('Error checking missed streaks:', error);
      return [];
    }
  };
  
  // Show notifications for streak milestones
  const checkStreakMilestones = (streak) => {
    // Special messages for milestone streaks
    if (streak === 7) {
      toast.info('🔥 7-Day Streak! You\'re building momentum!', {
        autoClose: 5000,
      });
    } else if (streak === 30) {
      toast.info('🔥🔥🔥 30-Day BEAST MODE! You\'re unstoppable!', {
        autoClose: 5000,
      });
    } else if (streak === 100) {
      toast.info('🏆 100-DAY LEGENDARY STREAK! You\'re in the elite now!', {
        autoClose: 5000,
      });
    } else if (streak % 50 === 0 && streak > 0) {
      toast.info(`🔥 ${streak}-Day Streak! Absolute domination!`, {
        autoClose: 5000,
      });
    }
  };
  
  return {
    isCompletedToday,
    completeGoal,
    checkMissedStreaks,
    checkStreakMilestones,
    getTimeUntilReset
  };
}