<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold mb-2">Your Content Dashboard</h1>
        <p class="text-gray-400">Track your content creation streaks and conquer your goals</p>
      </div>
      <button @click="showGoalModal = true" class="btn-primary mt-4 md:mt-0">
        <Icon name="carbon:add" class="inline-block mr-1" /> Add New Goal
      </button>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="card bg-gradient-to-br from-gray-900 to-gray-800">
        <h3 class="text-lg font-semibold text-gray-300 mb-2">Current Streaks</h3>
        <div class="flex items-end">
          <span class="text-4xl font-bold text-white">{{ stats.currentStreak }}</span>
          <span class="text-gray-400 ml-2 mb-1">goal{{ stats.currentStreak !== 1 ? 's' : '' }}</span>
        </div>
      </div>
      
      <div class="card bg-gradient-to-br from-gray-900 to-gray-800">
        <h3 class="text-lg font-semibold text-gray-300 mb-2">Longest Streak</h3>
        <div class="flex items-end">
          <span class="text-4xl font-bold text-white">{{ stats.longestStreak }}</span>
          <span class="text-gray-400 ml-2 mb-1">days</span>
        </div>
      </div>
      
      <div class="card bg-gradient-to-br from-gray-900 to-gray-800">
        <h3 class="text-lg font-semibold text-gray-300 mb-2">Goals Completed</h3>
        <div class="flex items-end">
          <span class="text-4xl font-bold text-white">{{ stats.goalsCompleted }}</span>
          <span class="text-gray-400 ml-2 mb-1">this month</span>
        </div>
      </div>
    </div>

    <!-- Goal List -->
    <div class="card mb-8">
      <h2 class="text-xl font-bold mb-6">Active Goals</h2>
      
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
      
      <div v-else-if="goals.length === 0" class="text-center py-12">
        <Icon name="carbon:document-add" class="text-5xl text-gray-600 mx-auto mb-4" />
        <h3 class="text-xl font-semibold mb-2">No goals yet</h3>
        <p class="text-gray-400 mb-6">Create your first content goal to start tracking your streaks</p>
        <button @click="showGoalModal = true" class="btn-primary">
          <Icon name="carbon:add" class="inline-block mr-1" /> Add Your First Goal
        </button>
      </div>
      
      <TransitionGroup name="list" tag="div" v-else class="space-y-4">
        <GoalCard
          v-for="goal in goals"
          :key="goal.id"
          :goal="goal"
          @complete="completeGoal(goal)"
          @edit="editGoal(goal)"
          @delete="confirmDeleteGoal(goal)"
        />
      </TransitionGroup>
    </div>
    
    <!-- Achievements -->
    <div class="card">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold">Your Achievements</h2>
        <div class="flex items-center space-x-4">
          <button 
            @click="checkForNewAchievements" 
            class="text-sm px-2 py-1 rounded hover:bg-gray-700 text-blue-400 hover:text-blue-300 flex items-center"
          >
            <span class="mr-1">Check</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 20q-3.35 0-5.675-2.325Q4 15.35 4 12q0-3.35 2.325-5.675Q8.65 4 12 4q1.725 0 3.3.712Q16.875 5.425 18 6.75V4h2v7h-7V9h4.2q-.8-1.4-2.187-2.2Q13.625 6 12 6 9.5 6 7.75 7.75T6 12q0 2.5 1.75 4.25T12 18q1.925 0 3.475-1.1T17.65 14h2.1q-.7 2.65-2.85 4.325Q14.75 20 12 20Z" />
            </svg>
          </button>
          <NuxtLink 
            to="/achievements" 
            class="text-sm px-2 py-1 rounded hover:bg-gray-700 text-blue-400 hover:text-blue-300"
          >
            View All
          </NuxtLink>
        </div>
      </div>
      
      <div v-if="achievementsLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      
      <div v-else-if="userAchievements.length === 0" class="text-center py-8">
        <p class="text-gray-400">Complete your goals to earn achievements!</p>
        <button @click="checkForNewAchievements" class="btn-primary mt-4">
          Check for Achievements
        </button>
      </div>
      
      <div v-else-if="userAchievements.filter(a => a.unlocked).length === 0" class="text-center py-8">
        <p class="text-gray-400">You haven't unlocked any achievements yet.</p>
        <button @click="checkForNewAchievements" class="btn-primary mt-4">
          Check for Achievements
        </button>
      </div>
      
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div 
          v-for="achievement in userAchievements.filter(a => a.unlocked).slice(0, 5)" 
          :key="achievement.id"
          class="flex flex-col items-center p-4 bg-gray-800 rounded-lg border border-blue-500 hover:shadow-blue-500/20 transition-all"
        >
          <div class="w-16 h-16 rounded-full bg-blue-900/20 flex items-center justify-center mb-2">
            <span class="text-3xl">🏆</span>
          </div>
          <h3 class="font-semibold text-center">{{ achievement.name }}</h3>
          <p class="text-xs text-gray-400 text-center mt-1">{{ achievement.description }}</p>
        </div>
      </div>
    </div>
    
    <!-- Goal Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showGoalModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div class="card max-w-md w-full" @click.stop>
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold">{{ editingGoal ? 'Edit Goal' : 'Create New Goal' }}</h2>
              <button @click="closeGoalModal" class="text-gray-400 hover:text-white">
                <Icon name="carbon:close" />
              </button>
            </div>
            
            <form @submit.prevent="saveGoal" class="space-y-4">
              <div>
                <label for="title" class="form-label">Goal Title</label>
                <input 
                  id="title" 
                  v-model="goalForm.title" 
                  type="text" 
                  class="form-input" 
                  placeholder="e.g., Post YouTube videos"
                  required
                />
              </div>
              
              <div>
                <label for="platform" class="form-label">Platform</label>
                <select id="platform" v-model="goalForm.platform" class="form-input" required>
                  <option value="">Select a platform</option>
                  <option v-for="platform in platforms" :key="platform" :value="platform">
                    {{ platform }}
                  </option>
                </select>
              </div>
              
              <div>
                <label for="frequency" class="form-label">Frequency</label>
                <select id="frequency" v-model="goalForm.frequency" class="form-input" required>
                  <option value="">Select frequency</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>
              
              <div>
                <label for="target" class="form-label">Target Amount</label>
                <div class="flex">
                  <input 
                    id="target" 
                    v-model.number="goalForm.target" 
                    type="number" 
                    min="1" 
                    class="form-input" 
                    required
                  />
                  <select v-model="goalForm.targetUnit" class="form-input ml-2 w-1/3">
                    <option value="posts">posts</option>
                    <option value="videos">videos</option>
                    <option value="articles">articles</option>
                    <option value="episodes">episodes</option>
                    <option value="pieces">pieces</option>
                  </select>
                </div>
              </div>
              
              <div class="pt-2">
                <button type="submit" class="btn-primary w-full">
                  {{ editingGoal ? 'Update Goal' : 'Create Goal' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
    
    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div class="card max-w-md w-full" @click.stop>
            <h2 class="text-xl font-bold mb-4">Delete Goal</h2>
            <p class="text-gray-300 mb-6">
              Are you sure you want to delete "{{ goalToDelete?.title }}"? This action cannot be undone.
            </p>
            <div class="flex justify-end space-x-4">
              <button @click="showDeleteModal = false" class="btn-secondary">
                Cancel
              </button>
              <button @click="deleteGoal" class="btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import GoalCard from '~/components/GoalCard.vue';

const client = useSupabaseClient();
const user = useSupabaseUser();
const { $toast: toast } = useNuxtApp();
const { isCompletedToday } = useStreak();

// State
const goals = ref([]);
const loading = ref(true);
const showGoalModal = ref(false);
const showDeleteModal = ref(false);
const editingGoal = ref(null);
const goalToDelete = ref(null);

const goalForm = ref({
  title: '',
  platform: '',
  frequency: '',
  target: 1,
  targetUnit: 'posts',
});

const stats = ref({
  currentStreak: 0,
  longestStreak: 0,
  goalsCompleted: 0,
});

// Achievements
const { 
  achievements: userAchievements, 
  loading: achievementsLoading, 
  loadAchievements, 
  checkAchievements 
} = useAchievements();

// Options
const platforms = [
  'YouTube',
  'Instagram',
  'TikTok',
  'Twitter',
  'LinkedIn',
  'Facebook',
  'Blog',
  'Podcast',
  'Newsletter',
  'Other'
];

const targetUnits = [
  'posts',
  'videos',
  'reels',
  'tweets',
  'articles',
  'episodes',
  'newsletters'
];

// Function to manually check for achievements
const checkForAchievements = async () => {
  try {
    const newAchievements = await checkAchievements();
    if (newAchievements && newAchievements.length > 0) {
      toast.success(`Unlocked ${newAchievements.length} new achievement${newAchievements.length > 1 ? 's' : ''}!`);
    } else {
      toast.info('No new achievements unlocked yet. Keep going!');
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
    toast.error('Failed to check achievements');
  }
};

// Lifecycle
onMounted(async () => {
  // Check for missed streaks first
  await checkMissedStreaks();
  await fetchGoals();
  await loadAchievements();
});

// Check for missed streaks and reset them
const checkMissedStreaks = async () => {
  if (!user.value) return;
  
  try {
    const { checkMissedStreaks } = useStreak();
    const missedGoals = await checkMissedStreaks();
    
    if (missedGoals && missedGoals.length > 0) {
      toast.info(`${missedGoals.length} streak${missedGoals.length === 1 ? '' : 's'} reset due to inactivity.`);
    }
  } catch (error) {
    console.error('Error checking missed streaks:', error);
  }
};

// Methods
const fetchGoals = async () => {
  loading.value = true;
  
  try {
    // Use the server API endpoint to fetch goals
    const { data, error } = await $fetch(`/api/goals/list?userId=${user.value.id}`);
    
    if (error) throw new Error(error);
    
    goals.value = data || [];
    
    // Calculate stats
    calculateStats();
  } catch (error) {
    console.error('Error fetching goals:', error);
    toast.error('Failed to load goals');
  } finally {
    loading.value = false;
  }
};

// Calculate dashboard statistics based on goals data
const calculateStats = () => {
  // Count goals with active streaks (streak > 0)
  stats.value.currentStreak = goals.value.filter(goal => goal.streak > 0).length;
  
  // Find the longest streak across all goals
  stats.value.longestStreak = goals.value.reduce((max, goal) => 
    Math.max(max, goal.bestStreak || 0), 0);
  
  // Count goals completed this month
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  
  stats.value.goalsCompleted = goals.value.filter(goal => {
    if (!goal.last_completed) return false;
    const completedDate = new Date(goal.last_completed);
    return completedDate.getMonth() === thisMonth && 
           completedDate.getFullYear() === thisYear;
  }).length;
};

const isGoalCompletedToday = (goal) => {
  // Check if goal.last_completed date is today
  // This is a simplified check - in a real app you'd check against the actual database records
  return goal.last_completed && new Date(goal.last_completed).toDateString() === new Date().toDateString();
};

const completeGoal = async (goal) => {
  try {
    // Use server API endpoint to complete goal
    const { data, newStreak, bestStreak, error } = await $fetch('/api/goals/complete', {
      method: 'POST',
      body: {
        goalId: goal.id
      }
    });
    
    if (error) throw new Error(error);
    
    // If already completed today, show message and return
    if (data && data.message === 'Already completed today') {
      toast.info('Already completed today!');
      return;
    }
    
    // Update local state
    const index = goals.value.findIndex(g => g.id === goal.id);
    if (index !== -1) {
      const today = new Date();
      goals.value[index] = {
        ...goals.value[index],
        streak: newStreak,
        bestStreak: bestStreak,
        last_completed: today.toISOString(),
      };
    }
    
    toast.success('Goal completed! Keep the streak going! 🔥');
    
    // Calculate stats
    calculateStats();
    
    // Check for new achievements
    await checkForNewAchievements();
  } catch (error) {
    toast.error('Failed to mark goal as completed');
    console.error('Error completing goal:', error);
  }
};

// Function to check for new achievements
const checkForNewAchievements = async () => {
  try {
    // Show loading indicator
    achievementsLoading.value = true;
    
    // Get fresh references to the composable functions
    const { checkAchievements, loadAchievements } = useAchievements();
    
    // First check for new achievements
    const unlockedAchievements = await checkAchievements();
    
    // Then reload all achievements to get the updated list
    await loadAchievements();
    
    // Achievement notifications are handled by the toast system in the checkAchievements function
    if (unlockedAchievements && unlockedAchievements.length > 0) {
      console.log('New achievements unlocked:', unlockedAchievements);
      toast.success(`Unlocked ${unlockedAchievements.length} new achievement${unlockedAchievements.length > 1 ? 's' : ''}!`);
    } else {
      toast.info('No new achievements unlocked yet. Keep going!');
    }
    
    return unlockedAchievements;
  } catch (error) {
    console.error('Error checking for achievements:', error);
    toast.error('Error checking for achievements');
    return [];
  } finally {
    // Hide loading indicator
    achievementsLoading.value = false;
  }
};

const checkForBadges = (streak) => {
  // This is a placeholder for badge award logic
  // In a real app, you'd check against requirements and award badges
  if (streak === 7) {
    toast.info('🏆 Achievement Unlocked: 7-Day Streak!', {
      autoClose: 5000,
    });
  } else if (streak === 30) {
    toast.info('🏆 Achievement Unlocked: 30-Day Beast Mode!', {
      autoClose: 5000,
    });
  }
};

const editGoal = (goal) => {
  editingGoal.value = goal;
  goalForm.value = {
    title: goal.title,
    platform: goal.platform,
    frequency: goal.frequency,
    target: goal.target || 1,
    targetUnit: goal.targetUnit || 'posts',
  };
  showGoalModal.value = true;
};

const confirmDeleteGoal = (goal) => {
  goalToDelete.value = goal;
  showDeleteModal.value = true;
};

const deleteGoal = async () => {
  if (!goalToDelete.value) return;
  
  try {
    // Use server API endpoint to delete goal
    const { error } = await $fetch('/api/goals/delete', {
      method: 'POST',
      body: {
        goalId: goalToDelete.value.id
      }
    });
    
    if (error) throw new Error(error);
    
    // Update local state
    goals.value = goals.value.filter(g => g.id !== goalToDelete.value.id);
    
    toast.success('Goal deleted successfully');
  } catch (error) {
    toast.error('Failed to delete goal');
    console.error('Error deleting goal:', error);
  } finally {
    showDeleteModal.value = false;
    goalToDelete.value = null;
  }
};

const saveGoal = async () => {
  try {
    if (editingGoal.value) {
      // Update existing goal using server API
      const { data, error } = await $fetch('/api/goals/update', {
        method: 'POST',
        body: {
          goalId: editingGoal.value.id,
          title: goalForm.value.title,
          platform: goalForm.value.platform,
          frequency: goalForm.value.frequency,
          target: goalForm.value.target,
          targetUnit: goalForm.value.targetUnit
        }
      });
      
      if (error) throw new Error(error);
      
      // Update local state
      const index = goals.value.findIndex(g => g.id === editingGoal.value.id);
      if (index !== -1) {
        goals.value[index] = {
          ...goals.value[index],
          title: goalForm.value.title,
          platform: goalForm.value.platform,
          frequency: goalForm.value.frequency,
          target: goalForm.value.target,
          targetUnit: goalForm.value.targetUnit,
          updated_at: new Date().toISOString()
        };
      }
      
      toast.success('Goal updated successfully');
    } else {
      // Create new goal using server API
      const { data, error } = await $fetch('/api/goals/create', {
        method: 'POST',
        body: {
          userId: user.value.id,
          title: goalForm.value.title,
          platform: goalForm.value.platform,
          frequency: goalForm.value.frequency,
          target: goalForm.value.target,
          targetUnit: goalForm.value.targetUnit
        }
      });
      
      if (error) throw new Error(error);
      
      // Add to local state
      goals.value = [data, ...goals.value];
      
      toast.success('Goal created successfully');
    }
    
    closeGoalModal();
  } catch (error) {
    toast.error(editingGoal.value ? 'Failed to update goal' : 'Failed to create goal');
    console.error('Error saving goal:', error);
  }
};

const closeGoalModal = () => {
  showGoalModal.value = false;
  editingGoal.value = null;
  goalForm.value = {
    title: '',
    platform: '',
    frequency: '',
    target: 1,
    targetUnit: 'posts',
  };
};

// Route guard to ensure authenticated access
definePageMeta({
  middleware: 'auth'
});
</script>