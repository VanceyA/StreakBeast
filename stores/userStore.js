import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null,
    goals: [],
    loading: false,
    notifications: []
  }),
  
  getters: {
    hasActiveGoals: (state) => state.goals.length > 0,
    activeStreaks: (state) => state.goals.filter(goal => goal.streak > 0).length,
    bestStreak: (state) => {
      if (state.goals.length === 0) return 0;
      return Math.max(...state.goals.map(goal => goal.bestStreak));
    }
  },
  
  actions: {
    async fetchUserProfile() {
      const client = useSupabaseClient();
      const user = useSupabaseUser();
      
      if (!user.value) return;
      
      this.loading = true;
      
      try {
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .eq('id', user.value.id)
          .single();
        
        if (error) throw error;
        
        this.profile = data;
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchUserGoals() {
      const client = useSupabaseClient();
      const user = useSupabaseUser();
      
      if (!user.value) return;
      
      this.loading = true;
      
      try {
        const { data, error } = await client
          .from('goals')
          .select('*')
          .eq('user_id', user.value.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        this.goals = data;
      } catch (error) {
        console.error('Error fetching user goals:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async updateUserProfile(updates) {
      const client = useSupabaseClient();
      const user = useSupabaseUser();
      
      if (!user.value) return;
      
      try {
        const { data, error } = await client
          .from('profiles')
          .update(updates)
          .eq('id', user.value.id)
          .select()
          .single();
        
        if (error) throw error;
        
        this.profile = data;
        return { success: true };
      } catch (error) {
        console.error('Error updating user profile:', error);
        return { success: false, error };
      }
    },
    
    addNotification(notification) {
      // Add notification to the store and limit to the most recent 5
      this.notifications.unshift(notification);
      if (this.notifications.length > 5) {
        this.notifications.pop();
      }
    },
    
    clearNotifications() {
      this.notifications = [];
    }
  }
});