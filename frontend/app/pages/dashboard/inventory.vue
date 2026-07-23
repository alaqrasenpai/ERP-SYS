<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">{{ $t('inventory.title') }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ $t('inventory.description') }}</p>
        </div>
        <div class="flex flex-row flex-nowrap gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 shrink-0">
          <NuxtLink to="/" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">{{ $t('general.dashboard') }}</NuxtLink>
          <div class="flex items-center gap-3" v-if="hasPermission('inventory:write')">
            <button @click="showCategoryModal = true" class="px-4 py-2 bg-white border border-gray-100 hover:border-gray-300 text-gray-700 rounded-xl font-bold shadow-sm transition-all flex items-center">
              <svg class="w-4 h-4 me-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
              {{ $t('inventory.categories') }}
            </button>
            <button @click="openAddModal" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center">
              <svg class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              {{ $t('inventory.add_product') }}
            </button>
          </div>
        </div>
      </div>

      <!-- WMS Summary Widget -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
           <div class="flex items-center justify-between">
              <div>
                 <p class="text-sm font-medium text-gray-500">{{ $t('inventory.total_products') }}</p>
                 <p class="text-2xl font-bold text-gray-900">{{ products.length }}</p>
              </div>
              <div class="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                 <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
           </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
           <div class="flex items-center justify-between">
              <div>
                 <p class="text-sm font-medium text-gray-500">{{ $t('inventory.low_stock_items') }}</p>
                 <p class="text-2xl font-bold" :class="lowStockCount > 0 ? 'text-red-600' : 'text-green-600'">{{ lowStockCount }}</p>
              </div>
              <div class="p-3 rounded-lg" :class="lowStockCount > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'">
                 <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
           </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
           <div class="flex items-center justify-between">
              <div>
                 <p class="text-sm font-medium text-gray-500">{{ $t('inventory.total_inventory_value') }}</p>
                 <p class="text-2xl font-bold text-gray-900">${{ totalInventoryValue.toFixed(2) }}</p>
              </div>
              <div class="p-3 bg-green-50 text-green-600 rounded-lg">
                 <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
           </div>
        </div>
      </div>

      <!-- Action Bar (Search & Filters) -->
      <div class="bg-white p-4 rounded-t-xl border border-gray-100 border-b-0 flex justify-between items-center">
        <div class="relative w-full max-w-md">
          <div class="absolute inset-y-0 left-0 ps-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input v-model="searchQuery" type="text" :placeholder="$t('inventory.search_placeholder')" class="block w-full ps-10 pe-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out">
        </div>
        <div class="text-sm text-gray-500 font-medium ms-4">
          {{ $t('inventory.showing_products', { count: filteredProducts.length }) }}
        </div>
      </div>

      <!-- Products Table -->
      <div class="bg-white shadow-sm border border-gray-100 rounded-b-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-4 py-3 sm:px-6 sm:py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('inventory.product_info') }}</th>
                <th scope="col" class="px-4 py-3 sm:px-6 sm:py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('inventory.sku_barcode') }}</th>
                <th scope="col" class="px-4 py-3 sm:px-6 sm:py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('inventory.price_buy_sell') }}</th>
                <th scope="col" class="px-4 py-3 sm:px-6 sm:py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('inventory.stock_uom') }}</th>
                <th scope="col" class="px-4 py-3 sm:px-6 sm:py-4 text-end text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('inventory.actions') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="product in filteredProducts" :key="product._id" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                  <div class="text-sm font-semibold text-gray-900">{{ product.name }}</div>
                  <div class="text-xs text-indigo-600 font-medium">{{ product.category || $t('inventory.uncategorized') }}</div>
                </td>
                <td class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  <div>SKU: {{ product.sku }}</div>
                  <div v-if="product.barcode" class="text-xs text-gray-400">BC: {{ product.barcode }}</div>
                </td>
                <td class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900">${{ product.unitPrice.toFixed(2) }}</div>
                  <div class="text-xs text-gray-500">{{ $t('inventory.buy') }} ${{ (product.purchasePrice || 0).toFixed(2) }}</div>
                </td>
                <td class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm">
                  <div class="flex items-center">
                    <span v-if="product.stockQuantity === 0" class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border me-2 bg-red-600 text-white border-red-700 uppercase">
                      {{ $t('inventory.out_of_stock') }}
                    </span>
                    <span v-else class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border me-2" 
                          :class="product.stockQuantity > (product.alertQuantity || 10) ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'">
                      {{ product.stockQuantity }} {{ $t(`inventory.${(product.uom || 'Piece').toLowerCase()}`) }}
                    </span>
                    <span v-if="product.stockQuantity > 0 && product.stockQuantity <= (product.alertQuantity || 10)" class="text-red-500" title="Low Stock Warning">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </span>
                  </div>
                </td>
                  <td class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-end text-sm font-medium">
              <div class="flex items-center justify-end gap-2">
                    <button v-if="hasPermission('inventory:write')" @click="openEditModal(product)" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg font-bold transition-colors">{{ $t('inventory.edit') }}</button>
                    <button v-if="hasPermission('inventory:write')" @click="deleteProduct(product._id)" class="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1.5 rounded-lg font-bold transition-colors">{{ $t('inventory.delete') }}</button>
                  </div>
            </td>
              </tr>
              <tr v-if="filteredProducts.length === 0 && !loading">
                <td colspan="5" class="px-6 py-12 text-center text-sm text-gray-500">
                  <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  {{ $t('inventory.no_products_found') }} {{ searchQuery ? $t('inventory.try_adjusting_search') : $t('inventory.start_adding_product') }}
                </td>
              </tr>
              <tr v-if="loading">
                <td colspan="5" class="px-6 py-12 text-center text-sm text-gray-500">
                  {{ $t('inventory.loading_inventory') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Product Modal -->
      <div v-if="showAddModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl text-start overflow-hidden shadow-2xl w-full max-w-2xl border border-gray-100 flex flex-col max-h-[90vh]">
          <form @submit.prevent="saveProduct" class="flex flex-col flex-1 overflow-hidden">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 overflow-y-auto flex-1">
              <h3 class="text-xl font-bold text-gray-900 mb-6" id="modal-title">{{ isEditing ? $t('inventory.edit_product') : $t('inventory.create_new_product') }}</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('inventory.product_name') }}</label>
                    <input v-model="form.name" type="text" required :placeholder="$t('inventory.e_g_wireless_mouse')" class="block w-full border border-gray-300 rounded-xl shadow-sm ring-1 ring-gray-900/5 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('inventory.category') }}</label>
                    <div class="flex gap-2">
                      <select v-model="form.category" class="block w-full border border-gray-300 rounded-xl shadow-sm ring-1 ring-gray-900/5 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option value="">{{ $t('inventory.select_category') }}</option>
                        <option v-for="cat in categories" :key="cat._id" :value="cat.name">{{ cat.name }}</option>
                      </select>
                      <button type="button" @click="showCategoryModal = true" class="px-3 py-2 bg-gray-100 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors" :title="$t('inventory.manage_categories')">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('inventory.sku_label') }}</label>
                    <input v-model="form.sku" type="text" required :placeholder="$t('inventory.e_g_wm_01')" class="block w-full border border-gray-300 rounded-xl shadow-sm ring-1 ring-gray-900/5 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono uppercase">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('inventory.barcode') }}</label>
                    <input v-model="form.barcode" type="text" :placeholder="$t('inventory.scan_or_enter_barcode')" class="block w-full border border-gray-300 rounded-xl shadow-sm ring-1 ring-gray-900/5 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono">
                  </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  <div class="col-span-2 md:col-span-1">
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('inventory.unit_of_measure') }}</label>
                    <select v-model="form.uom" class="block w-full border border-gray-300 rounded-xl shadow-sm ring-1 ring-gray-900/5 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="Piece">{{ $t('inventory.piece') }}</option>
                      <option value="Box">{{ $t('inventory.box') }}</option>
                      <option value="KG">{{ $t('inventory.kg') }}</option>
                      <option value="Liter">{{ $t('inventory.liter') }}</option>
                    </select>
                  </div>
                  <div class="col-span-2 md:col-span-1">
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('inventory.stock') }}</label>
                    <input v-model="form.stockQuantity" type="number" required placeholder="0" class="block w-full border border-gray-300 rounded-xl shadow-sm ring-1 ring-gray-900/5 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                  <div class="col-span-2 md:col-span-1">
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('inventory.alert_quantity') }}</label>
                    <input v-model="form.alertQuantity" type="number" placeholder="10" class="block w-full border border-gray-300 rounded-xl shadow-sm ring-1 ring-gray-900/5 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('inventory.purchase_price') }}</label>
                    <input v-model="form.purchasePrice" type="number" step="0.01" placeholder="0.00" class="block w-full border border-gray-300 rounded-xl shadow-sm ring-1 ring-gray-900/5 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('inventory.selling_unit_price') }}</label>
                    <input v-model="form.unitPrice" type="number" step="0.01" required placeholder="0.00" class="block w-full border border-gray-300 rounded-xl shadow-sm ring-1 ring-gray-900/5 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                </div>

              </div>
              <div class="bg-gray-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100">
                <button type="submit" class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-5 py-2 bg-indigo-600 text-base font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ms-3 sm:w-auto sm:text-sm">
                  {{ isEditing ? $t('inventory.save_changes') : $t('inventory.save_product') }}
                </button>
                <button type="button" @click="showAddModal = false" class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-5 py-2 bg-white text-base font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
                  {{ $t('inventory.cancel') }}
                </button>
              </div>
            </form>
          </div>
        </div>

      <!-- Manage Categories Modal -->
      <div v-if="showCategoryModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl text-start overflow-hidden shadow-2xl w-full max-w-md border border-gray-100 flex flex-col max-h-[90vh]">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 overflow-y-auto flex-1">
            <div class="flex justify-between items-center mb-5">
              <h3 class="text-xl font-bold text-gray-900" id="modal-title">{{ $t('inventory.manage_categories') }}</h3>
                <button @click="showCategoryModal = false" class="text-gray-400 hover:text-gray-500">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <form @submit.prevent="addCategory" class="mb-6">
                <div class="flex gap-2">
                  <input v-model="categoryForm.name" type="text" required :placeholder="$t('inventory.new_category_name')" class="block w-full border border-gray-300 rounded-xl shadow-sm ring-1 ring-gray-900/5 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <button type="submit" class="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    {{ $t('inventory.add') }}
                  </button>
                </div>
              </form>

              <div class="border border-gray-100 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <ul class="divide-y divide-gray-100">
                  <li v-for="cat in categories" :key="cat._id" class="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                    <span class="text-sm font-medium text-gray-900">{{ cat.name }}</span>
                  </li>
                  <li v-if="categories.length === 0" class="px-4 py-3 text-center text-sm text-gray-500">
                    {{ $t('inventory.no_categories_found') }}
                  </li>
                </ul>
              </div>
            </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100 flex-shrink-0">
            <button type="button" @click="showCategoryModal = false" class="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-5 py-2 bg-white text-base font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm">
              {{ $t('inventory.done') }}
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Inventory' })

