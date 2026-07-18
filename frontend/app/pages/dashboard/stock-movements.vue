<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ $t('stock_movements.title') }}</h2>
      <div class="flex flex-wrap gap-3 mt-4 sm:mt-0 flex-row-reverse">
        <NuxtLink to="/" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 shadow-sm transition-colors flex items-center">
          <svg class="w-4 h-4 me-2 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          {{ $t('stock_movements.dashboard') }}
        </NuxtLink>
        <button @click="openAddStockModal" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-sm flex items-center text-sm">
          <svg class="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          {{ $t('stock_movements.restock_in') }}
        </button>
        <button @click="openRemoveStockModal" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-sm flex items-center text-sm">
          <svg class="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
          {{ $t('stock_movements.adjust_out') }}
        </button>
      </div>
    </div>

    <!-- Movements Log -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 class="font-bold text-gray-900">{{ $t('stock_movements.historical_log') }}</h3>
      </div>
      
      <div v-if="loading" class="flex justify-center p-8">
        <svg class="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 sm:px-6 sm:py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('stock_movements.date') }}</th>
              <th class="px-4 py-3 sm:px-6 sm:py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('stock_movements.type') }}</th>
              <th class="px-4 py-3 sm:px-6 sm:py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('stock_movements.product') }}</th>
              <th class="px-4 py-3 sm:px-6 sm:py-4 text-end text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('stock_movements.quantity') }}</th>
              <th class="px-4 py-3 sm:px-6 sm:py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('stock_movements.reason_reference') }}</th>
              <th class="px-4 py-3 sm:px-6 sm:py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('stock_movements.performed_by') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="m in movements" :key="m._id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{{ new Date(m.date).toLocaleString() }}</td>
              <td class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                <span v-if="m.type === 'in'" class="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">{{ $t('stock_movements.in_restock') }}</span>
                <span v-else-if="m.type === 'out'" class="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-200">{{ $t('stock_movements.out_sale') }}</span>
                <span v-else class="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full border border-red-200">{{ $t('stock_movements.adjust_loss') }}</span>
              </td>
              <td class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900">{{ m.productId?.name || $t('stock_movements.unknown') }}</td>
              <td class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-end font-bold" :class="{'text-emerald-600': m.type === 'in', 'text-red-600': m.type !== 'in'}">
                {{ m.type === 'in' ? '+' : '-' }}{{ m.quantity }}
              </td>
              <td class="px-4 py-3 sm:px-6 sm:py-4 text-sm text-gray-500">
                <p>{{ m.reason || $t('stock_movements.n_a') }}</p>
                <p v-if="m.supplierId" class="text-xs text-indigo-600 font-bold mt-1">{{ $t('stock_movements.supplier') }} {{ m.supplierId.name }}</p>
                <p v-if="m.referenceNumber" class="text-xs">{{ $t('stock_movements.ref') }} {{ m.referenceNumber }}</p>
              </td>
              <td class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">{{ m.performedBy?.name || $t('stock_movements.system') }}</td>
            </tr>
            <tr v-if="movements.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">{{ $t('stock_movements.no_movements') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Stock Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
          <h3 class="text-lg font-bold text-gray-900">{{ $t('stock_movements.restock_product') }}</h3>
          <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-600"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>
        <div class="p-6 overflow-y-auto flex-1">
          <form @submit.prevent="submitAddStock" class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('stock_movements.select_product') }}</label>
              <select v-model="addForm.productId" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
                <option v-for="p in products" :key="p._id" :value="p._id">{{ p.name }} ({{ $t('stock_movements.current') }} {{ p.stockQuantity }})</option>
              </select>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('stock_movements.quantity_added') }}</label>
                <input v-model="addForm.quantity" type="number" min="1" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('stock_movements.unit_cost') }}</label>
                <input v-model="addForm.unitCost" type="number" step="0.01" min="0" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('stock_movements.supplier_label') }}</label>
              <select v-model="addForm.supplierId" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
                <option :value="null">{{ $t('stock_movements.none_direct_add') }}</option>
                <option v-for="s in suppliers" :key="s._id" :value="s._id">{{ s.name }}</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('stock_movements.reference_invoice') }}</label>
                <input v-model="addForm.referenceNumber" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('stock_movements.payment_method') }}</label>
                <select v-model="addForm.paymentMethod" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="Cash">{{ $t('stock_movements.cash_immediate') }}</option>
                  <option value="Credit" :disabled="!addForm.supplierId">{{ $t('stock_movements.credit_accounts_payable') }}</option>
                </select>
              </div>
            </div>

            <div v-if="addForm.quantity && addForm.unitCost" class="p-3 bg-indigo-50 text-indigo-900 rounded-xl text-sm font-bold border border-indigo-100 flex justify-between">
              <span>{{ $t('stock_movements.total_purchase_cost') }}</span>
              <span>${{ (addForm.quantity * addForm.unitCost).toFixed(2) }}</span>
            </div>

            <button type="submit" class="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 mt-4">{{ $t('stock_movements.confirm_restock') }}</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Remove Stock Modal -->
    <div v-if="showRemoveModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
          <h3 class="text-lg font-bold text-red-600">{{ $t('stock_movements.inventory_adjustment') }}</h3>
          <button @click="showRemoveModal = false" class="text-gray-400 hover:text-gray-600"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>
        <div class="p-6 overflow-y-auto flex-1">
          <div class="mb-4 text-xs font-medium text-gray-500 bg-gray-100 p-3 rounded-lg">
            {{ $t('stock_movements.write_off_notice') }}
          </div>
          <form @submit.prevent="submitRemoveStock" class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('stock_movements.select_product') }}</label>
              <select v-model="removeForm.productId" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
                <option v-for="p in products" :key="p._id" :value="p._id">{{ p.name }} ({{ $t('stock_movements.available') }} {{ p.stockQuantity }})</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('stock_movements.quantity_lost') }}</label>
              <input v-model="removeForm.quantity" type="number" min="1" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('stock_movements.reason_write_off') }}</label>
              <select v-model="removeForm.reason" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 mb-2">
                <option value="Damaged Goods">{{ $t('stock_movements.damaged_goods') }}</option>
                <option value="Expired Stock">{{ $t('stock_movements.expired_stock') }}</option>
                <option value="Inventory Audit Loss">{{ $t('stock_movements.inventory_audit_loss') }}</option>
                <option value="Theft">{{ $t('stock_movements.theft') }}</option>
                <option value="Other">{{ $t('stock_movements.other') }}</option>
              </select>
            </div>

            <button type="submit" class="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 mt-4">{{ $t('stock_movements.confirm_write_off') }}</button>
          </form>
        </div>
      </div>
    </div>

    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Stock Movements' })

