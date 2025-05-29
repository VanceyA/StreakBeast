<template>
  <div class="card bg-gradient-to-br from-gray-900 to-gray-800">
    <h3 class="text-lg font-semibold text-gray-300 mb-2">{{ title }}</h3>
    <div class="flex items-end">
      <span class="text-4xl font-bold text-white">{{ value }}</span>
      <span class="text-gray-400 ml-2 mb-1">{{ unit }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  unit: {
    type: String,
    default: ''
  }
});
</script>