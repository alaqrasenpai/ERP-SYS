<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <div class="max-w-4xl mx-auto space-y-6">
      
      <div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ $t('my_profile.title') }}</h2>
        <p class="text-sm text-gray-500 mt-1">{{ $t('my_profile.description') }}</p>
      </div>

      <div v-if="loading" class="flex justify-center p-12">
        <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
      
      <div v-else-if="!profile" class="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 font-bold text-center">
        {{ $t('my_profile.no_profile') }}
      </div>

      <div v-else class="space-y-6">
        
        <!-- Balances Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center space-x-6">
            <div class="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <div>
              <p class="text-sm font-bold text-gray-500 uppercase">{{ $t('my_profile.annual_leave_balance') }}</p>
              <p class="text-3xl font-black text-gray-900">{{ profile.annualLeaveBalance }} <span class="text-lg text-gray-400 font-bold">{{ $t('my_profile.days') }}</span></p>
            </div>
          </div>
          
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center space-x-6">
            <div class="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            </div>
            <div>
              <p class="text-sm font-bold text-gray-500 uppercase">{{ $t('my_profile.sick_leave_balance') }}</p>
              <p class="text-3xl font-black text-gray-900">{{ profile.sickLeaveBalance }} <span class="text-lg text-gray-400 font-bold">{{ $t('my_profile.days') }}</span></p>
            </div>
          </div>
        </div>

        <!-- Personal Info Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 class="text-lg font-bold text-gray-900">{{ $t('my_profile.personnel_information') }}</h3>
          </div>
          <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase mb-1">{{ $t('my_profile.full_name') }}</p>
              <p class="text-base font-medium text-gray-900">{{ profile.name }}</p>
            </div>
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase mb-1">{{ $t('my_profile.position') }}</p>
              <p class="text-base font-medium text-gray-900">{{ profile.position }}</p>
            </div>
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase mb-1">{{ $t('my_profile.department') }}</p>
              <p class="text-base font-medium text-gray-900">{{ profile.departmentId?.name || $t('my_profile.not_assigned') }}</p>
            </div>
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase mb-1">{{ $t('my_profile.assigned_shift') }}</p>
              <p class="text-base font-medium text-gray-900">{{ profile.shiftId?.name || $t('my_profile.not_assigned') }} <span v-if="profile.shiftId" class="text-sm text-gray-500">({{ profile.shiftId.startTime }} - {{ profile.shiftId.endTime }})</span></p>
            </div>
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase mb-1">{{ $t('my_profile.email') }}</p>
              <p class="text-base font-medium text-gray-900">{{ profile.email }}</p>
            </div>
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase mb-1">{{ $t('my_profile.phone') }}</p>
              <p class="text-base font-medium text-gray-900">{{ profile.phone || $t('my_profile.n_a') }}</p>
            </div>
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase mb-1">{{ $t('my_profile.joined_date') }}</p>
              <p class="text-base font-medium text-gray-900">{{ new Date(profile.joinedAt).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'My Profile' })

import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { $api } = useNuxtApp()
const profile = ref(null)
const loading = ref(true)

const fetchProfile = async () => {
  try {
    profile.value = await $api('/ess/my-profile')
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchProfile)
</script>
