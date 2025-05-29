<template>
  <div class="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
    <div class="card max-w-md w-full relative overflow-hidden">
      <div class="absolute -right-20 -top-20 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl"></div>
      <div class="absolute -left-20 -bottom-20 w-40 h-40 bg-accent-500/10 rounded-full blur-3xl"></div>
      
      <h1 class="text-2xl font-bold mb-6">Create Your Account</h1>
      
      <form @submit.prevent="handleRegister" class="space-y-4">
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
        
        <div>
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <input 
            id="confirmPassword" 
            v-model="confirmPassword" 
            type="password" 
            class="form-input" 
            placeholder="••••••••" 
            required
          />
          <p v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</p>
        </div>
        
        <div class="pt-2">
          <button 
            type="submit" 
            class="btn-primary w-full" 
            :disabled="isLoading"
          >
            <span v-if="isLoading">Creating Account...</span>
            <span v-else>Create Account</span>
          </button>
        </div>
      </form>
      
      <p class="text-center mt-6 text-gray-400">
        Already have an account? 
        <NuxtLink to="/login" class="text-brand-500 hover:text-brand-400">Sign in</NuxtLink>
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
const confirmPassword = ref('');
const isLoading = ref(false);
const errors = ref({});

const validateForm = () => {
  errors.value = {};
  let isValid = true;
  
  if (!email.value) {
    errors.value.email = 'Email is required';
    isValid = false;
  } else if (!/^\S+@\S+\.\S+$/.test(email.value)) {
    errors.value.email = 'Please enter a valid email';
    isValid = false;
  }
  
  if (!password.value) {
    errors.value.password = 'Password is required';
    isValid = false;
  } else if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters';
    isValid = false;
  }
  
  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Passwords do not match';
    isValid = false;
  }
  
  return isValid;
};

const handleRegister = async () => {
  if (!validateForm()) return;
  
  isLoading.value = true;
  
  try {
    console.log('Registering with email:', email.value);
    
    // Sign up the user
    const { data, error } = await client.auth.signUp({
      email: email.value,
      password: password.value,
    });
    
    if (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Error creating account');
      return;
    }
    
    console.log('User created successfully, creating profile');
    
    // Step 2: Create a profile using our server API
    if (data && data.user) {
      try {
        // Create a server API endpoint to handle profile creation
        // This approach uses a server endpoint to bypass RLS
        const profileData = {
          userId: data.user.id,
          email: data.user.email,
          createdAt: new Date().toISOString()
        };
        
        // Call the server API endpoint to create the profile
        const { error: profileError } = await $fetch('/api/create-profile', {
          method: 'POST',
          body: profileData
        }).catch(err => ({ error: err }));
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast.warning('Account created but profile setup may be incomplete');
        } else {
          console.log('Profile created successfully');
        }
      } catch (profileErr) {
        console.error('Profile creation exception:', profileErr);
        toast.warning('Account created but profile setup may be incomplete');
      }
    }
    
    toast.success('Registration successful! Please log in.');
    navigateTo('/login');
  } catch (err) {
    console.error('Registration error:', err);
    toast.error(err.message || 'Failed to register');
  } finally {
    isLoading.value = false;
  }
};
</script>