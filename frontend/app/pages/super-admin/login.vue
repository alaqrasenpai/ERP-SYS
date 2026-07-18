<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6">
      <div class="text-center">
        <div class="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>
        <h2 class="text-3xl font-black text-gray-900 tracking-tight">Super Admin</h2>
        <p class="text-sm text-gray-500 mt-2">Sign in to manage all SaaS tenants</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">System Email</label>
          <input v-model="form.email" type="email" required class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500 text-gray-900 bg-gray-50 focus:bg-white transition-colors" placeholder="admin@erp.saas">
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Master Password</label>
          <input v-model="form.password" type="password" required class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500 text-gray-900 bg-gray-50 focus:bg-white transition-colors" placeholder="••••••••">
        </div>

        <button type="submit" :disabled="loading" class="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-red-200 transition-all focus:outline-none focus:ring-4 focus:ring-red-500/50 disabled:bg-gray-400">
          <span v-if="!loading">Secure Login</span>
          <span v-else class="flex items-center justify-center">
            <svg class="animate-spin -ms-1 me-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Authenticating...
          </span>
        </button>
      </form>
      
      <p v-if="error" class="text-sm font-bold text-red-600 text-center bg-red-50 py-2 rounded-lg">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Login' })

import { ref } from 'vue'

definePageMeta({
  layout: false
})

const router = useRouter()
const form = ref({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const res = await $fetch(`http://localhost:5000/api/super/login`, {
      method: 'POST',
      body: form.value
    })
    
    if (res.token) {
      localStorage.setItem('super_token', res.token)
      router.push('/super-admin')
    }
  } catch (err) {
    error.value = err.data?.message || 'Login failed. Invalid credentials.'
  } finally {
    loading.value = false
  }
}
</script>