import { computed, ref, onMounted } from 'vue'
import { usePermissions } from '../../composables/usePermissions'

definePageMeta({ 
  layout: 'dashboard',
  middleware: ['auth', 'module-guard'],
  requiredModule: 'inventory'
})

const { $api } = useNuxtApp()
const { hasPermission } = usePermissions()
const products = ref([])
const categories = ref([])
const loading = ref(true)

const showAddModal = ref(false)
const showCategoryModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const searchQuery = ref('')

const form = ref({
  name: '',
  sku: '',
  barcode: '',
  category: '',
  uom: 'Piece',
  purchasePrice: 0,
  unitPrice: '',
  isForSale: true,
  hasExpiry: false,
  stockQuantity: '',
  alertQuantity: 10
})

const categoryForm = ref({ name: '' })

const filteredProducts = computed(() => {
  let result = products.value
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.sku.toLowerCase().includes(q) || 
      (p.barcode && p.barcode.toLowerCase().includes(q))
    )
  }
  
  return result
})

const lowStockCount = computed(() => {
  return products.value.filter(p => p.stockQuantity <= (p.alertQuantity || 10)).length
})

const totalInventoryValue = computed(() => {
  return products.value.reduce((total, p) => total + (p.stockQuantity * (p.purchasePrice || p.unitPrice || 0)), 0)
})

