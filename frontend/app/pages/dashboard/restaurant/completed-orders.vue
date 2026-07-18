<template>
  <div class="p-6 sm:p-8 space-y-8 bg-gray-50/50 min-h-screen">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div>
        <h2 class="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <span class="bg-indigo-100 text-indigo-600 p-2 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </span>
          {{ $t('restaurant.completed_orders') }}
        </h2>
        <p class="text-gray-500 text-sm mt-2 font-medium">{{ $t('restaurant.completed_orders_desc') }}</p>
      </div>
      <div class="flex items-center gap-2 bg-gray-50 px-4 py-2 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
        <span class="text-sm font-bold text-gray-600">
          <svg class="w-5 h-5 inline-block rtl:ml-1 ltr:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          {{ $t('attendance_monitor.date') }}:
        </span>
        <input type="date" v-model="filterDate" @change="fetchOrders" class="border-none focus:ring-0 p-0 font-bold text-sm text-indigo-700 bg-transparent outline-none">
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('restaurant.order_number') }}</th>
              <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('restaurant.time') }}</th>
              <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('restaurant.order_type') }}</th>
              <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('restaurant.items') }}</th>
              <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('restaurant.total_amount') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="order in orders" :key="order._id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">
                {{ order.orderNumber }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                {{ formatTime(order.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="{
                  'bg-blue-100 text-blue-800': order.orderType === 'Dine-In',
                  'bg-green-100 text-green-800': order.orderType === 'Takeaway',
                  'bg-orange-100 text-orange-800': order.orderType === 'Delivery'
                }" class="px-2.5 py-1 text-xs font-bold rounded-full">
                  {{ order.orderType }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                {{ order.items.map(i => i.nameAr || i.nameEn).join(', ') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900">
                {{ order.financials?.grandTotal?.toFixed(2) }} {{ $t('common.currency') }}
              </td>
            </tr>
            <tr v-if="orders.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500 text-sm font-medium">
                {{ $t('common.no_data') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'

definePageMeta({
  layout: 'dashboard'
})

const { $api } = useNuxtApp()

const filterDate = ref(new Date().toISOString().split('T')[0])
const orders = ref([])
const loading = ref(true)

const formatTime = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const fetchOrders = async () => {
  loading.value = true
  try {
    orders.value = await $api(`/restaurant/orders/completed?date=${filterDate.value}`)
  } catch (err) {
    console.error('Error fetching completed orders:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOrders()
})
</script>
