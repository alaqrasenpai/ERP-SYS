<template>
  <div class="min-h-screen bg-[#FAFAFA] p-4 sm:p-8 font-sans dir-rtl">
    <div class="max-w-7xl mx-auto space-y-6">
      
      <!-- Top Header Area -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <!-- Title and Subtitle -->
        <div class="flex items-baseline gap-4">
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ $t('installments.title', 'إدارة الأقساط') }}</h2>
          <p class="text-sm font-bold text-gray-400">{{ $t('installments.description', 'متابعة مبيعات التقسيط والمبالغ المتبقية') }}</p>
        </div>
        
        <!-- Total Due Badge -->
        <div class="mt-4 sm:mt-0 px-5 py-2.5 bg-blue-50/50 text-blue-500 border border-blue-200 rounded-full flex items-center font-black text-sm">
          {{ $t('installments.total_due') }} {{ totalRemaining.toFixed(2) }}
        </div>
      </div>

      <!-- Main Card with Tabs and Table -->
      <div class="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
        
        <!-- Tabs -->
        <div class="flex border-b border-gray-100 px-6 pt-2">
          <button @click="activeTab = 'manage'" 
                  class="px-6 py-4 text-sm font-black transition-colors relative"
                  :class="activeTab === 'manage' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'">
            {{ $t('installments.manage_tabs') }}
            <div v-if="activeTab === 'manage'" class="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></div>
          </button>
          <button @click="activeTab = 'history'" 
                  class="px-6 py-4 text-sm font-black transition-colors relative"
                  :class="activeTab === 'history' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'">
            {{ $t('installments.history_tab') }}
            <div v-if="activeTab === 'history'" class="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></div>
          </button>
        </div>

        <div v-if="loading" class="flex justify-center p-12">
          <svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>

        <!-- Manage Tab -->
        <div v-else-if="activeTab === 'manage'" class="flex-1 overflow-x-auto">
          <table class="w-full text-sm text-center">
            <thead class="text-xs text-gray-500 font-bold bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th scope="col" class="px-6 py-5">{{ $t('installments.customer_name') }}</th>
                <th scope="col" class="px-6 py-5">{{ $t('installments.total_amount') }}</th>
                <th scope="col" class="px-6 py-5">{{ $t('installments.paid') }}</th>
                <th scope="col" class="px-6 py-5">{{ $t('installments.remaining_amount') }}</th>
                <th scope="col" class="px-6 py-5">{{ $t('installments.due_date') }}</th>
                <th scope="col" class="px-6 py-5 w-48">{{ $t('installments.progress') }}</th>
                <th scope="col" class="px-6 py-5">{{ $t('installments.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="plan in plans" :key="plan._id" class="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                <td class="px-6 py-5 font-black text-gray-900">
                  {{ plan.customerId?.name || $t('installments.unknown_customer') }}
                </td>
                <td class="px-6 py-5 font-bold text-gray-600">
                  {{ plan.totalAmount.toFixed(2) }} ريال
                </td>
                <td class="px-6 py-5 font-bold text-gray-600">
                  {{ Math.max(0, plan.totalAmount - plan.remainingAmount).toFixed(2) }} ريال
                </td>
                <td class="px-6 py-5 font-bold text-gray-600">
                  {{ Math.max(0, plan.remainingAmount).toFixed(2) }} ريال
                </td>
                <td class="px-6 py-5 font-bold" :class="isOverdue(getNextDueDateRaw(plan)) ? 'text-rose-500' : 'text-gray-600'">
                  {{ getNextDueDate(plan) }}
                </td>
                <td class="px-6 py-5">
                  <div class="relative w-full h-5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div class="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-500 flex items-center justify-center"
                         :style="{ width: `${Math.min(100, Math.max(0, Math.round(((plan.totalAmount - Math.max(0, plan.remainingAmount)) / plan.totalAmount) * 100)))}%` }">
                    </div>
                    <span class="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white mix-blend-difference drop-shadow-md">
                      {{ Math.min(100, Math.max(0, Math.round(((plan.totalAmount - Math.max(0, plan.remainingAmount)) / plan.totalAmount) * 100))) }}%
                    </span>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <button @click="openPaymentModal(plan)" 
                          :disabled="plan.remainingAmount <= 0"
                          class="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black px-4 py-2 rounded-full transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ $t('installments.pay_installment') }}
                  </button>
                </td>
              </tr>
              
              <tr v-if="plans.length === 0">
                <td colspan="6" class="px-6 py-16 text-center">
                  <div class="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <p class="font-black text-gray-400">{{ $t('installments.no_plans') }}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- History Tab (Dummy Content for now) -->
        <div v-else-if="activeTab === 'history'" class="p-16 text-center text-gray-400 font-bold">
          <svg class="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p>{{ $t('installments.history_dummy') }}</p>
        </div>

        <!-- Pagination -->
        <div class="p-4 border-t border-gray-50 flex items-center justify-start gap-2 bg-white">
          <button class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 border border-gray-200 transition-colors">
            <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <button class="w-8 h-8 rounded-full flex items-center justify-center text-emerald-600 font-black border border-emerald-500 bg-emerald-50">1</button>
          <button class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 border border-gray-200 transition-colors">
            <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Payment Modal (Shows individual installments for the selected plan) -->
    <div v-if="showPaymentModal && selectedPlan" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <div>
            <h3 class="text-xl font-black text-gray-900">{{ $t('installments.record_payment') }}</h3>
            <p class="text-sm font-bold text-gray-500 mt-1">{{ $t('installments.customer') }} {{ selectedPlan.customerId?.name }}</p>
          </div>
          <button @click="closePaymentModal" class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 border border-gray-200 shadow-sm transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div class="p-6 overflow-y-auto bg-gray-50/30 flex-1">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="(inst, idx) in selectedPlan.installments" :key="inst._id" 
                 class="border-2 rounded-2xl p-4 relative transition-colors flex flex-col h-full bg-white shadow-sm hover:border-emerald-200"
                 :class="getInstClass(inst)">
              
              <div class="absolute -top-3 rtl:-right-3 ltr:-left-3 w-8 h-8 font-black text-sm rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                   :class="inst.status === 'Paid' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'">
                {{ idx + 1 }}
              </div>
              
              <div class="flex justify-between items-start mb-4">
                <p class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                   :class="inst.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : (isOverdue(inst.dueDate) ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-500')">
                  {{ inst.status === 'Paid' ? $t('installments.status_paid') : (inst.status === 'Pending' ? $t('installments.status_pending') : inst.status) }}
                </p>
              </div>
              
              <h4 class="text-xl font-black text-gray-900 mb-1">{{ inst.amount.toFixed(2) }}</h4>
              <p class="text-xs font-bold mt-1 mb-4 flex items-center gap-1.5" :class="isOverdue(inst.dueDate) && inst.status === 'Pending' ? 'text-rose-500' : 'text-gray-400'">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                {{ $t('installments.due_in') }} {{ new Date(inst.dueDate).toLocaleDateString() }}
              </p>
              
              <div class="mt-auto">
                <button v-if="inst.status === 'Pending'" @click="payInstallment(selectedPlan._id, inst._id)" 
                        class="w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 transition-all text-gray-700 text-sm font-black py-2.5 rounded-xl flex justify-center items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {{ $t('installments.confirm_payment') }}
                </button>
                <p v-else class="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl font-bold py-2.5 text-center flex justify-center items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  {{ $t('installments.paid_on') }} {{ new Date(inst.paidDate).toLocaleDateString() }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup>
useHead({ title: 'إدارة الأقساط' })

import { ref, computed, onMounted } from 'vue'
const { t } = useI18n()

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { $api } = useNuxtApp()
const plans = ref([])
const loading = ref(true)
const activeTab = ref('manage')

const showPaymentModal = ref(false)
const selectedPlan = ref(null)

const totalRemaining = computed(() => {
  return plans.value.reduce((sum, plan) => sum + plan.remainingAmount, 0)
})

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

const openPaymentModal = (plan) => {
  selectedPlan.value = plan
  showPaymentModal.value = true
}

const closePaymentModal = () => {
  showPaymentModal.value = false
  selectedPlan.value = null
}

const isOverdue = (dateString) => {
  if (!dateString) return false
  return new Date(dateString) < new Date()
}

const getNextDueDateRaw = (plan) => {
  const pending = plan.installments.find(i => i.status === 'Pending')
  return pending ? pending.dueDate : null
}

const getNextDueDate = (plan) => {
  const raw = getNextDueDateRaw(plan)
  return raw ? new Date(raw).toLocaleDateString() : '-'
}

const getInstClass = (inst) => {
  if (inst.status === 'Paid') return 'border-emerald-100 bg-emerald-50/30'
  if (isOverdue(inst.dueDate)) return 'border-rose-200 bg-rose-50/50'
  return 'border-gray-100'
}

const payInstallment = async (planId, instId) => {
  if (!confirm(t('installments.confirm_msg', 'هل أنت متأكد من تأكيد استلام هذه الدفعة؟'))) return

  try {
    await $api(`/finance/installments/${planId}/pay/${instId}`, {
      method: 'POST'
    })
    await fetchPlans()
    
    // Update the selected plan in the modal
    const updatedPlan = plans.value.find(p => p._id === planId)
    if (updatedPlan) {
      selectedPlan.value = updatedPlan
    }
    
    // Check if fully paid, close modal
    if (updatedPlan && updatedPlan.remainingAmount <= 0) {
      closePaymentModal()
    }
  } catch (error) {
    alert('Failed to process payment')
  }
}

onMounted(fetchPlans)
</script>

<style scoped>
.font-sans {
  font-family: 'Cairo', 'Inter', sans-serif;
}
</style>
