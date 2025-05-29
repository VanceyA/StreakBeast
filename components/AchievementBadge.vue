<template>
  <div 
    class="flex flex-col items-center p-4 bg-gray-800 rounded-lg border border-gray-700"
    :class="{ 'animate-badge-pop': isNew }"
  >
    <div 
      class="w-16 h-16 rounded-full flex items-center justify-center mb-2"
      :class="badgeBackground"
    >
      <Icon :name="badge.icon" class="text-3xl" :class="badgeIconColor" />
    </div>
    <h3 class="font-semibold text-center">{{ badge.name }}</h3>
    <p class="text-xs text-gray-400 text-center mt-1">{{ badge.description }}</p>
    <span v-if="isNew" class="text-xs text-accent-500 font-semibold mt-1">NEW!</span>
  </div>
</template>

<script setup>
const props = defineProps({
  badge: {
    type: Object,
    required: true
  },
  isNew: {
    type: Boolean,
    default: false
  }
});

// Compute badge style based on badge type or level
const badgeBackground = computed(() => {
  const types = {
    bronze: 'bg-amber-900/20',
    silver: 'bg-gray-400/20',
    gold: 'bg-amber-500/20',
    platinum: 'bg-indigo-400/20',
    streak: 'bg-accent-500/20',
    achievement: 'bg-brand-500/20',
    special: 'bg-purple-500/20'
  };
  
  return types[props.badge.type] || 'bg-brand-500/20';
});

const badgeIconColor = computed(() => {
  const colors = {
    bronze: 'text-amber-600',
    silver: 'text-gray-400',
    gold: 'text-amber-500',
    platinum: 'text-indigo-400',
    streak: 'text-accent-500',
    achievement: 'text-brand-500',
    special: 'text-purple-500'
  };
  
  return colors[props.badge.type] || 'text-brand-500';
});
</script>