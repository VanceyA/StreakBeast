<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold">{{ title || 'Achievements' }}</h2>
      <NuxtLink v-if="showViewAll" to="/achievements" class="text-sm text-blue-400 hover:text-blue-300">
        View All
      </NuxtLink>
    </div>
    
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else-if="displayAchievements.length === 0" class="text-center py-8">
      <p class="text-gray-400">{{ emptyMessage || 'No achievements unlocked yet.' }}</p>
      <slot name="empty-action"></slot>
    </div>
    
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div 
        v-for="achievement in displayAchievements" 
        :key="achievement.id"
        class="flex flex-col items-center p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition-all"
        :class="{ 'border-blue-500': achievement.unlocked }"
      >
        <div class="w-16 h-16 rounded-full bg-blue-900/20 flex items-center justify-center mb-2">
          <span v-if="achievement.unlocked" class="text-3xl">🏆</span>
          <span v-else class="text-3xl">🔒</span>
        </div>
        <h3 class="font-semibold text-center">{{ achievement.name }}</h3>
        <p class="text-xs text-gray-400 text-center mt-1">
          {{ achievement.unlocked ? achievement.description : (achievement.hint || 'Keep going to unlock!') }}
        </p>
        <p v-if="achievement.unlocked && achievement.unlocked_at" class="text-xs text-blue-400 mt-2">
          {{ formatDate(achievement.unlocked_at) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  achievements: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  limit: {
    type: Number,
    default: 0
  },
  title: {
    type: String,
    default: ''
  },
  emptyMessage: {
    type: String,
    default: ''
  },
  showViewAll: {
    type: Boolean,
    default: true
  },
  showUnlockedOnly: {
    type: Boolean,
    default: false
  }
});

// Compute which achievements to display based on props
const displayAchievements = computed(() => {
  let filtered = props.achievements;
  
  // Filter to only show unlocked if specified
  if (props.showUnlockedOnly) {
    filtered = filtered.filter(a => a.unlocked);
  }
  
  // Apply limit if specified
  if (props.limit > 0) {
    filtered = filtered.slice(0, props.limit);
  }
  
  return filtered;
});

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};
</script>
