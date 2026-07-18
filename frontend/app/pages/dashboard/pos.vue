<template>
  <div class="h-[100dvh] bg-gray-100 flex flex-col">
    <!-- Top Nav -->
    <div class="bg-indigo-700 text-white shadow-md flex justify-between items-center px-6 py-3 print:hidden">
      <div class="flex items-center gap-4">
        <NuxtLink to="/" class="hover:bg-indigo-600 p-2 rounded-lg transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </NuxtLink>
        <h1 class="text-2xl font-black tracking-tight">{{ $t('pos.terminal') }}</h1>
      </div>
      <div class="flex items-center gap-4">
        <button v-if="!shiftOpen" @click="openShift" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg transition-colors">{{ $t('pos.open_shift') }}</button>
        <button v-if="shiftOpen" @click="closeShift" class="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-lg transition-colors">{{ $t('pos.close_shift') }}</button>
        <div class="text-sm font-medium opacity-80 hidden sm:block">{{ currentDate }}</div>
      </div>
    </div>

    <!-- Main Content Layout -->
    <div class="flex-1 flex flex-col lg:flex-row overflow-hidden print:hidden">
      
      <!-- Left Pane: Products -->
      <div class="w-full lg:w-2/3 flex flex-col flex-1 lg:flex-none lg:h-full bg-gray-50 border-b lg:border-b-0 lg:border-e border-gray-100 overflow-hidden">
        <div class="p-4 bg-white border-b border-gray-100 flex gap-3">
          <div class="relative flex-1">
            <div class="absolute inset-y-0 left-0 ps-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input v-model="searchQuery" type="text" :placeholder="$t('pos.search_placeholder')" class="block w-full ps-10 pe-3 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow">
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4">
          <div v-if="!shiftOpen" class="h-full flex flex-col items-center justify-center text-gray-400">
            <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            <p class="text-xl font-bold">{{ $t('pos.open_shift_prompt') }}</p>
          </div>
          
          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="product in filteredProducts" :key="product._id" @click="addToCart(product)" class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all group flex flex-col h-full" :class="{ 'opacity-50 pointer-events-none': product.stockQuantity <= 0 }">
              <div class="flex-1">
                <h3 class="text-sm font-bold text-gray-900 group-hover:text-indigo-700 leading-tight mb-1">{{ product.name }}</h3>
                <p class="text-xs text-gray-500">{{ product.barcode || product.sku }}</p>
              </div>
              <div class="mt-3 flex justify-between items-end">
                <span class="text-lg font-black text-gray-900">{{ currency }}{{ product.unitPrice.toFixed(2) }}</span>
                <span class="text-xs font-bold px-2 py-1 rounded-md" :class="product.stockQuantity > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-red-50 text-red-700'">
                  {{ product.stockQuantity > 0 ? product.stockQuantity + ' ' + $t('pos.in_stock') : $t('pos.out_of_stock') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Pane: Cart -->
      <div class="w-full lg:w-1/3 flex flex-col h-[45%] lg:h-full bg-white overflow-hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:shadow-none z-10">
        <!-- Header -->
        <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <h2 class="font-black text-gray-900 tracking-tight flex items-center">
            <svg class="w-5 h-5 me-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            {{ $t('pos.current_order') }}
          </h2>
          <span v-if="shiftOpen" class="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
            {{ $t('pos.shift_active') }}
          </span>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4">
          <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400">
            <svg class="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            <p>{{ $t('pos.cart_empty') }}</p>
          </div>
          
          <ul v-else class="divide-y divide-gray-100">
            <li v-for="(item, index) in cart" :key="item.productId" class="py-3 flex justify-between">
              <div class="flex-1">
                <h4 class="text-sm font-bold text-gray-900">{{ item.name }}</h4>
                <div class="text-xs text-gray-500 mt-1">{{ currency }}{{ item.unitPrice.toFixed(2) }}</div>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button @click="updateQuantity(index, -1)" class="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold">-</button>
                  <input type="number" v-model.number="item.quantity" @change="recalculateCart" class="w-12 text-center text-sm font-bold border-x border-gray-300 py-1 focus:outline-none focus:ring-0">
                  <button @click="updateQuantity(index, 1)" class="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold">+</button>
                </div>
                <div class="w-16 text-end font-bold text-gray-900">
                  {{ currency }}{{ item.totalPrice.toFixed(2) }}
                </div>
                <button @click="removeFromCart(index)" class="text-red-400 hover:text-red-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </li>
          </ul>
        </div>

        <div class="bg-gray-50 p-4 border-t border-gray-100">
          <div class="space-y-4">
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500">{{ $t('pos.subtotal') }}</span>
              <span class="font-bold text-gray-900">{{ currency }}{{ subTotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500">{{ $t('pos.tax') }} ({{ taxRate }}%)</span>
              <span class="font-bold text-gray-900">{{ currency }}{{ taxAmount.toFixed(2) }}</span>
            </div>
            
            <div class="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span class="text-lg font-black text-gray-900">{{ $t('pos.total') }}</span>
              <span class="text-2xl font-black text-indigo-600">{{ currency }}{{ grandTotal.toFixed(2) }}</span>
            </div>

            <!-- Customer Selection -->
            <div class="pt-4 border-t border-gray-100">
              <div class="flex justify-between items-center mb-2">
                <label class="block text-xs font-bold text-gray-500 uppercase">{{ $t('pos.customer') }}</label>
                <button @click="showAddCustomerModal = true" class="text-xs text-indigo-600 font-bold hover:text-indigo-800 flex items-center">
                  <svg class="w-3 h-3 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> {{ $t('pos.add_new') }}
                </button>
              </div>
              <select v-model="selectedCustomer" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                <option :value="null">{{ $t('pos.walk_in_customer') }}</option>
                <option v-for="c in customers" :key="c._id" :value="c._id">{{ c.name }}</option>
              </select>
            </div>

            <!-- Payment Methods -->
            <div class="pt-4 border-t border-gray-100">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-2">{{ $t('pos.payment_method') }}</label>
              <div class="grid grid-cols-2 gap-2">
                <button @click="paymentMethod = 'Cash'" :class="paymentMethod === 'Cash' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'" class="px-3 py-2 rounded-xl text-sm font-bold transition-colors">{{ $t('pos.cash') }}</button>
                <button @click="paymentMethod = 'Card'" :class="paymentMethod === 'Card' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'" class="px-3 py-2 rounded-xl text-sm font-bold transition-colors">{{ $t('pos.card') }}</button>
                <button @click="paymentMethod = 'Debt'" :class="paymentMethod === 'Debt' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'" class="px-3 py-2 rounded-xl text-sm font-bold transition-colors">{{ $t('pos.on_credit') }}</button>
                <button @click="paymentMethod = 'Installment'" :class="paymentMethod === 'Installment' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'" class="px-3 py-2 rounded-xl text-sm font-bold transition-colors">{{ $t('pos.installments') }}</button>
                <button @click="paymentMethod = 'Check'" :class="paymentMethod === 'Check' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'" class="col-span-2 px-3 py-2 rounded-xl text-sm font-bold transition-colors">{{ $t('pos.check') }}</button>
              </div>
            </div>

            <!-- Conditional Details: Check -->
            <div v-if="paymentMethod === 'Check'" class="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2 mt-2">
              <input v-model="checkDetails.checkNumber" type="text" :placeholder="$t('pos.check_number')" class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm">
              <input v-model="checkDetails.bankName" type="text" :placeholder="$t('pos.bank_name')" class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm">
              <input v-model="checkDetails.dueDate" type="date" class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm">
            </div>

            <!-- Conditional Details: Installment -->
            <div v-if="paymentMethod === 'Installment'" class="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2 mt-2">
              <div>
                <label class="text-xs font-bold text-gray-500">{{ $t('pos.down_payment') }} ({{ currency }})</label>
                <input v-model="installmentDetails.downPayment" type="number" min="0" class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm">
              </div>
              <div>
                <label class="text-xs font-bold text-gray-500">{{ $t('pos.number_of_months') }}</label>
                <input v-model="installmentDetails.months" type="number" min="1" max="60" class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm">
              </div>
              <div v-if="installmentDetails.months > 0" class="text-xs text-indigo-600 font-bold mt-1 text-center">
                {{ installmentDetails.months }} payments of {{ currency }}{{ ((grandTotal - installmentDetails.downPayment) / installmentDetails.months).toFixed(2) }}/month
              </div>
            </div>

          </div>

          <button @click="checkout" :disabled="cart.length === 0 || !shiftOpen || loading" class="w-full mt-6 py-4 bg-indigo-600 disabled:bg-gray-400 text-white rounded-xl text-lg font-black tracking-wide shadow-lg hover:bg-indigo-700 transition-colors flex justify-center items-center">
            <svg v-if="!loading" class="w-6 h-6 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            <svg v-else class="animate-spin -ms-1 me-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ loading ? $t('pos.processing') : $t('pos.pay_checkout') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Hidden Receipt for Printing -->
    <div id="receipt-area" class="hidden print:block w-80 mx-auto font-mono text-sm text-black">
      <div class="text-center mb-4">
        <h2 class="text-xl font-bold">{{ storeName }}</h2>
        <p v-if="address">{{ address }}</p>
        <p v-if="phone">Tel: {{ phone }}</p>
        <p v-if="receiptHeader" class="mt-2 whitespace-pre-line">{{ receiptHeader }}</p>
      </div>
      
      <div v-if="lastOrder" class="border-t border-b border-dashed border-black py-2 mb-2">
        <div class="flex justify-between"><span>Order:</span> <span>{{ lastOrder.orderNumber }}</span></div>
        <div class="flex justify-between"><span>Date:</span> <span>{{ new Date(lastOrder.createdAt).toLocaleString() }}</span></div>
        <div class="flex justify-between"><span>Method:</span> <span>{{ lastOrder.paymentMethod }}</span></div>
      </div>

      <table v-if="lastOrder" class="w-full mb-2">
        <thead>
          <tr class="border-b border-dashed border-black">
            <th class="text-start py-1">Item</th>
            <th class="text-end py-1">Qty</th>
            <th class="text-end py-1">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in lastOrder.items" :key="item.productId">
            <td class="py-1">{{ item.name }}</td>
            <td class="text-end py-1">{{ item.quantity }}</td>
            <td class="text-end py-1">{{ item.totalPrice.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="lastOrder" class="border-t border-dashed border-black pt-2 space-y-1">
        <div class="flex justify-between"><span>Subtotal:</span> <span>{{ currency }}{{ lastOrder.subTotal.toFixed(2) }}</span></div>
        <div v-if="lastOrder.discount > 0" class="flex justify-between"><span>Discount:</span> <span>-{{ currency }}{{ lastOrder.discount.toFixed(2) }}</span></div>
        <div class="flex justify-between"><span>Tax ({{ taxRate }}%):</span> <span>{{ currency }}{{ lastOrder.tax.toFixed(2) }}</span></div>
        <div class="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-dashed border-black">
          <span>TOTAL:</span> <span>{{ currency }}{{ lastOrder.grandTotal.toFixed(2) }}</span>
        </div>
      </div>
      
      <div class="text-center mt-6 text-xs whitespace-pre-line">
        <p>{{ receiptFooter }}</p>
      </div>
    </div>

    <!-- Add Customer Modal -->
    <div v-if="showAddCustomerModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 print:hidden">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-900">{{ $t('pos.add_customer') }}</h3>
          <button @click="showAddCustomerModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="p-6">
          <form @submit.prevent="quickAddCustomer" class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('pos.full_name') }}</label>
              <input v-model="customerForm.name" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('pos.phone') }}</label>
                <input v-model="customerForm.phone" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('pos.email') }}</label>
                <input v-model="customerForm.email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t">
              <button type="button" @click="showAddCustomerModal = false" class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50">{{ $t('pos.cancel') }}</button>
              <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">{{ $t('pos.save_customer') }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
