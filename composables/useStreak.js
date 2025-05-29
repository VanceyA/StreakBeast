export function useStreak() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const toast = inject('toast');
  
  // Check if a goal is completed today
  const isCompletedToday = (goal) => {
    if (!goal.last_completed) return false;
    
    const lastCompleted = new Date(goal.last_completed);
    const today = new Date();
    
    return lastCompleted.toDateString() === today.toDateString();
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
      
      const today = new Date();
      const missedGoals = [];
      
      for (const goal of goals) {
        if (goal.streak > 0) {
          const lastCompleted = new Date(goal.last_completed);
          
          // For daily goals, check if it's been more than a day
          if (goal.frequency === 'Daily') {
            const daysSinceLastCompleted = Math.floor((today - lastCompleted) / (1000 * 60 * 60 * 24));
            
            if (daysSinceLastCompleted > 1) {
              // Reset streak
              await supabase
                .from('goals')
                .update({ streak: 0 })
                .eq('id', goal.id);
              
              missedGoals.push(goal);
            }
          }
          
          // Add logic for weekly goals
          // This is simplified - would need more complex logic for different weekly patterns
          if (goal.frequency.startsWith('Weekly')) {
            const daysSinceLastCompleted = Math.floor((today - lastCompleted) / (1000 * 60 * 60 * 24));
            
            if (daysSinceLastCompleted > 7) {
              // Reset streak
              await supabase
                .from('goals')
                .update({ streak: 0 })
                .eq('id', goal.id);
              
              missedGoals.push(goal);
            }
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
    checkStreakMilestones
  };
}