import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

definePageMeta({ 
  layout: 'dashboard',
  middleware: ['auth', 'module-guard'],
  requiredModule: 'inventory'
})

const route = useRoute()
const { $api } = useNuxtApp()
const movements = ref([])
const products = ref([])
const suppliers = ref([])
const loading = ref(true)

const showAddModal = ref(false)
const showRemoveModal = ref(false)

const addForm = ref({ productId: '', quantity: '', unitCost: '', supplierId: null, referenceNumber: '', paymentMethod: 'Cash' })
const removeForm = ref({ productId: '', quantity: '', reason: 'Damaged Goods' })

const fetchData = async () => {
  loading.value = true
  try {
    const [movData, prodData, supData] = await Promise.all([
      $api('/inventory/movements'),
      $api('/inventory/products'),
      $api('/suppliers')
    ])
    movements.value = movData
    products.value = prodData
    suppliers.value = supData
  } catch (error) {
    alert(useNuxtApp().$i18n.t('stock_movements.failed_load'))
  } finally {
    loading.value = false
  }
}

// Auto-fill unit cost when product is selected in Add Modal
watch(() => addForm.value.productId, (newId) => {
  if (newId) {
    const prod = products.value.find(p => p._id === newId)
    if (prod) {
      addForm.value.unitCost = prod.purchasePrice || 0
    }
  }
})

const openAddStockModal = () => {
  addForm.value = { productId: '', quantity: '', unitCost: '', supplierId: null, referenceNumber: '', paymentMethod: 'Cash' }
  
  // If we came from Inventory quick restock
  if (route.query.restockProductId) {
    addForm.value.productId = route.query.restockProductId
  }
  
  showAddModal.value = true
}

const openRemoveStockModal = () => {
  removeForm.value = { productId: '', quantity: '', reason: 'Damaged Goods' }
  showRemoveModal.value = true
}

const submitAddStock = async () => {
  try {
    await $api('/inventory/movements/add', {
      method: 'POST',
      body: addForm.value
    })
    showAddModal.value = false
    fetchData() // Refresh logs and stock
    alert(useNuxtApp().$i18n.t('stock_movements.restock_success'))
  } catch (error) {
    alert(useNuxtApp().$i18n.t('stock_movements.failed_add') + ' ' + (error.data?.message || 'Unknown error'))
  }
}

const submitRemoveStock = async () => {
  try {
    await $api('/inventory/movements/remove', {
      method: 'POST',
      body: removeForm.value
    })
    showRemoveModal.value = false
    fetchData()
    alert(useNuxtApp().$i18n.t('stock_movements.write_off_success'))
  } catch (error) {
    alert(useNuxtApp().$i18n.t('stock_movements.failed_remove') + ' ' + (error.data?.message || 'Unknown error'))
  }
}

onMounted(() => {
  fetchData().then(() => {
    // If navigated via Quick Restock, open modal automatically
    if (route.query.restockProductId) {
      openAddStockModal()
    }
  })
})
</script>
