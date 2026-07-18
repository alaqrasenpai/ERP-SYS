<template>
  <div class="h-[calc(100vh-4rem)] flex overflow-hidden bg-gray-50">
    
    <!-- Left: Menu & Tabs -->
    <div class="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <NuxtLink to="/dashboard" class="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition">
            <svg class="w-6 h-6 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </NuxtLink>
          <h2 class="text-2xl font-black text-gray-900">{{ $t('restaurant.pos_terminal') }}</h2>
        </div>
      </div>

      <!-- Order Types Tabs -->
      <div class="flex space-x-2 rtl:space-x-reverse mb-6 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
        <button v-for="type in ['Dine-In', 'Takeaway', 'Delivery']" :key="type"
                @click="orderType = type"
                class="flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all"
                :class="orderType === type ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'">
          {{ $t(`restaurant.${type.toLowerCase().replace('-', '_')}`) }}
        </button>
      </div>

      <!-- Category Filter -->
      <div class="flex space-x-2 rtl:space-x-reverse mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <button @click="selectedCategory = 'All'"
                class="whitespace-nowrap py-2 px-4 rounded-full font-bold text-sm transition-all shadow-sm border"
                :class="selectedCategory === 'All' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'">
          {{ $t('restaurant.all_categories') }}
        </button>
        <button v-for="cat in categories" :key="cat._id"
                @click="selectedCategory = cat.nameEn"
                class="whitespace-nowrap py-2 px-4 rounded-full font-bold text-sm transition-all shadow-sm border"
                :class="selectedCategory === cat.nameEn ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'">
          {{ locale === 'ar' ? cat.nameAr : cat.nameEn }}
        </button>
      </div>

      <!-- Menu Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <button v-for="item in filteredMenu" :key="item._id" @click="addToCart(item)"
                class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition text-start flex flex-col group">
          <div class="h-32 w-full bg-gray-100 relative">
            <img v-if="item.imageUrl" :src="item.imageUrl" class="w-full h-full object-cover transition transform group-hover:scale-105" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <span class="icon-[heroicons--photo] w-8 h-8"></span>
            </div>
          </div>
          <div class="p-3 w-full">
            <h3 class="font-bold text-gray-900 text-sm truncate">{{ locale === 'ar' ? item.nameAr : item.nameEn }}</h3>
            <span class="font-black text-indigo-600 mt-1 block">{{ item.price }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Right: Checkout Drawer -->
    <div class="w-96 bg-white border-s border-gray-100 shadow-xl flex flex-col z-10">
      <div class="p-6 border-b border-gray-100">
        <h3 class="font-black text-lg text-gray-900">{{ $t('restaurant.checkout') }}</h3>
        
        <!-- Delivery Details if Delivery -->
        <div v-if="orderType === 'Delivery'" class="mt-4 space-y-3">
          <select v-model="deliveryDetails.providerId" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 font-medium text-sm">
            <option value="">{{ $t('restaurant.select_provider') }}</option>
            <option v-for="p in providers" :key="p._id" :value="p._id">
              {{ locale === 'ar' ? p.nameAr : p.nameEn }} ({{ p.commissionRate }}%)
            </option>
          </select>
          <input v-model="deliveryDetails.externalOrderId" :placeholder="$t('restaurant.external_order_id')" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm">
        </div>

        <!-- Table info if Dine-in -->
        <div v-if="orderType === 'Dine-In'" class="mt-4">
           <select v-model="tableId" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 font-medium text-sm">
             <option value="">{{ $t('restaurant.table_number') }}</option>
             <option v-for="t in tables" :key="t._id" :value="t._id">
               {{ t.tableNumber }} ({{ t.section }})
             </option>
           </select>
        </div>
      </div>

      <!-- Cart Items -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div v-for="(item, index) in cart" :key="index" class="flex flex-col p-3 bg-gray-50 rounded-xl">
          <div class="flex justify-between items-center">
            <div>
              <h4 class="font-bold text-sm text-gray-900">{{ locale === 'ar' ? item.nameAr : item.nameEn }}</h4>
              <div class="text-xs text-gray-500 font-medium">{{ item.price }} x {{ item.quantity }}</div>
            </div>
            <div class="flex items-center space-x-2 rtl:space-x-reverse">
              <button @click="item.quantity--" class="w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-sm font-bold flex items-center justify-center hover:bg-gray-50">-</button>
              <span class="font-black text-sm w-4 text-center">{{ item.quantity }}</span>
              <button @click="item.quantity++" class="w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-sm font-bold flex items-center justify-center hover:bg-gray-50">+</button>
            </div>
          </div>
          <input v-model="item.notes" type="text" :placeholder="$t('restaurant.add_notes')" class="mt-2 w-full text-xs px-2 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400">
        </div>
      </div>

      <!-- Financials & Pay -->
      <div class="p-6 border-t border-gray-100 bg-gray-50/50">
        <div class="flex justify-between text-sm mb-2">
          <span class="text-gray-500 font-bold">{{ $t('restaurant.sub_total') }}</span>
          <span class="font-black">{{ subTotal.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-sm mb-4">
          <span class="text-gray-500 font-bold">{{ $t('restaurant.tax') }} (15%)</span>
          <span class="font-black">{{ tax.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-xl mb-6">
          <span class="font-black text-gray-900">{{ $t('restaurant.grand_total') }}</span>
          <span class="font-black text-indigo-600">{{ grandTotal.toFixed(2) }}</span>
        </div>

        <div class="grid grid-cols-2 gap-3 mb-3" v-if="orderType !== 'Delivery'">
          <button @click="checkout('Cash')" class="py-3 bg-green-500 text-white rounded-xl font-black shadow-sm hover:bg-green-600 transition">{{ $t('restaurant.pay_cash') }}</button>
          <button @click="checkout('Card')" class="py-3 bg-blue-500 text-white rounded-xl font-black shadow-sm hover:bg-blue-600 transition">{{ $t('restaurant.pay_card') }}</button>
        </div>
        <button v-if="orderType === 'Delivery'" @click="checkout('Aggregator Credit')" class="w-full py-3 bg-orange-500 text-white rounded-xl font-black shadow-sm hover:bg-orange-600 transition mb-3">{{ $t('restaurant.pay_aggregator') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

definePageMeta({
  layout: false
})

const { t, locale } = useI18n()
const { $api } = useNuxtApp()

const menu = ref([])
const categories = ref([])
const providers = ref([])
const tables = ref([])

const selectedCategory = ref('All')
const orderType = ref('Dine-In')
const cart = ref([])
const tableId = ref('')
const deliveryDetails = ref({ providerId: '', externalOrderId: '' })

const subTotal = computed(() => cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0))
const tax = computed(() => subTotal.value * 0.15)
const grandTotal = computed(() => subTotal.value + tax.value)

const filteredMenu = computed(() => {
  if (selectedCategory.value === 'All') return menu.value
  return menu.value.filter(item => item.categoryEn === selectedCategory.value)
})

const fetchData = async () => {
  menu.value = await $api('/restaurant/menu')
  categories.value = await $api('/restaurant/categories')
  providers.value = await $api('/restaurant/providers')
  tables.value = await $api('/restaurant/tables')
}

const addToCart = (item) => {
  const existing = cart.value.find(c => c.menuItemId === item._id)
  if (existing) {
    existing.quantity++
  } else {
    cart.value.push({
      menuItemId: item._id,
      nameAr: item.nameAr,
      nameEn: item.nameEn,
      price: item.price,
      quantity: 1,
      notes: ''
    })
  }
}

const checkout = async (paymentMethod) => {
  if (!cart.value.length) return alert('Cart is empty')
  
  try {
    // 1. Create Order
    const orderRes = await $api('/restaurant/orders', {
      method: 'POST',
      body: {
        orderType: orderType.value,
        tableId: orderType.value === 'Dine-In' ? tableId.value : null,
        items: cart.value,
        deliveryDetails: orderType.value === 'Delivery' ? deliveryDetails.value : null
      }
    })

    // 2. Checkout Order
    await $api(`/restaurant/orders/${orderRes._id}/checkout`, { 
      method: 'POST',
      body: { paymentMethod } 
    })
    
    alert('Order completed successfully!')
    cart.value = []
    tableId.value = ''
    deliveryDetails.value = { providerId: '', externalOrderId: '' }
    
  } catch (err) {
    alert(err.message || 'Error processing checkout')
  }
}

onMounted(() => {
  fetchData()
})
</script>
