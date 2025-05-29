import { defineNuxtPlugin } from '#app';
import Vue3Toastify, { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Vue3Toastify, {
    autoClose: 3000,
    theme: 'dark',
    position: toast.POSITION.TOP_RIGHT,
    clearOnUrlChange: false
  });
  
  // Create a wrapper for toast with error handling
  const safeToast = {
    success: (message) => {
      try {
        toast.success(message);
      } catch (e) {
        console.log('Toast success:', message);
      }
    },
    error: (message) => {
      try {
        toast.error(message);
      } catch (e) {
        console.error('Toast error:', message);
      }
    },
    info: (message) => {
      try {
        toast.info(message);
      } catch (e) {
        console.info('Toast info:', message);
      }
    },
    warning: (message) => {
      try {
        toast.warning(message);
      } catch (e) {
        console.warn('Toast warning:', message);
      }
    }
  };
  
  return {
    provide: {
      toast: safeToast
    }
  };
});