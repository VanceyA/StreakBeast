<template>
  <Transition name="slide">
    <div 
      v-if="show" 
      class="fixed bottom-4 right-4 bg-gray-800 border-l-4 border-blue-500 rounded-lg shadow-lg p-4 max-w-md z-50 flex items-center"
    >
      <div class="mr-4 text-3xl">🏆</div>
      <div>
        <h3 class="font-bold text-lg text-blue-400">Achievement Unlocked!</h3>
        <p class="text-white">{{ achievement.name }}</p>
        <p class="text-gray-300 text-sm">{{ achievement.description }}</p>
      </div>
      <button 
        @click="closeNotification" 
        class="ml-4 text-gray-400 hover:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps({
  achievement: {
    type: Object,
    required: true
  },
  duration: {
    type: Number,
    default: 5000 // 5 seconds
  }
})

const show = ref(true)
let timer = null

const closeNotification = () => {
  show.value = false
  if (timer) clearTimeout(timer)
}

onMounted(() => {
  // Auto-close after duration
  timer = setTimeout(() => {
    show.value = false
  }, props.duration)
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
