<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ $t('suppliers.title') }}</h2>
      <div class="flex space-x-3 space-x-reverse mt-4 sm:mt-0">
        <NuxtLink to="/" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 shadow-sm transition-colors flex items-center">
          <svg class="w-4 h-4 me-2 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          {{ $t('suppliers.dashboard') }}
        </NuxtLink>
        <button @click="openAddModal" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center text-sm">
          <svg class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          {{ $t('suppliers.add_supplier') }}
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center">
        <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-4">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        </div>
        <div>
          <p class="text-sm font-bold text-gray-500 uppercase">{{ $t('suppliers.total_suppliers') }}</p>
          <p class="text-2xl font-black text-gray-900">{{ suppliers.length }}</p>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center">
        <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-4">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div>
          <p class="text-sm font-bold text-gray-500 uppercase">{{ $t('suppliers.total_payable') }}</p>
          <p class="text-2xl font-black text-red-600">${{ totalPayable.toFixed(2) }}</p>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <input v-model="searchQuery" type="text" class="block w-full ps-10 pe-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all" :placeholder="$t('suppliers.search_placeholder')">
      </div>
    </div>

    <!-- Suppliers Grid -->
    <div v-if="loading" class="flex justify-center p-12">
      <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="supplier in filteredSuppliers" :key="supplier._id" class="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 relative">
        <div class="flex justify-between items-start mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-xl uppercase">
              {{ supplier.name.charAt(0) }}
            </div>
            <div>
              <h3 class="font-bold text-gray-900 text-lg leading-tight">{{ supplier.name }}</h3>
              <p class="text-sm text-gray-500 font-medium">{{ supplier.contactPerson || $t('suppliers.no_contact') }}</p>
            </div>
          </div>
          <button @click="openEditModal(supplier)" class="text-gray-400 hover:text-indigo-600 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          </button>
        </div>
        
        <div class="space-y-2 mb-6 pt-2 border-t border-gray-100">
          <p class="text-sm text-gray-600 flex items-center"><svg class="w-4 h-4 me-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg> {{ supplier.phone || $t('suppliers.n_a') }}</p>
          <p class="text-sm text-gray-600 flex items-center"><svg class="w-4 h-4 me-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> {{ supplier.email || $t('suppliers.n_a') }}</p>
          <p class="text-sm text-gray-600 flex items-start"><svg class="w-4 h-4 me-2 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> <span class="truncate">{{ supplier.address || $t('suppliers.n_a') }}</span></p>
        </div>

        <div class="bg-gray-50 rounded-xl p-4 border border-gray-100 flex justify-between items-center">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase">{{ $t('suppliers.balance_due') }}</p>
            <p class="text-xl font-black" :class="supplier.balanceDue > 0 ? 'text-red-600' : 'text-emerald-600'">${{ supplier.balanceDue.toFixed(2) }}</p>
          </div>
          <button v-if="supplier.balanceDue > 0" @click="openPayModal(supplier)" class="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            {{ $t('suppliers.make_payment') }}
          </button>
        </div>
      </div>
      
      <div v-if="filteredSuppliers.length === 0" class="col-span-full bg-white p-8 text-center rounded-2xl border border-gray-200 shadow-sm text-gray-500">
        {{ $t('suppliers.no_suppliers_found') }}
      </div>
    </div>

    <!-- Supplier Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-900">{{ isEditing ? $t('suppliers.edit_supplier') : $t('suppliers.add_supplier') }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="p-6">
          <form @submit.prevent="saveSupplier" class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('suppliers.company_name') }}</label>
              <input v-model="form.name" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('suppliers.contact_person') }}</label>
              <input v-model="form.contactPerson" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('suppliers.phone') }}</label>
                <input v-model="form.phone" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('suppliers.email') }}</label>
                <input v-model="form.email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
              </div>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('suppliers.address') }}</label>
              <textarea v-model="form.address" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>
            <div class="flex justify-end space-x-3 space-x-reverse pt-4 border-t">
              <button type="button" @click="showModal = false" class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50">{{ $t('suppliers.cancel') }}</button>
              <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">{{ $t('suppliers.save_supplier') }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Pay Balance Modal -->
    <div v-if="showPayModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-900">{{ $t('suppliers.make_payment') }}</h3>
          <button @click="showPayModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="p-6">
          <div class="mb-4 text-center">
            <p class="text-sm text-gray-500 font-bold uppercase">{{ activeSupplier?.name }}</p>
            <p class="text-3xl font-black text-red-600">${{ activeSupplier?.balanceDue.toFixed(2) }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ $t('suppliers.current_balance_due') }}</p>
          </div>
          <form @submit.prevent="submitPayment" class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('suppliers.payment_amount') }}</label>
              <input v-model="payForm.amount" type="number" step="0.01" min="0.01" :max="activeSupplier?.balanceDue" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-lg font-bold text-center">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('suppliers.notes_reference') }}</label>
              <input v-model="payForm.notes" type="text" :placeholder="$t('suppliers.e_g_wire_transfer')" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div class="pt-2">
              <button type="submit" class="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 flex justify-center items-center">
                {{ $t('suppliers.submit_payment') }}
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
useHead({ title: 'Suppliers' })