useHead({ title: 'Pos' })

import { ref, computed, onMounted } from 'vue'

definePageMeta({ 
  middleware: ['auth', 'module-guard'],
  requiredModule: 'pos',
  layout: false // Hide default layout to make POS full screen
})

const { $api } = useNuxtApp()
const products = ref([])
const searchQuery = ref('')
const loading = ref(false)

const shiftOpen = ref(false)
const currentShiftId = ref(null)

const cart = ref([])
const taxRate = ref(15)
const currency = ref('$')
const storeName = ref('STORE NAME')
const address = ref('')
const phone = ref('')
const receiptHeader = ref('')
const receiptFooter = ref('Thank you for your purchase!')
const paymentMethod = ref('Cash')

const subTotal = ref(0)
const taxAmount = ref(0)
const grandTotal = ref(0)

const lastOrder = ref(null)
const customers = ref([])
const selectedCustomer = ref(null)
const checkDetails = ref({ checkNumber: '', bankName: '', dueDate: '' })
const installmentDetails = ref({ downPayment: 0, months: 3 })

const showAddCustomerModal = ref(false)
const customerForm = ref({ name: '', phone: '', email: '' })

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

const filteredProducts = computed(() => {
  let list = products.value.filter(p => p.isForSale !== false)
  if (!searchQuery.value) return list
  const q = searchQuery.value.toLowerCase()
  return list.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.sku.toLowerCase().includes(q) || 
    (p.barcode && p.barcode.toLowerCase().includes(q))
  )
})

