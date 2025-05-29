<template>
  <div class="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
    <div class="card max-w-md w-full text-center">
      <h1 class="text-2xl font-bold mb-4">Setting up your account</h1>
      
      <div v-if="loading" class="py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mx-auto mb-4"></div>
        <p class="text-gray-400">Please wait while we set up your account...</p>
      </div>
      
      <div v-else>
        <Icon name="carbon:checkmark-filled" class="text-5xl text-green-500 mx-auto mb-4" />
        <h2 class="text-xl font-semibold mb-2">Account confirmed!</h2>
        <p class="text-gray-400 mb-6">Your account has been successfully set up.</p>
        <NuxtLink to="/dashboard" class="btn-primary w-full">Go to Dashboard</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const loading = ref(true);
const router = useRouter();
const user = useSupabaseUser();

onMounted(() => {
  // Simulate loading for 2 seconds
  setTimeout(() => {
    loading.value = false;
    
    // If user is logged in, create profile if it doesn't exist
    if (user.value) {
      createUserProfile(user.value);
    }
  }, 2000);
});

const createUserProfile = async (user) => {
  const client = useSupabaseClient();
  
  try {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await client
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking for existing profile:', fetchError);
      return;
    }
    
    // If profile doesn't exist, create it
    if (!existingProfile) {
      const { error: insertError } = await client
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          created_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error creating profile:', insertError);
      }
    }
  } catch (error) {
    console.error('Error in profile creation:', error);
  }
};
</script>