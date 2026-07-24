<template>
  <div class="p-4 lg:p-8 max-w-7xl mx-auto">
    
    <!-- Header -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-black text-gray-900 tracking-tight">{{ $t('debts.title') }}</h1>
        <p class="text-gray-500 mt-1 text-sm">{{ $t('debts.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-100 flex items-center gap-2">
          <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span class="text-sm font-bold">{{ $t('debts.balance') }}: ${{ totalOutstanding.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-start">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider font-bold">
              <th class="py-4 px-6 text-start">{{ $t('debts.customer') }}</th>
              <th class="py-4 px-6 text-start">{{ $t('debts.phone') }}</th>
              <th class="py-4 px-6 text-start">{{ $t('debts.balance') }}</th>
              <th class="py-4 px-6 text-start">{{ $t('debts.last_updated') }}</th>
              <th class="py-4 px-6 text-end">{{ $t('debts.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="5" class="py-12 text-center text-gray-400">Loading...</td>
            </tr>
            <tr v-else-if="debtors.length === 0">
              <td colspan="5" class="py-12 text-center text-gray-400">{{ $t('debts.no_debts') }}</td>
            </tr>
            <tr v-for="debtor in debtors" :key="debtor._id" class="hover:bg-gray-50/50 transition-colors group">
              <td class="py-4 px-6">
                <div class="font-bold text-gray-900">{{ debtor.name }}</div>
              </td>
              <td class="py-4 px-6 text-gray-600 font-mono text-sm">
                {{ debtor.phone || '-' }}
              </td>
              <td class="py-4 px-6">
                <div class="font-bold text-red-600">${{ debtor.totalDebt.toFixed(2) }}</div>
              </td>
              <td class="py-4 px-6 text-gray-500 text-sm">
                {{ new Date(debtor.updatedAt).toLocaleDateString() }}
              </td>
              <td class="py-4 px-6 text-end">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="openHistory(debtor)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" :title="$t('debts.view_history')">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </button>
                  <button @click="openPayment(debtor)" class="p-2 text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors" :title="$t('debts.record_payment')">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Record Payment Modal -->
    <div v-if="paymentModalOpen" class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" @click.stop>
        <div class="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-black">{{ $t('debts.record_payment') }} - {{ selectedDebtor?.name }}</h3>
          <button @click="paymentModalOpen = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <form @submit.prevent="submitPayment" class="p-6 space-y-4">
          
          <div class="bg-red-50 p-4 rounded-xl border border-red-100 flex justify-between items-center">
             <span class="text-sm font-bold text-red-700">{{ $t('debts.balance') }}:</span>
             <span class="text-lg font-black text-red-700">${{ selectedDebtor?.totalDebt.toFixed(2) }}</span>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1.5">{{ $t('debts.payment_amount') }}</label>
            <input type="number" v-model="paymentForm.amount" step="0.01" min="0.01" :max="selectedDebtor?.totalDebt" required class="w-full border-gray-300 rounded-xl focus:ring-secondary-500 focus:border-secondary-500">
          </div>
          
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1.5">{{ $t('debts.payment_method') }}</label>
            <select v-model="paymentForm.paymentMethod" class="w-full border-gray-300 rounded-xl focus:ring-secondary-500 focus:border-secondary-500">
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Check">Check</option>
              <option value="Transfer">Transfer</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1.5">{{ $t('debts.notes') }}</label>
            <textarea v-model="paymentForm.notes" rows="2" class="w-full border-gray-300 rounded-xl focus:ring-secondary-500 focus:border-secondary-500"></textarea>
          </div>

          <div class="pt-2 flex justify-end gap-3">
            <button type="button" @click="paymentModalOpen = false" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              {{ $t('general.cancel') }}
            </button>
            <button type="submit" :disabled="submitting" class="px-5 py-2.5 text-sm font-bold text-white bg-secondary-600 hover:bg-secondary-700 rounded-xl transition-colors disabled:opacity-50">
              {{ submitting ? '...' : $t('general.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- History Modal -->
    <div v-if="historyModalOpen" class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]" @click.stop>
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
             <h3 class="text-lg font-black">{{ $t('debts.history_title') }}</h3>
             <p class="text-sm text-gray-500 mt-1">{{ selectedDebtor?.name }}</p>
          </div>
          <button @click="historyModalOpen = false" class="p-2 bg-white text-gray-400 hover:text-gray-600 rounded-full shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6">
           <div v-if="historyLoading" class="text-center py-8 text-gray-400">Loading...</div>
           <div v-else-if="historyLogs.length === 0" class="text-center py-8 text-gray-400">No records found.</div>
           
           <div v-else class="space-y-4">
              <div v-for="log in historyLogs" :key="log._id" class="p-4 rounded-xl border flex items-center justify-between" :class="log.type === 'payment' ? 'bg-secondary-50 border-secondary-100' : 'bg-red-50 border-red-100'">
                 <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="log.type === 'payment' ? 'bg-secondary-100 text-secondary-600' : 'bg-red-100 text-red-600'">
                       <svg v-if="log.type === 'payment'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                       <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    </div>
                    <div>
                       <div class="font-bold text-gray-900">{{ log.type === 'payment' ? $t('debts.payment') : $t('debts.charge') }}</div>
                       <div class="text-xs text-gray-500 mt-0.5">{{ new Date(log.date).toLocaleString() }}</div>
                       <div v-if="log.notes" class="text-sm text-gray-600 mt-1 italic">{{ log.notes }}</div>
                       <div v-if="log.orderId" class="text-sm text-primary-600 mt-1 font-mono">Order: {{ log.orderId.orderNumber }}</div>
                    </div>
                 </div>
                 <div class="text-end">
                    <div class="font-black text-lg" :class="log.type === 'payment' ? 'text-secondary-600' : 'text-red-600'">
                       {{ log.type === 'payment' ? '-' : '+' }}${{ log.amount.toFixed(2) }}
                    </div>
                    <div class="text-xs text-gray-500 font-bold mt-1 uppercase">{{ log.paymentMethod }}</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { $api } = useNuxtApp()
const debtors = ref([])
const loading = ref(true)

const paymentModalOpen = ref(false)
const selectedDebtor = ref(null)
const submitting = ref(false)
const paymentForm = ref({
  amount: 0,
  paymentMethod: 'Cash',
  notes: ''
})

const historyModalOpen = ref(false)
const historyLoading = ref(false)
const historyLogs = ref([])

onMounted(() => {
  fetchDebtors()
})

const fetchDebtors = async () => {
  loading.value = true
  try {
    const res = await $api.get('/customers')
    // Filter out customers with 0 or negative debt
    debtors.value = res.data.filter(c => (c.totalDebt || 0) > 0)
  } catch (error) {
    console.error('Error fetching debtors:', error)
  } finally {
    loading.value = false
  }
}

const totalOutstanding = computed(() => {
  return debtors.value.reduce((sum, d) => sum + (d.totalDebt || 0), 0)
})

const openPayment = (debtor) => {
  selectedDebtor.value = debtor
  paymentForm.value = {
    amount: debtor.totalDebt,
    paymentMethod: 'Cash',
    notes: ''
  }
  paymentModalOpen.value = true
}

const submitPayment = async () => {
  if (!selectedDebtor.value || paymentForm.value.amount <= 0) return
  submitting.value = true
  try {
    await $api.post('/customers/debt-adjust', {
      customerId: selectedDebtor.value._id,
      type: 'payment',
      amount: paymentForm.value.amount,
      paymentMethod: paymentForm.value.paymentMethod,
      notes: paymentForm.value.notes
    })
    paymentModalOpen.value = false
    await fetchDebtors()
  } catch (error) {
    console.error('Error recording payment:', error)
    alert('Error recording payment')
  } finally {
    submitting.value = false
  }
}

const openHistory = async (debtor) => {
  selectedDebtor.value = debtor
  historyModalOpen.value = true
  historyLoading.value = true
  try {
    const res = await $api.get(`/customers/${debtor._id}/debt-logs`)
    historyLogs.value = res.data
  } catch (error) {
    console.error('Error fetching history:', error)
  } finally {
    historyLoading.value = false
  }
}
</script>
