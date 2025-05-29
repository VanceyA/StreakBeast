<template>
  <div 
    class="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-blue-500/20 hover:scale-105"
    :class="{ 'border-2 border-blue-500': achievement.unlocked, 'opacity-70': !achievement.unlocked }"
  >
    <div class="p-6">
      <div class="flex items-center mb-4">
        <div class="w-12 h-12 flex-shrink-0 rounded-full bg-blue-900 flex items-center justify-center">
          <span v-if="achievement.unlocked" class="text-2xl">🏆</span>
          <span v-else class="text-2xl">🔒</span>
        </div>
        <div class="ml-4">
          <h3 class="text-xl font-bold">{{ achievement.name }}</h3>
          <p class="text-sm text-gray-400">
            {{ achievement.unlocked ? 'Unlocked' : 'Locked' }}
            <span v-if="achievement.unlocked_at"> on {{ formatDate(achievement.unlocked_at) }}</span>
          </p>
        </div>
      </div>
      
      <p class="text-gray-300 mb-4">{{ achievement.description }}</p>
      
      <div class="w-full bg-gray-700 rounded-full h-2.5">
        <div 
          class="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
          :style="{ width: `${achievement.unlocked ? 100 : 0}%` }"
        ></div>
      </div>
      
      <p class="mt-2 text-sm text-gray-400">
        {{ achievement.unlocked ? 'Completed' : achievement.hint || 'Keep going to unlock this achievement!' }}
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  achievement: {
    type: Object,
    required: true
  }
})

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}
</script>
