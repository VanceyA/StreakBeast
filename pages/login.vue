<template>
  <div class="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
    <div class="card max-w-md w-full relative overflow-hidden">
      <div class="absolute -right-20 -top-20 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl"></div>
      <div class="absolute -left-20 -bottom-20 w-40 h-40 bg-accent-500/10 rounded-full blur-3xl"></div>
      
      <h1 class="text-2xl font-bold mb-6">Welcome Back</h1>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="email" class="form-label">Email</label>
          <input 
            id="email" 
            v-model="email" 
            type="email" 
            class="form-input" 
            placeholder="you@example.com" 
            required
          />
          <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
        </div>
        
        <div>
          <label for="password" class="form-label">Password</label>
          <input 
            id="password" 
            v-model="password" 
            type="password" 
            class="form-input" 
            placeholder="••••••••" 
            required
          />
          <p v-if="errors.password" class="form-error">{{ errors.password }}</p>
        </div>
        
        <div class="flex justify-end">
          <a href="#" class="text-sm text-brand-500 hover:text-brand-400">Forgot password?</a>
        </div>
        
        <div class="pt-2">
          <button 
            type="submit" 
            class="btn-primary w-full" 
            :disabled="isLoading"
          >
            <span v-if="isLoading">Signing In...</span>
            <span v-else>Sign In</span>
          </button>
        </div>
      </form>
      
      <p class="text-center mt-6 text-gray-400">
        Don't have an account? 
        <NuxtLink to="/register" class="text-brand-500 hover:text-brand-400">Create one</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
const client = useSupabaseClient();
const router = useRouter();
const { $toast: toast } = useNuxtApp();

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errors = ref({});

const validateForm = () => {
  errors.value = {};
  let isValid = true;
  
  if (!email.value) {
    errors.value.email = 'Email is required';
    isValid = false;
  }
  
  if (!password.value) {
    errors.value.password = 'Password is required';
    isValid = false;
  }
  
  return isValid;
};

const handleLogin = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  
  try {
    console.log('Login attempt with:', email.value);
    
    // Get auth functions from our composable
    const { login } = useAuth();
    const { data, error } = await login(email.value, password.value);
    
    console.log('Auth response:', data ? 'Data received' : 'No data', error ? `Error: ${error.message}` : 'No error');
    
    if (error) throw error;
    
    // Add a small delay to ensure the user state is updated
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Login successful, navigating to dashboard');
    toast.success('Logged in successfully!');
    
    // Use navigateTo instead of router.push for more reliable navigation in Nuxt
    navigateTo('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    const errorMessage = err && err.message ? err.message : 'Invalid email or password';
    toast.error(errorMessage);
  } finally {
    isLoading.value = false;
  }
};
</script>