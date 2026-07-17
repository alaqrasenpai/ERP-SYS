<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ $t('checks.title') }}</h2>
      <div class="flex space-x-3 mt-4 sm:mt-0 space-x-reverse">
        <NuxtLink to="/" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 shadow-sm transition-colors flex items-center">
          <svg class="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          {{ $t('checks.dashboard') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-orange-50 rounded-xl p-4 border border-orange-100 shadow-sm">
        <p class="text-xs font-bold text-orange-600 uppercase">{{ $t('checks.pending_checks') }}</p>
        <p class="text-2xl font-black text-orange-900">{{ pendingCount }}</p>
      </div>
      <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-100 shadow-sm">
        <p class="text-xs font-bold text-emerald-600 uppercase">{{ $t('checks.collected_total') }}</p>
        <p class="text-2xl font-black text-emerald-900">${{ collectedTotal.toFixed(2) }}</p>
      </div>
      <div class="bg-red-50 rounded-xl p-4 border border-red-100 shadow-sm">
        <p class="text-xs font-bold text-red-600 uppercase">{{ $t('checks.bounced_count') }}</p>
        <p class="text-2xl font-black text-red-900">{{ bouncedCount }}</p>
      </div>
    </div>

    <!-- Checks Grid -->
    <div v-if="loading" class="flex justify-center p-12">
      <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="check in checks" :key="check._id" class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative">
        <div class="absolute top-4 right-4 rtl:left-4 rtl:right-auto">
          <span v-if="check.status === 'Pending'" class="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">{{ $t('checks.pending') }}</span>
          <span v-else-if="check.status === 'Collected'" class="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">{{ $t('checks.collected') }}</span>
          <span v-else class="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">{{ $t('checks.bounced') }}</span>
        </div>

        <h3 class="text-xl font-black text-gray-900">${{ check.amount.toFixed(2) }}</h3>
        <p class="text-sm font-bold text-gray-700 mt-2">{{ check.customerId?.name || $t('checks.unknown_customer') }}</p>
        
        <div class="mt-4 space-y-1.5 border-t border-gray-100 pt-3">
          <p class="text-xs text-gray-600"><span class="font-bold text-gray-500 w-20 inline-block">{{ $t('checks.check_no') }}</span> {{ check.checkNumber }}</p>
          <p class="text-xs text-gray-600"><span class="font-bold text-gray-500 w-20 inline-block">{{ $t('checks.bank') }}</span> {{ check.bankName }}</p>
          <p class="text-xs text-gray-600"><span class="font-bold text-gray-500 w-20 inline-block">{{ $t('checks.due_date') }}</span> <span :class="isOverdue(check.dueDate) && check.status === 'Pending' ? 'text-red-600 font-bold' : ''">{{ new Date(check.dueDate).toLocaleDateString() }}</span></p>
          <p class="text-xs text-gray-600"><span class="font-bold text-gray-500 w-20 inline-block">{{ $t('checks.reference') }}</span> {{ check.orderId?.orderNumber || $t('checks.manual') }}</p>
        </div>

        <div v-if="check.status === 'Pending'" class="mt-5 grid grid-cols-2 gap-2">
          <button @click="updateStatus(check._id, 'Collected')" class="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors">
            {{ $t('checks.mark_collected') }}
          </button>
          <button @click="updateStatus(check._id, 'Bounced')" class="w-full bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors">
            {{ $t('checks.mark_bounced') }}
          </button>
        </div>
      </div>
      
      <div v-if="checks.length === 0" class="col-span-full bg-white p-8 text-center rounded-2xl border border-gray-200 shadow-sm text-gray-500">
        {{ $t('checks.no_checks') }}
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Checks' })

import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { $api } = useNuxtApp()
const checks = ref([])
const loading = ref(true)

const pendingCount = computed(() => checks.value.filter(c => c.status === 'Pending').length)
const bouncedCount = computed(() => checks.value.filter(c => c.status === 'Bounced').length)
const collectedTotal = computed(() => checks.value.filter(c => c.status === 'Collected').reduce((acc, c) => acc + c.amount, 0))

const fetchChecks = async () => {
  loading.value = true
  try {
    checks.value = await $api('/finance/checks')
  } catch (error) {
    alert(useNuxtApp().$i18n.t('checks.failed_load'))
  } finally {
    loading.value = false
  }
}

const isOverdue = (dateString) => {
  return new Date(dateString) < new Date()
}

const updateStatus = async (checkId, status) => {
  const transStatus = status === 'Collected' ? useNuxtApp().$i18n.t('checks.collected') : useNuxtApp().$i18n.t('checks.bounced')
  if (!confirm(`${useNuxtApp().$i18n.t('checks.confirm_status1')} ${transStatus}${useNuxtApp().$i18n.t('checks.confirm_status2')}`)) return

  try {
    await $api(`/finance/checks/${checkId}/status`, {
      method: 'POST',
      body: { status }
    })
    await fetchChecks()
  } catch (error) {
    alert(useNuxtApp().$i18n.t('checks.failed_update'))
  }
}

onMounted(fetchChecks)
</script>
