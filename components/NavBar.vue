<template>
  <nav class="bg-gray-900 shadow-md">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center py-4">
        <NuxtLink to="/" class="text-xl font-bold text-white">StreakBest</NuxtLink>
        
        <div v-if="user" class="flex items-center space-x-6">
          <NuxtLink to="/dashboard" class="nav-link">Dashboard</NuxtLink>
          <NuxtLink to="/achievements" class="nav-link">Achievements</NuxtLink>
          <button @click="handleLogout" class="nav-link">Logout</button>
        </div>
        
        <div v-else class="flex items-center space-x-6">
          <NuxtLink to="/login" class="nav-link">Login</NuxtLink>
          <NuxtLink to="/register" class="btn-primary">Sign Up</NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
const user = useSupabaseUser();
const router = useRouter();
const { $toast: toast } = useNuxtApp();

const handleLogout = async () => {
  try {
    const { logout } = useAuth();
    const { error } = await logout();
    
    if (error) throw error;
    
    toast.success('Logged out successfully');
    router.push('/login');
  } catch (error) {
    console.error('Error logging out:', error);
    toast.error('Failed to log out');
  }
};
</script>

<style scoped>
.nav-link {
  @apply text-gray-300 hover:text-white transition-colors;
}
</style>
