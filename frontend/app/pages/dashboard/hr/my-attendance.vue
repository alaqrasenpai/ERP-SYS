<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <div class="max-w-5xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 ">
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight truncate">{{ $t('my_attendance.title') }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ $t('my_attendance.description') }}</p>
        </div>
        <div class="text-end">
          <p class="text-xs font-bold text-gray-500 uppercase">{{ $t('my_attendance.current_time') }}</p>
          <p class="text-xl font-black text-primary-600">{{ currentTime }}</p>
        </div>
      </div>

      <!-- Web Punch Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-md mx-auto">
        <div class="w-20 h-20 mx-auto bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-4">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-6">{{ $t('my_attendance.web_punch') }}</h3>
        
        <div class="flex flex-col space-y-4">
          <button @click="punch('in')" :disabled="loading" class="px-6 py-4 bg-secondary-500 hover:bg-secondary-600 text-white rounded-xl font-black shadow-lg shadow-secondary-200 transition-all disabled:opacity-50 flex items-center justify-center">
            <svg class="w-6 h-6 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
            {{ $t('my_attendance.clock_in') }}
          </button>
          
          <button @click="punch('out')" :disabled="loading" class="px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black shadow-lg shadow-orange-200 transition-all disabled:opacity-50 flex items-center justify-center">
            {{ $t('my_attendance.clock_out') }}
            <svg class="w-6 h-6 ms-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
        <p v-if="error" class="mt-4 text-sm font-bold text-red-600">{{ error }}</p>
        <p v-if="success" class="mt-4 text-sm font-bold text-secondary-600">{{ success }}</p>
      </div>

    </div>
  </div>
</template>

<script setup>
useHead({ title: 'My Attendance' })

import { ref, onMounted, onUnmounted } from 'vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { $api } = useNuxtApp()
const { user } = useAuth()

const currentTime = ref(new Date().toLocaleTimeString())
let timer = null

const loading = ref(false)
const error = ref('')
const success = ref('')

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const punch = async (type) => {
  loading.value = true
  error.value = ''
  success.value = ''
  
  try {
    // Note: Assuming user.employeeId exists, or backend uses user context.
    // If user object doesn't have employeeId, they need an Employee profile.
    await $api('/hr/attendance/web-punch', {
      method: 'POST',
      body: { type, employeeId: user.value.employeeId }
    })
    success.value = `${useNuxtApp().$i18n.t('my_attendance.punch_success')} ${type} at ${new Date().toLocaleTimeString()}`
  } catch (err) {
    error.value = err.response?.data?.message || useNuxtApp().$i18n.t('my_attendance.punch_failed')
  } finally {
    loading.value = false
  }
}
</script>