const fetchProducts = async () => {
  try {
    const settings = await $api('/settings')
    if (settings) {
      taxRate.value = settings.taxRate !== undefined ? settings.taxRate : 15
      currency.value = settings.currency || '$'
      storeName.value = settings.storeName || 'STORE NAME'
      address.value = settings.address || ''
      phone.value = settings.phone || ''
      receiptHeader.value = settings.receiptHeader || ''
      receiptFooter.value = settings.receiptFooter || 'Thank you for your purchase!'
    }
    products.value = await $api('/inventory/products')
    customers.value = await $api('/customers')
  } catch (error) {
    console.error('Failed to fetch data', error)
  }
}

const quickAddCustomer = async () => {
  try {
    const newCustomer = await $api('/customers', {
      method: 'POST',
      body: customerForm.value
    })
    customers.value = await $api('/customers')
    selectedCustomer.value = newCustomer._id
    customerForm.value = { name: '', phone: '', email: '' }
    showAddCustomerModal.value = false
  } catch (error) {
    alert('Failed to add customer')
  }
}

const checkShiftStatus = async () => {
  try {
    const shift = await $api('/pos/shifts/current');
    if (shift) {
      shiftOpen.value = true;
      currentShiftId.value = shift._id;
    } else {
      shiftOpen.value = false;
      currentShiftId.value = null;
    }
  } catch (error) {
    console.error('Failed to check shift status', error);
  }
}