const fetchData = async () => {
  loading.value = true
  try {
    const [productsData, categoriesData] = await Promise.all([
      $api('/inventory/products'),
      $api('/inventory/categories')
    ])
    products.value = productsData
    categories.value = categoriesData
  } catch (error) {
    console.error('Failed to fetch data', error)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    categories.value = await $api('/inventory/categories')
  } catch (error) {
    console.error('Failed to fetch categories', error)
  }
}

const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = { name: '', sku: '', barcode: '', category: '', uom: 'Piece', purchasePrice: 0, unitPrice: '', isForSale: true, hasExpiry: false, stockQuantity: '', alertQuantity: 10 }
  showAddModal.value = true
}

const openEditModal = (product) => {
  isEditing.value = true
  editingId.value = product._id
  form.value = { 
    name: product.name || '', 
    sku: product.sku || '', 
    barcode: product.barcode || '', 
    category: product.category || '', 
    uom: product.uom || 'Piece', 
    purchasePrice: product.purchasePrice || 0, 
    unitPrice: product.unitPrice || 0, 
    isForSale: product.isForSale !== false,
    hasExpiry: product.hasExpiry || false,
    stockQuantity: product.stockQuantity || 0, 
    alertQuantity: product.alertQuantity || 10 
  }
  showAddModal.value = true
}

const saveProduct = async () => {
  try {
    const payload = { ...form.value }
    if (!payload.barcode) delete payload.barcode 
    
    if (isEditing.value) {
      await $api(`/inventory/products/${editingId.value}`, {
        method: 'PUT',
        body: payload
      })
    } else {
      await $api('/inventory/products', {
        method: 'POST',
        body: payload
      })
    }
    
    showAddModal.value = false
    fetchData()
  } catch (error) {
    alert(error.data?.message || 'Failed to save product')
  }
}

const deleteProduct = async (id) => {
  if (!confirm('Are you sure you want to delete this product?')) return
  
  try {
    await $api(`/inventory/products/${id}`, {
      method: 'DELETE'
    })
    fetchData()
  } catch (error) {
    alert(error.data?.message || 'Failed to delete product')
  }
}

const addCategory = async () => {
  try {
    if (!categoryForm.value.name.trim()) return
    
    await $api('/inventory/categories', {
      method: 'POST',
      body: categoryForm.value
    })
    categoryForm.value.name = ''
    await fetchCategories()
  } catch (error) {
    alert(error.data?.message || 'Failed to add category')
  }
}

onMounted(() => {
  fetchData()
})
</script>
