<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
      <h2 class="text-2xl font-black text-gray-900 tracking-tight truncate">{{ $t('crm.title') }}</h2>
      <div class="flex flex-row flex-nowrap gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 shrink-0">
        <NuxtLink to="/" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 shadow-sm transition-colors flex items-center">
          <svg class="w-4 h-4 me-2 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          {{ $t('crm.dashboard') }}
        </NuxtLink>
        <button @click="openAddModal" class="bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-white px-4 py-2 shrink-0 whitespace-nowrap rounded-xl font-bold transition-all shadow-sm flex items-center text-sm">
          <svg class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          {{ $t('crm.add_customer') }}
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 ps-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <input v-model="searchQuery" type="text" class="block w-full ps-10 pe-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all" :placeholder="$t('crm.search_placeholder')">
      </div>
    </div>

    <!-- Customers Grid -->
    <div v-if="loading" class="flex justify-center p-12">
      <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="customer in filteredCustomers" :key="customer._id" class="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 relative">
        <div class="flex justify-between items-start mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xl uppercase">
              {{ customer.name.charAt(0) }}
            </div>
            <div>
              <h3 class="font-bold text-gray-900 text-lg leading-tight">{{ customer.name }}</h3>
              <p class="text-sm text-gray-500">{{ customer.phone || $t('crm.no_phone') }}</p>
            </div>
          </div>
          <button @click="openEditModal(customer)" class="text-gray-400 hover:text-indigo-600 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          </button>
        </div>
        
        <div class="space-y-2 mb-6">
          <p class="text-sm text-gray-600 flex items-center"><svg class="w-4 h-4 me-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> {{ customer.email || $t('crm.no_email') }}</p>
          <p class="text-sm text-gray-600 flex items-start"><svg class="w-4 h-4 me-2 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> <span class="truncate">{{ customer.address || $t('crm.no_address') }}</span></p>
        </div>

        <div class="bg-gray-50 rounded-xl p-4 border border-gray-100 flex justify-between items-center">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase">{{ $t('crm.outstanding_debt') }}</p>
            <p class="text-xl font-black" :class="customer.totalDebt > 0 ? 'text-red-600' : 'text-emerald-600'">${{ customer.totalDebt.toFixed(2) }}</p>
          </div>
          <button @click="openDebtModal(customer)" class="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            {{ $t('crm.settle') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Customer Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
          <h3 class="text-lg font-bold text-gray-900">{{ isEditing ? $t('crm.edit_customer') : $t('crm.add_customer') }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="p-6 overflow-y-auto flex-1">
          <form @submit.prevent="saveCustomer" class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('crm.full_name') }}</label>
              <input v-model="form.name" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('crm.phone') }}</label>
                <input v-model="form.phone" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('crm.email') }}</label>
                <input v-model="form.email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
              </div>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('crm.address') }}</label>
              <textarea v-model="form.address" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t">
              <button type="button" @click="showModal = false" class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50">{{ $t('crm.cancel') }}</button>
              <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">{{ $t('crm.save_customer') }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Debt Settlement Modal -->
    <div v-if="showDebtModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 class="text-lg font-bold text-gray-900">{{ $t('crm.manage_debt') }} {{ activeCustomer?.name }}</h3>
            <p class="text-sm text-gray-500 mt-0.5">{{ $t('crm.current_balance') }} <span class="font-bold text-red-600">${{ activeCustomer?.totalDebt.toFixed(2) }}</span></p>
          </div>
          <button @click="showDebtModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6 bg-gray-50">
          <h4 class="text-sm font-bold text-gray-700 uppercase mb-3">{{ $t('crm.ledger_history') }}</h4>
          <div v-if="debtLogs.length === 0" class="text-center p-4 text-gray-500 text-sm">{{ $t('crm.no_debt_records') }}</div>
          <div class="space-y-3">
            <div v-for="log in debtLogs" :key="log._id" class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
              <div>
                <p class="font-bold text-gray-900 text-sm flex items-center">
                  <span v-if="log.type === 'charge'" class="w-2 h-2 rounded-full bg-red-500 me-2"></span>
                  <span v-else class="w-2 h-2 rounded-full bg-emerald-500 me-2"></span>
                  {{ log.type === 'charge' ? $t('crm.debt_added') : $t('crm.payment_received') }}
                </p>
                <p class="text-xs text-gray-500 mt-1">{{ new Date(log.date).toLocaleString() }} &bull; {{ log.notes || (log.orderId ? `Order ${log.orderId.orderNumber}` : $t('crm.manual_entry')) }}</p>
                <p class="text-xs font-medium text-gray-500 mt-0.5">{{ $t('crm.method') }} {{ log.paymentMethod }}</p>
              </div>
              <div class="text-end">
                <span class="font-black text-lg" :class="log.type === 'charge' ? 'text-red-600' : 'text-emerald-600'">
                  {{ log.type === 'charge' ? '+' : '-' }}${{ log.amount.toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 bg-white border-t border-gray-100">
          <form @submit.prevent="submitDebtAdjustment" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('crm.transaction_type') }}</label>
                <select v-model="debtForm.type" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="payment">{{ $t('crm.receive_payment') }}</option>
                  <option value="charge">{{ $t('crm.manual_charge') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('crm.amount') }}</label>
                <input v-model="debtForm.amount" type="number" step="0.01" min="0.01" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
               <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('crm.payment_method') }}</label>
                <select v-model="debtForm.paymentMethod" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="Cash">{{ $t('crm.cash') }}</option>
                  <option value="Card">{{ $t('crm.bank_transfer') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('crm.notes') }}</label>
                <input v-model="debtForm.notes" type="text" :placeholder="$t('crm.notes_placeholder')" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
              </div>
            </div>
            
            <div class="flex justify-end gap-3 pt-2">
              <button type="submit" class="px-5 py-2.5 text-white rounded-xl font-bold w-full" :class="debtForm.type === 'payment' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'">
                {{ debtForm.type === 'payment' ? $t('crm.process_payment') : $t('crm.add_debt_charge') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Customers' })

import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { $api } = useNuxtApp()
const customers = ref([])
const loading = ref(true)
const searchQuery = ref('')

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const form = ref({ name: '', phone: '', email: '', address: '' })

const showDebtModal = ref(false)
const activeCustomer = ref(null)
const debtLogs = ref([])
const debtForm = ref({ type: 'payment', amount: '', notes: '', paymentMethod: 'Cash' })

const fetchCustomers = async () => {
  loading.value = true
  try {
    customers.value = await $api('/customers')
  } catch (error) {
    alert('Failed to load customers')
  } finally {
    loading.value = false
  }
}

const filteredCustomers = computed(() => {
  if (!searchQuery.value) return customers.value
  const q = searchQuery.value.toLowerCase()
  return customers.value.filter(c => 
    c.name.toLowerCase().includes(q) || 
    (c.phone && c.phone.includes(q)) || 
    (c.email && c.email.toLowerCase().includes(q))
  )
})

const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = { name: '', phone: '', email: '', address: '' }
  showModal.value = true
}

const openEditModal = (customer) => {
  isEditing.value = true
  editingId.value = customer._id
  form.value = { name: customer.name, phone: customer.phone, email: customer.email, address: customer.address }
  showModal.value = true
}

const saveCustomer = async () => {
  try {
    if (isEditing.value) {
      await $api(`/customers/${editingId.value}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      await $api('/customers', {
        method: 'POST',
        body: form.value
      })
    }
    showModal.value = false
    fetchCustomers()
  } catch (error) {
    alert('Failed to save customer')
  }
}

const fetchDebtLogs = async (customerId) => {
  try {
    debtLogs.value = await $api(`/customers/${customerId}/debt-logs`)
  } catch (error) {
    console.error('Failed to load debt logs')
  }
}

const openDebtModal = (customer) => {
  activeCustomer.value = customer
  debtForm.value = { type: 'payment', amount: '', notes: '', paymentMethod: 'Cash' }
  fetchDebtLogs(customer._id)
  showDebtModal.value = true
}

const submitDebtAdjustment = async () => {
  try {
    await $api('/customers/debt-adjust', {
      method: 'POST',
      body: {
        customerId: activeCustomer.value._id,
        ...debtForm.value
      }
    })
    
    // Refresh
    await fetchCustomers()
    // Update active customer reference from the fresh list
    activeCustomer.value = customers.value.find(c => c._id === activeCustomer.value._id)
    await fetchDebtLogs(activeCustomer.value._id)
    
    debtForm.value = { type: 'payment', amount: '', notes: '', paymentMethod: 'Cash' }
    alert('Debt adjustment processed successfully!')
  } catch (error) {
    alert('Failed to process debt adjustment')
  }
}

onMounted(fetchCustomers)
</script>
