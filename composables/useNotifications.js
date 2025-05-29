export function useNotifications() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  
  // Send SMS notification (placeholder function)
  const sendSmsNotification = async (phone, message) => {
    console.log(`[SMS PLACEHOLDER] To: ${phone}, Message: ${message}`);
    
    // In a real application, you would integrate with Twilio or another SMS service
    // This is just a placeholder to show the concept
    
    return { success: true, message: 'SMS notification sent (simulated)' };
  };
  
  // Check for missed goals and send notifications
  const checkAndNotifyMissedGoals = async () => {
    if (!user.value) return;
    
    try {
      const { data: goals, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.value.id);
      
      if (error) throw error;
      
      // Get user profile to get phone number
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.value.id)
        .single();
      
      const today = new Date();
      const missedGoals = [];
      
      for (const goal of goals) {
        // Skip if no completion date (new goal)
        if (!goal.last_completed) continue;
        
        const lastCompleted = new Date(goal.last_completed);
        
        // Check based on frequency
        if (goal.frequency === 'Daily') {
          const daysSinceLastCompleted = Math.floor((today - lastCompleted) / (1000 * 60 * 60 * 24));
          
          if (daysSinceLastCompleted >= 1) {
            missedGoals.push(goal);
          }
        } else if (goal.frequency.startsWith('Weekly')) {
          const daysSinceLastCompleted = Math.floor((today - lastCompleted) / (1000 * 60 * 60 * 24));
          
          if (daysSinceLastCompleted >= 7) {
            missedGoals.push(goal);
          }
        }
      }
      
      // If we have missed goals and a phone number, send notification
      if (missedGoals.length > 0 && profile?.phone) {
        const message = `Hey! You've missed ${missedGoals.length} goal${missedGoals.length > 1 ? 's' : ''}. Don't break your streak, StreakBeast!`;
        await sendSmsNotification(profile.phone, message);
      }
      
      return missedGoals;
    } catch (error) {
      console.error('Error checking missed goals:', error);
      return [];
    }
  };
  
  // Record a notification in the database
  const recordNotification = async (type, message, goalId = null) => {
    if (!user.value) return { success: false };
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.value.id,
          type,
          message,
          goal_id: goalId,
          created_at: new Date().toISOString(),
          read: false
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return { success: true, notification: data };
    } catch (error) {
      console.error('Error recording notification:', error);
      return { success: false, error };
    }
  };
  
  // Get unread notifications
  const getUnreadNotifications = async () => {
    if (!user.value) return { notifications: [] };
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.value.id)
        .eq('read', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return { success: true, notifications: data };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, notifications: [] };
    }
  };
  
  // Mark notifications as read
  const markNotificationsAsRead = async (notificationIds) => {
    if (!user.value || !notificationIds.length) return { success: false };
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', notificationIds);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      return { success: false, error };
    }
  };
  
  return {
    sendSmsNotification,
    checkAndNotifyMissedGoals,
    recordNotification,
    getUnreadNotifications,
    markNotificationsAsRead
  };
}