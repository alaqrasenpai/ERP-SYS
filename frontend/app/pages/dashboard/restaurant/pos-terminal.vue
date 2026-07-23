<template>
  <div class="h-[calc(100vh-2rem)] flex flex-col lg:flex-row overflow-hidden bg-gray-50">
    
    <!-- Left: Menu & Tabs (in RTL this becomes right) -->
    <div class="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <a href="/" class="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-200 transition">
            <svg class="w-6 h-6 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </a>
          <h2 class="text-2xl font-black text-gray-900">{{ $t('restaurant.pos_terminal', 'شاشة البيع - المطعم') }}</h2>
        </div>
      </div>

      <!-- Order Types Tabs -->
      <div class="flex space-x-2 rtl:space-x-reverse mb-6 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
        <button v-for="type in ['Dine-In', 'Takeaway', 'Delivery']" :key="type"
                @click="orderType = type"
                class="flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all"
                :class="orderType === type ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'">
          {{ $t(`restaurant.${type.toLowerCase().replace('-', '_')}`) }}
        </button>
      </div>

      <!-- Category Filter Component -->
      <RestaurantPosCategoryFilter 
        :categories="categories" 
        :selected-category="selectedCategory" 
        @select="cat => selectedCategory = cat" 
      />

      <!-- Menu Grid Component -->
      <RestaurantPosMenuGrid 
        :menu="filteredMenu" 
        @add-to-cart="addToCart" 
      />
    </div>

    <!-- Right: Checkout Drawer Component (in RTL this becomes left) -->
    <RestaurantPosCartDrawer 
      :cart="cart"
      :order-type="orderType"
      :table-id="tableId"
      :customer-name="customerName"
      :delivery-details="deliveryDetails"
      :tables="tables"
      :providers="providers"
      :sub-total="subTotal"
      :discount="discount"
      :tax="tax"
      :tax-rate="taxRate"
      :grand-total="grandTotal"
      @update:qty="updateCartQty"
      @update:discount="val => discount = val"
      @update:table="val => tableId = val"
      @update:customerName="val => customerName = val"
      @update:provider="val => deliveryDetails.providerId = val"
      @update:externalId="val => deliveryDetails.externalOrderId = val"
      @checkout="checkout"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

definePageMeta({
  middleware: ['auth', 'module-guard'],
  requiredModule: 'restaurant'
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
const customerName = ref('')
const deliveryDetails = ref({ providerId: '', externalOrderId: '' })

const taxRate = ref(15)
const discount = ref(0)
const subTotal = computed(() => cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0))
const tax = computed(() => {
  const discounted = Math.max(0, subTotal.value - (discount.value || 0))
  return discounted * (taxRate.value / 100)
})
const grandTotal = computed(() => {
  const discounted = Math.max(0, subTotal.value - (discount.value || 0))
  return discounted + tax.value
})

const filteredMenu = computed(() => {
  const availableItems = menu.value.filter(item => item.isAvailable !== false)
  if (selectedCategory.value === 'All') return availableItems
  return availableItems.filter(item => item.categoryEn === selectedCategory.value)
})

const fetchData = async () => {
  menu.value = await $api('/restaurant/menu')
  categories.value = await $api('/restaurant/categories')
  providers.value = await $api('/restaurant/providers')
  tables.value = await $api('/restaurant/tables')
  try {
    const settings = await $api('/settings')
    if (settings && settings.taxRate !== undefined) {
      taxRate.value = settings.taxRate
    }
  } catch(e) {
    console.error('Error fetching settings', e)
  }
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

const updateCartQty = (index, delta) => {
  const item = cart.value[index]
  if (!item) return
  if (delta === -1000) {
    cart.value.splice(index, 1)
    return
  }
  item.quantity += delta
  if (item.quantity <= 0) {
    cart.value.splice(index, 1)
  }
}

const checkout = async (paymentMethod) => {
  if (!cart.value.length) return alert('Cart is empty')
  if (orderType.value === 'Dine-In' && !tableId.value) return alert('Please select a table')
  
  try {
    // 1. Create Order
    const orderRes = await $api('/restaurant/orders', {
      method: 'POST',
      body: {
        orderType: orderType.value,
        tableId: orderType.value === 'Dine-In' ? tableId.value : null,
        customerName: customerName.value,
        items: cart.value.map(item => ({
          menuItemId: item.menuItemId,
          nameAr: item.nameAr,
          nameEn: item.nameEn,
          price: item.price,
          quantity: item.quantity,
          notes: item.notes
        })),
        deliveryDetails: orderType.value === 'Delivery' ? deliveryDetails.value : null,
        discount: discount.value || 0
      }
    })

    // 2. Checkout Order
    await $api(`/restaurant/orders/${orderRes._id}/checkout`, { 
      method: 'POST',
      body: { paymentMethod } 
    })
    
    alert('Order completed successfully!')
    cart.value = []
    discount.value = 0
    tableId.value = ''
    customerName.value = ''
    deliveryDetails.value = { providerId: '', externalOrderId: '' }
    
  } catch (err) {
    alert(err.message || 'Error processing checkout')
  }
}

onMounted(() => {
  fetchData()
})
</script>
