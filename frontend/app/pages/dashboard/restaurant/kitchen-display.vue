<template>
  <div class="min-h-screen bg-gray-900 text-white p-4 sm:p-6 overflow-x-auto">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-black">{{ $t('restaurant.kitchen_display') }}</h2>
      <div class="flex items-center space-x-2 rtl:space-x-reverse text-sm font-bold">
        <span class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        <span>Live Sync</span>
      </div>
    </div>

    <!-- Kanban Board -->
    <div class="flex gap-6 h-[calc(100vh-8rem)]">
      
      <!-- Pending Column -->
      <div class="flex-1 min-w-[320px] bg-gray-800 rounded-2xl flex flex-col overflow-hidden border border-gray-700">
        <div class="p-4 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <h3 class="font-black text-lg text-yellow-400 flex items-center justify-between">
            <span>{{ $t('restaurant.pending') }}</span>
            <span class="bg-gray-700 text-white px-2 py-1 rounded-lg text-xs">{{ pendingItems.length }}</span>
          </h3>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <div v-for="order in orders" :key="'p-'+order._id">
            <div v-for="item in order.items.filter(i => i.kitchenStatus === 'Pending')" :key="item._id" 
                 class="bg-gray-700 p-4 rounded-xl shadow-lg border-s-4 border-yellow-400">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h4 class="font-black text-lg">{{ locale === 'ar' ? item.nameAr : item.nameEn }} <span class="text-yellow-400">x{{ item.quantity }}</span></h4>
                  <p class="text-xs text-gray-400 mt-1">{{ order.orderType }} - {{ order.orderType === 'Dine-In' ? order.tableId?.tableNumber : order.deliveryDetails?.providerName }}</p>
                </div>
                <div class="text-xs font-mono text-gray-400">{{ formatTime(order.createdAt) }}</div>
              </div>
              <p v-if="item.notes" class="text-sm bg-gray-800 p-2 rounded-lg text-gray-300 mb-3 italic">"{{ item.notes }}"</p>
              <button @click="updateStatus(order._id, item._id, 'Preparing')" class="w-full py-2 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500 hover:text-gray-900 border border-yellow-500/50 transition rounded-lg font-bold text-sm">
                Start Preparing
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Preparing Column -->
      <div class="flex-1 min-w-[320px] bg-gray-800 rounded-2xl flex flex-col overflow-hidden border border-gray-700">
        <div class="p-4 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <h3 class="font-black text-lg text-blue-400 flex items-center justify-between">
            <span>{{ $t('restaurant.preparing') }}</span>
            <span class="bg-gray-700 text-white px-2 py-1 rounded-lg text-xs">{{ preparingItems.length }}</span>
          </h3>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <div v-for="order in orders" :key="'pr-'+order._id">
            <div v-for="item in order.items.filter(i => i.kitchenStatus === 'Preparing')" :key="item._id" 
                 class="bg-gray-700 p-4 rounded-xl shadow-lg border-s-4 border-blue-400">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h4 class="font-black text-lg">{{ locale === 'ar' ? item.nameAr : item.nameEn }} <span class="text-blue-400">x{{ item.quantity }}</span></h4>
                  <p class="text-xs text-gray-400 mt-1">{{ order.orderType }} - {{ order.orderType === 'Dine-In' ? order.tableId?.tableNumber : order.deliveryDetails?.providerName }}</p>
                </div>
                <div class="text-xs font-mono text-blue-300 animate-pulse">Cooking...</div>
              </div>
              <p v-if="item.notes" class="text-sm bg-gray-800 p-2 rounded-lg text-gray-300 mb-3 italic">"{{ item.notes }}"</p>
              <button @click="updateStatus(order._id, item._id, 'Ready')" class="w-full py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/50 transition rounded-lg font-bold text-sm">
                Mark Ready
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Ready Column -->
      <div class="flex-1 min-w-[320px] bg-gray-800 rounded-2xl flex flex-col overflow-hidden border border-gray-700">
        <div class="p-4 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <h3 class="font-black text-lg text-green-400 flex items-center justify-between">
            <span>{{ $t('restaurant.ready') }}</span>
            <span class="bg-gray-700 text-white px-2 py-1 rounded-lg text-xs">{{ readyItems.length }}</span>
          </h3>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <div v-for="order in orders" :key="'r-'+order._id">
            <div v-for="item in order.items.filter(i => i.kitchenStatus === 'Ready')" :key="item._id" 
                 class="bg-gray-700 p-4 rounded-xl shadow-lg border-s-4 border-green-400">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h4 class="font-black text-lg">{{ locale === 'ar' ? item.nameAr : item.nameEn }} <span class="text-green-400">x{{ item.quantity }}</span></h4>
                  <p class="text-xs text-gray-400 mt-1">{{ order.orderType }} - {{ order.orderType === 'Dine-In' ? order.tableId?.tableNumber : order.deliveryDetails?.providerName }}</p>
                </div>
              </div>
              <button @click="updateStatus(order._id, item._id, 'Served')" class="w-full py-2 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-gray-900 border border-green-500/50 transition rounded-lg font-bold text-sm">
                Served
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

// Set layout to blank or KDS specific if needed, but keeping default dashboard is fine or use empty layout
definePageMeta({
  layout: 'dashboard'
})

const { t, locale } = useI18n()
const { $api } = useNuxtApp()
const orders = ref([])
let pollInterval;

const pendingItems = computed(() => {
  let items = []
  orders.value.forEach(o => items.push(...o.items.filter(i => i.kitchenStatus === 'Pending')))
  return items
})
const preparingItems = computed(() => {
  let items = []
  orders.value.forEach(o => items.push(...o.items.filter(i => i.kitchenStatus === 'Preparing')))
  return items
})
const readyItems = computed(() => {
  let items = []
  orders.value.forEach(o => items.push(...o.items.filter(i => i.kitchenStatus === 'Ready')))
  return items
})

const fetchOrders = async () => {
  try {
    orders.value = await $api('/restaurant/orders')
  } catch (error) {
    console.error(error)
  }
}

const updateStatus = async (orderId, itemId, status) => {
  try {
    await $api(`/restaurant/orders/${orderId}/kitchen-status`, { 
      method: 'PUT',
      body: { itemId, status }
    })
    fetchOrders() // Refresh
  } catch (error) {
    alert('Error updating status')
  }
}

const formatTime = (isoString) => {
  const d = new Date(isoString)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  fetchOrders()
  pollInterval = setInterval(fetchOrders, 5000) // Poll every 5s for KDS
})

onUnmounted(() => {
  clearInterval(pollInterval)
})
</script>
