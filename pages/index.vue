<template>
  <section class="py-12 md:py-20 px-4">
    <div class="container mx-auto max-w-6xl">
      <div class="flex flex-col lg:flex-row items-center gap-12">
        <!-- Hero Text -->
        <div class="lg:w-1/2">
          <h1 class="font-extrabold text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
            Never Break Your <span class="text-brand-500">Content</span> 
            <span class="text-accent-500">Streak</span> Again
          </h1>
          <p class="text-xl text-gray-300 mb-8">
            StreakBeast helps content creators and side hustlers stay consistent by tracking 
            publishing streaks and celebrating your wins.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <NuxtLink to="/register" class="btn-primary text-center text-lg py-3 px-8">
              Start Your Streak
            </NuxtLink>
            <NuxtLink to="/login" class="btn-secondary text-center text-lg py-3 px-8">
              Sign In
            </NuxtLink>
          </div>
        </div>
        <!-- Hero Stats Card -->
        <div class="lg:w-1/2 w-full">
          <div 
            class="card relative overflow-hidden border-brand-500/20" 
            @mousemove="handleMouseMove" 
            @mouseleave="resetLights"
            ref="streakCard"
          >
            <div 
              class="absolute w-32 h-32 bg-brand-500/15 rounded-full blur-xl transition-all duration-500 ease-out"
              :style="brandLightStyle"
            ></div>
            <div 
              class="absolute w-32 h-32 bg-accent-500/15 rounded-full blur-xl transition-all duration-700 ease-out"
              :style="accentLightStyle"
            ></div>
            
            <h3 class="text-2xl font-bold mb-6 relative z-10">Today's Top Streaks</h3>
            
            <div class="space-y-4">
              <div v-for="(user, index) in topUsers" :key="index" 
                   class="flex items-center p-4 bg-gray-800/50 rounded-lg">
                <div class="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mr-4">
                  <span class="text-lg font-bold">{{ index + 1 }}</span>
                </div>
                <div class="flex-1">
                  <h4 class="font-semibold text-lg">{{ user.name }}</h4>
                  <p class="text-gray-400">{{ user.content }}</p>
                </div>
                <div class="flex items-center">
                  <span class="text-2xl font-bold text-accent-500 mr-1">{{ user.days }}</span>
                  <span class="text-gray-400">days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Features Section -->
      <div class="mt-24">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-12">
          Keep Your Content Beast <span class="text-accent-500">Unleashed</span>
        </h2>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="(feature, index) in features" 
            :key="index" 
            class="card relative overflow-hidden transition-all duration-300 ease-in-out"
          >

            
            <!-- Feature card content -->
            <div class="relative z-10 transition-all duration-300 ease-in-out">
              <div class="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center mb-4">
                <Icon :name="feature.icon" class="text-2xl text-brand-500" />
              </div>
              <h3 class="text-xl font-bold mb-2">{{ feature.title }}</h3>
              <p class="text-gray-400">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- CTA Section -->
      <div class="mt-24 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-6">
          Ready to <span class="text-accent-500">Dominate</span> Your Content Game?
        </h2>
        <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Join thousands of creators who've turned their side hustle into a consistent machine 
          with StreakBeast.
        </p>
        <NuxtLink to="/register" class="btn-primary text-center text-lg py-3 px-8 inline-block">
          Start For Free
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
// Mock data for demonstration
const topUsers = [
  { name: 'Alex Hormozi', content: 'YouTube Videos', days: 365 },
  { name: 'MrBeast', content: 'TikTok Posts', days: 212 },
  { name: 'Ali Abdaal', content: 'Blog Articles', days: 184 }
];

const streakCard = ref(null);

// Light effect for the streak card
const brandLightStyle = ref({
  top: '50%',
  left: '50%',
  opacity: 0,
  transform: 'scale(1)'
});

const accentLightStyle = ref({
  bottom: '50%',
  right: '50%',
  opacity: 0,
  transform: 'scale(1)'
});

// No feature card light effects needed

// Feature card light effects removed

// Handle mouse movement to update light positions
const handleMouseMove = (e) => {
  if (!streakCard.value) return;
  
  const rect = streakCard.value.getBoundingClientRect();
  const x = e.clientX - rect.left; // x position within the element
  const y = e.clientY - rect.top;  // y position within the element
  
  // Calculate positions as percentages
  const xPercent = Math.round((x / rect.width) * 100);
  const yPercent = Math.round((y / rect.height) * 100);
  
  // Move the brand light (follows mouse more directly)
  brandLightStyle.value = {
    top: `${yPercent - 20}%`,
    left: `${xPercent - 20}%`,
    opacity: 0.6,
    transform: 'scale(1.2)'
  };
  
  // Move the accent light (follows with delay, opposite direction)
  accentLightStyle.value = {
    bottom: `${100 - yPercent - 20}%`,
    right: `${100 - xPercent - 20}%`,
    opacity: 0.7,
    transform: 'scale(1.5)'
  };
};

// Fade away lights when mouse is not over the section
const resetLights = () => {
  // Keep the position but fade opacity to 0
  const currentBrandStyle = { ...brandLightStyle.value };
  const currentAccentStyle = { ...accentLightStyle.value };
  
  // Fade out completely by setting opacity to 0
  brandLightStyle.value = {
    ...currentBrandStyle,
    opacity: 0,
    transform: 'scale(0.8)'
  };
  
  accentLightStyle.value = {
    ...currentAccentStyle,
    opacity: 0,
    transform: 'scale(0.8)'
  };
};

// Feature card light effects removed

// Feature card light effects removed

const features = [
  {
    title: 'Track Your Streaks',
    icon: 'ph:fire',
    description: 'Monitor your publishing consistency across all platforms and celebrate your longest runs.'
  },
  {
    title: 'Set Custom Goals',
    icon: 'ph:target',
    description: 'Create personalized content goals that match your schedule and platform strategy.'
  },
  {
    title: 'Never Miss a Day',
    icon: 'ph:alarm',
    description: "Get reminders when you're about to break a streak so you can maintain momentum."
  },
  {
    title: 'Earn Badges',
    icon: 'ph:medal',
    description: 'Unlock achievements as you hit milestones and build your content creation reputation.'
  },
  {
    title: 'See Your Progress',
    icon: 'ph:chart-line-up',
    description: 'Visualize your improvement over time with beautiful analytics and insights.'
  },
  {
    title: 'Join the Community',
    icon: 'ph:users-three',
    description: 'Connect with other dedicated creators who are committed to consistency.'
  }
];
</script>