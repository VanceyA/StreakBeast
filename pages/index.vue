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
          <div class="card relative overflow-hidden border-brand-500/20">
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-brand-500/10 rounded-full blur-2xl"></div>
            <div class="absolute -left-10 -bottom-10 w-40 h-40 bg-accent-500/10 rounded-full blur-2xl"></div>
            
            <h3 class="text-2xl font-bold mb-6">Top Streakers This Week</h3>
            
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
          <div v-for="(feature, index) in features" :key="index" class="card">
            <div class="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center mb-4">
              <Icon :name="feature.icon" class="text-2xl text-brand-500" />
            </div>
            <h3 class="text-xl font-bold mb-2">{{ feature.title }}</h3>
            <p class="text-gray-400">{{ feature.description }}</p>
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
  { name: 'Emma Chamberlain', content: 'Podcast Episodes', days: 156 }
];

const features = [
  {
    title: 'Track Your Streaks',
    icon: 'carbon:fire',
    description: 'Monitor your publishing consistency across all platforms and celebrate your longest runs.'
  },
  {
    title: 'Set Custom Goals',
    icon: 'carbon:target',
    description: 'Create personalized content goals that match your schedule and platform strategy.'
  },
  {
    title: 'Never Miss a Day',
    icon: 'carbon:notification',
    description: "Get reminders when you're about to break a streak so you can maintain momentum."
  },
  {
    title: 'Earn Badges',
    icon: 'carbon:award',
    description: 'Unlock achievements as you hit milestones and build your content creation reputation.'
  },
  {
    title: 'See Your Progress',
    icon: 'carbon:line-chart',
    description: 'Visualize your improvement over time with beautiful analytics and insights.'
  },
  {
    title: 'Join the Community',
    icon: 'carbon:group',
    description: 'Connect with other dedicated creators who are committed to consistency.'
  }
];
</script>