import { ref, computed, onMounted } from 'vue'

definePageMeta({ 
  layout: 'dashboard',
  middleware: ['auth', 'module-guard'],
  requiredModule: 'inventory'
})

const { $api } = useNuxtApp()
const suppliers = ref([])
const loading = ref(true)
const searchQuery = ref('')

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const form = ref({ name: '', contactPerson: '', phone: '', email: '', address: '' })

const showPayModal = ref(false)
const activeSupplier = ref(null)
const payForm = ref({ amount: '', notes: '' })

const fetchSuppliers = async () => {
  loading.value = true
  try {
    suppliers.value = await $api('/suppliers')
  } catch (error) {
    alert('Failed to load suppliers')
  } finally {
    loading.value = false
  }
}

const filteredSuppliers = computed(() => {
  if (!searchQuery.value) return suppliers.value
  const q = searchQuery.value.toLowerCase()
  return suppliers.value.filter(s => 
    s.name.toLowerCase().includes(q) || 
    (s.contactPerson && s.contactPerson.toLowerCase().includes(q))
  )
})

const totalPayable = computed(() => suppliers.value.reduce((sum, s) => sum + s.balanceDue, 0))

const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = { name: '', contactPerson: '', phone: '', email: '', address: '' }
  showModal.value = true
}

const openEditModal = (supplier) => {
  isEditing.value = true
  editingId.value = supplier._id
  form.value = { 
    name: supplier.name, 
    contactPerson: supplier.contactPerson, 
    phone: supplier.phone, 
    email: supplier.email, 
    address: supplier.address 
  }
  showModal.value = true
}

const saveSupplier = async () => {
  try {
    if (isEditing.value) {
      await $api(`/suppliers/${editingId.value}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      await $api('/suppliers', {
        method: 'POST',
        body: form.value
      })
    }
    showModal.value = false
    fetchSuppliers()
  } catch (error) {
    alert('Failed to save supplier')
  }
}

const openPayModal = (supplier) => {
  activeSupplier.value = supplier
  payForm.value = { amount: supplier.balanceDue, notes: '' }
  showPayModal.value = true
}

const submitPayment = async () => {
  try {
    await $api(`/suppliers/${activeSupplier.value._id}/pay`, {
      method: 'POST',
      body: payForm.value
    })
    showPayModal.value = false
    fetchSuppliers()
    alert(useNuxtApp().$i18n.t('suppliers.payment_success'))
  } catch (error) {
    alert(useNuxtApp().$i18n.t('suppliers.failed_payment'))
  }
}

onMounted(fetchSuppliers)
</script>
