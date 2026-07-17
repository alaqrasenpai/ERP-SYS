<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ $t('installments.title') }}</h2>
      <div class="flex space-x-3 space-x-reverse mt-4 sm:mt-0">
        <NuxtLink to="/" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 shadow-sm transition-colors flex items-center">
          <svg class="w-4 h-4 me-2 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          {{ $t('installments.dashboard') }}
        </NuxtLink>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center p-12">
      <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>

    <div v-else class="space-y-6">
      <div v-for="plan in plans" :key="plan._id" class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <!-- Plan Header -->
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 class="font-bold text-gray-900">{{ plan.customerId?.name || $t('installments.unknown_customer') }}</h3>
            <p class="text-xs text-gray-500 mt-0.5">{{ $t('installments.order') }} {{ plan.orderId?.orderNumber }} &bull; {{ $t('installments.created') }} {{ new Date(plan.createdAt).toLocaleDateString() }}</p>
          </div>
          <div class="text-end">
            <p class="text-sm font-bold text-gray-600">{{ $t('installments.total') }} ${{ plan.totalAmount.toFixed(2) }}</p>
            <p class="text-lg font-black text-indigo-600">{{ $t('installments.remaining') }} ${{ plan.remainingAmount.toFixed(2) }}</p>
          </div>
        </div>

        <!-- Plan Details -->
        <div class="p-6">
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div v-for="(inst, idx) in plan.installments" :key="inst._id" class="border rounded-xl p-3 relative" :class="getInstClass(inst)">
              <div class="absolute -top-2 rtl:-right-2 ltr:-left-2 w-5 h-5 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center">{{ idx + 1 }}</div>
              
              <p class="text-xs font-bold text-gray-500 uppercase mt-1 mb-1">{{ inst.status === 'Paid' ? $t('crm.payment_received') : inst.status }}</p>
              <h4 class="text-lg font-black text-gray-900">${{ inst.amount.toFixed(2) }}</h4>
              <p class="text-xs text-gray-600 mt-1" :class="isOverdue(inst.dueDate) && inst.status === 'Pending' ? 'text-red-600 font-bold' : ''">{{ $t('installments.due') }} {{ new Date(inst.dueDate).toLocaleDateString() }}</p>
              
              <button v-if="inst.status === 'Pending'" @click="payInstallment(plan._id, inst._id)" class="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1.5 rounded-lg transition-colors shadow-sm">
                {{ $t('installments.mark_paid') }}
              </button>
              <p v-else class="text-xs text-emerald-600 font-bold mt-3 text-center">{{ $t('installments.paid_on') }} {{ new Date(inst.paidDate).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="plans.length === 0" class="bg-white p-8 text-center rounded-2xl border border-gray-200 shadow-sm text-gray-500">
        {{ $t('installments.no_plans') }}
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Installments' })

import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { $api } = useNuxtApp()
const plans = ref([])
const loading = ref(true)

const fetchPlans = async () => {
  loading.value = true
  try {
    plans.value = await $api('/finance/installments')
  } catch (error) {
    alert('Failed to load installment plans')
  } finally {
    loading.value = false
  }
}

const isOverdue = (dateString) => {
  return new Date(dateString) < new Date()
}

const getInstClass = (inst) => {
  if (inst.status === 'Paid') return 'border-emerald-200 bg-emerald-50'
  if (isOverdue(inst.dueDate)) return 'border-red-300 bg-red-50'
  return 'border-gray-200 bg-white'
}

const payInstallment = async (planId, instId) => {
  if (!confirm(useNuxtApp().$i18n.t('installments.confirm_pay'))) return

  try {
    await $api(`/finance/installments/${planId}/pay/${instId}`, {
      method: 'POST'
    })
    await fetchPlans()
  } catch (error) {
    alert('Failed to process payment')
  }
}

onMounted(fetchPlans)
</script>
