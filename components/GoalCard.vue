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
        <div v-if="goal.last_completed" class="mt-1 text-xs">
          <span class="text-gray-400">Last completed: {{ formatLastCompleted }}</span>
        </div>
        <div v-if="goal.streak > 0 && !isCompleted" class="mt-1 text-xs">
          <span :class="countdownColor" class="flex items-center">
            <Icon name="carbon:time" class="mr-1" /> 
            <span v-if="timeUntilReset.expired">Streak expired!</span>
            <span v-else>
              <span v-if="timeUntilReset.hours >= 24">{{ Math.floor(timeUntilReset.hours / 24) }}d {{ timeUntilReset.hours % 24 }}h</span>
              <span v-else>{{ timeUntilReset.hours }}h {{ timeUntilReset.minutes }}m</span>
              until streak resets
            </span>
          </span>
        </div>
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
        <span>Current Streak: {{ goal.streak }} day{{ goal.streak !== 1 ? 's' : '' }}</span>
        <span>Best: {{ goal.bestStreak }} days</span>
      </div>
      <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          class="h-full bg-accent-500 rounded-full transition-all"
          :style="{ width: `${progressWidth}%` }"
        ></div>
      </div>
      
      <!-- Time Remaining Text -->
      <div v-if="goal.streak > 0 && !isCompleted && goal.last_completed" class="mt-2 text-xs text-right">
        <span :class="countdownColor">{{ timeRemainingText }}</span>
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

const { isCompletedToday, getTimeUntilReset } = useStreak();
const { $dayjs } = useNuxtApp();

const isCompleted = computed(() => {
  return isCompletedToday(props.goal);
});

const timeUntilReset = computed(() => {
  return getTimeUntilReset(props.goal);
});

// Determine if we should show the countdown
const shouldShowCountdown = computed(() => {
  if (timeUntilReset.value.expired) return true;
  
  // For daily goals, show countdown when less than 12 hours remain
  if (props.goal.frequency === 'Daily') {
    return timeUntilReset.value.hours < 12;
  }
  
  // For weekly goals, show countdown when less than 48 hours remain
  if (props.goal.frequency.startsWith('Weekly')) {
    return timeUntilReset.value.hours < 48;
  }
  
  // For monthly goals, show countdown when less than 72 hours remain
  if (props.goal.frequency.startsWith('Monthly')) {
    return timeUntilReset.value.hours < 72;
  }
  
  return timeUntilReset.value.hours < 12; // Default
});

// Format the last completed date
const formatLastCompleted = computed(() => {
  if (!props.goal.last_completed) return '';
  
  const lastCompleted = new Date(props.goal.last_completed);
  const now = new Date();
  const diffDays = Math.floor((now - lastCompleted) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return $dayjs(lastCompleted).format('MMM D, YYYY');
  }
});

// Determine color based on urgency
const countdownColor = computed(() => {
  if (timeUntilReset.value.expired) return 'text-red-500';
  
  const percentRemaining = (timeUntilReset.value.hours / timeUntilReset.value.totalHours) * 100;
  
  if (percentRemaining < 10) return 'text-red-500'; // Less than 10% time remaining
  if (percentRemaining < 25) return 'text-yellow-500'; // Less than 25% time remaining
  
  return 'text-blue-400'; // More than 25% time remaining
});

// Calculate the width of the time progress bar
const timeProgressWidth = computed(() => {
  if (!props.goal.last_completed || timeUntilReset.value.expired) return 0;
  
  // Calculate how much time has passed as a percentage of the total time
  const percentRemaining = (timeUntilReset.value.hours / timeUntilReset.value.totalHours) * 100;
  return 100 - percentRemaining; // Invert to show time elapsed instead of time remaining
});

// Color for the time progress bar
const timeProgressBarColor = computed(() => {
  const percentRemaining = (timeUntilReset.value.hours / timeUntilReset.value.totalHours) * 100;
  
  if (percentRemaining < 10) return 'bg-red-500'; // Less than 10% time remaining
  if (percentRemaining < 25) return 'bg-yellow-500'; // Less than 25% time remaining
  return 'bg-green-500'; // More than 25% time remaining
});

// Text to display for time remaining
const timeRemainingText = computed(() => {
  if (timeUntilReset.value.expired) return 'Expired';
  
  if (timeUntilReset.value.hours >= 24) {
    const days = Math.floor(timeUntilReset.value.hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} left`;
  }
  
  return `${timeUntilReset.value.hours}h ${timeUntilReset.value.minutes}m left`;
});

const progressWidth = computed(() => {
  if (!props.goal.bestStreak) return 0;
  return Math.min((props.goal.streak / props.goal.bestStreak) * 100, 100);
});

// Refresh the countdown timer every minute
let intervalId;
onMounted(() => {
  intervalId = setInterval(() => {
    // Force recomputation of timeUntilReset
    if (timeUntilReset.value.hours === 0 && timeUntilReset.value.minutes === 0) {
      // If time is up, we should check if the streak needs to be reset
      // This would typically be handled by a server-side process
      // For now, we'll just force a refresh of the component
    }
  }, 60000); // Update every minute
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>