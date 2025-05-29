<template>
  <div 
    class="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
  >
    <div class="flex flex-col md:flex-row justify-between">
      <div class="flex-1">
        <div class="flex items-center">
          <h3 class="text-lg font-semibold">{{ goal.title }}</h3>
          <span v-if="goal.streak > 0" 
                class="ml-2 px-2 py-0.5 bg-accent-500/20 text-accent-400 text-xs rounded-full flex items-center">
            <span>{{ goal.streak }} day{{ goal.streak !== 1 ? 's' : '' }}</span>
            <Icon name="carbon:fire" class="ml-1 animate-fire text-accent-500" />
          </span>
        </div>
        <p class="text-gray-400 text-sm mt-1">
          {{ goal.frequency }} • {{ goal.platform }}
        </p>
      </div>
      
      <div class="flex items-center mt-4 md:mt-0 space-x-2">
        <span v-if="!isCompleted" class="text-sm text-gray-400">
          Not completed today
        </span>
        <span v-else class="text-sm text-green-500 flex items-center">
          <Icon name="carbon:checkmark-filled" class="mr-1" />
          Completed today
        </span>
        
        <button 
          v-if="!isCompleted"
          @click="$emit('complete', goal)"
          class="btn-success text-sm"
        >
          Complete
        </button>
        
        <button @click="$emit('edit', goal)" class="text-gray-400 hover:text-white p-2">
          <Icon name="carbon:edit" />
        </button>
        
        <button @click="$emit('delete', goal)" class="text-gray-400 hover:text-red-500 p-2">
          <Icon name="carbon:trash-can" />
        </button>
      </div>
    </div>
    
    <!-- Progress Bar -->
    <div class="mt-4">
      <div class="flex justify-between text-xs text-gray-400 mb-1">
        <span>Current Streak</span>
        <span>Best: {{ goal.bestStreak }} days</span>
      </div>
      <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          class="h-full bg-accent-500 rounded-full transition-all"
          :style="{ width: `${progressWidth}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  goal: {
    type: Object,
    required: true
  }
});

defineEmits(['complete', 'edit', 'delete']);

const { isCompletedToday } = useStreak();

const isCompleted = computed(() => {
  return isCompletedToday(props.goal);
});

const progressWidth = computed(() => {
  if (!props.goal.bestStreak) return 0;
  return Math.min((props.goal.streak / props.goal.bestStreak) * 100, 100);
});
</script>