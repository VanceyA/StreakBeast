<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-gray-900 border-b border-gray-800">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <NuxtLink to="/" class="flex items-center space-x-2">
          <span class="text-2xl font-extrabold text-brand-500">
            <span class="text-accent-500">Streak</span>Beast
          </span>
        </NuxtLink>
        <div class="flex items-center space-x-4">
          <template v-if="user">
            <NuxtLink to="/dashboard" class="text-gray-300 hover:text-white">Dashboard</NuxtLink>
            <NuxtLink to="/social" class="text-gray-300 hover:text-white">Social</NuxtLink>
            <NuxtLink to="/achievements" class="text-gray-300 hover:text-white">Achievements</NuxtLink>
            <button @click="handleLogout" class="text-gray-300 hover:text-white">Logout</button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="text-gray-300 hover:text-white">Login</NuxtLink>
            <NuxtLink to="/register" class="btn-primary">Sign Up</NuxtLink>
          </template>
        </div>
      </div>
    </header>
    
    <main class="flex-1">
      <slot />
    </main>
    
    <footer class="bg-gray-900 border-t border-gray-800 py-6">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="mb-4 md:mb-0">
            <p class="text-gray-400">© {{ new Date().getFullYear() }} StreakBeast. All rights reserved.</p>
          </div>
          <div class="flex space-x-6">
            <a href="#" class="text-gray-400 hover:text-gray-300">Terms</a>
            <a href="#" class="text-gray-400 hover:text-gray-300">Privacy</a>
            <a href="#" class="text-gray-400 hover:text-gray-300">Help</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const user = useSupabaseUser();
const client = useSupabaseClient();
const router = useRouter();
const { $toast: toast } = useNuxtApp();

const handleLogout = async () => {
  try {
    const { error } = await client.auth.signOut();
    if (error) throw error;
    toast.success('Logged out successfully');
    router.push('/');
  } catch (error) {
    toast.error(error.message || 'Error logging out');
  }
};
</script>