const openShift = async () => {
  const amount = prompt("Enter opening cash balance:", "0")
  if (amount === null) return
  
  try {
    const shift = await $api('/pos/shifts/open', {
      method: 'POST',
      body: { openingBalance: Number(amount) }
    })
    currentShiftId.value = shift._id
    shiftOpen.value = true
    alert("Shift Opened!")
  } catch (error) {
    alert(error.data?.message || 'Failed to open shift')
  }
}

const closeShift = async () => {
  const amount = prompt("Enter closing cash balance:", "0")
  if (amount === null) return
  
  if(!currentShiftId.value) {
    alert("No shift ID found.")
    return
  }
  
  try {
    await $api(`/pos/shifts/close/${currentShiftId.value}`, {
      method: 'POST',
      body: { closingBalance: Number(amount) }
    })
    shiftOpen.value = false
    currentShiftId.value = null
    alert("Shift Closed successfully!")
  } catch (error) {
    alert(error.data?.message || 'Failed to close shift')
  }
}

const addToCart = (product) => {
  if (product.stockQuantity <= 0) return
  
  const existing = cart.value.find(item => item.productId === product._id)
  if (existing) {
    if (existing.quantity >= product.stockQuantity) {
      alert("Cannot add more than available stock")
      return
    }
    existing.quantity++
    existing.totalPrice = existing.quantity * existing.unitPrice
  } else {
    cart.value.push({
      productId: product._id,
      name: product.name,
      unitPrice: product.unitPrice,
      quantity: 1,
      totalPrice: product.unitPrice,
      stockLimit: product.stockQuantity // For validation
    })
  }
  recalculateCart()
}

const updateQuantity = (index, delta) => {
  const item = cart.value[index]
  const newQty = item.quantity + delta
  
  if (newQty <= 0) {
    removeFromCart(index)
    return
  }
  
  if (newQty > item.stockLimit) {
    alert("Cannot exceed available stock")
    return
  }
  
  item.quantity = newQty
  item.totalPrice = item.quantity * item.unitPrice
  recalculateCart()
}

const removeFromCart = (index) => {
  cart.value.splice(index, 1)
  recalculateCart()
}

const recalculateCart = () => {
  cart.value.forEach(item => {
    if (item.quantity < 1) item.quantity = 1
    if (item.quantity > item.stockLimit) item.quantity = item.stockLimit
    item.totalPrice = item.quantity * item.unitPrice
  })
  
  subTotal.value = cart.value.reduce((sum, item) => sum + item.totalPrice, 0)
  taxAmount.value = subTotal.value * (taxRate.value / 100)
  grandTotal.value = subTotal.value + taxAmount.value
}

const checkout = async () => {
  if (cart.value.length === 0) return
  
  if (['Debt', 'Installment', 'Check'].includes(paymentMethod.value) && !selectedCustomer.value) {
    alert(`Please select a customer for ${paymentMethod.value} payments.`)
    return
  }
  
  loading.value = true
  try {
    const payload = {
      items: cart.value.map(i => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice
      })),
      subTotal: subTotal.value,
      tax: taxAmount.value,
      grandTotal: grandTotal.value,
      paymentMethod: paymentMethod.value,
      customerId: selectedCustomer.value
    }
    
    if (paymentMethod.value === 'Check') payload.checkDetails = checkDetails.value
    if (paymentMethod.value === 'Installment') payload.installmentDetails = installmentDetails.value

    lastOrder.value = await $api('/pos/orders', {
      method: 'POST',
      body: payload
    })
    
    // Clear Cart
    cart.value = []
    recalculateCart()
    
    // Refresh products to get updated stock
    await fetchProducts()
    
    // Print Receipt
    setTimeout(() => {
      window.print()
    }, 500)
    
  } catch (error) {
    alert(error.data?.message || 'Checkout failed')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProducts()
  checkShiftStatus()
})
</script>

<style>
@media print {
  body {
    background-color: white !important;
  }
}
</style>
