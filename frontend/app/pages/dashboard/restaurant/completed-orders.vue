<template>
  <div class="p-6 sm:p-8 space-y-8 bg-gray-50/50 min-h-screen">
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div>
        <h2 class="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <span class="bg-primary-100 text-primary-600 p-2 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </span>
          {{ $t('restaurant.completed_orders') }}
        </h2>
        <p class="text-gray-500 text-sm mt-2 font-medium">{{ $t('restaurant.completed_orders_desc') }}</p>
      </div>
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex items-center gap-2 bg-gray-50 px-4 py-2 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-primary-500 transition-all">
          <span class="text-sm font-bold text-gray-600">
            <svg class="w-5 h-5 inline-block rtl:ml-1 ltr:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </span>
          <input type="text" v-model="filterCustomer" @keyup.enter="fetchOrders" placeholder="بحث باسم الزبون..." class="border-none focus:ring-0 p-0 font-bold text-sm text-gray-700 bg-transparent outline-none w-32 sm:w-48">
        </div>
        <div class="flex items-center gap-2 bg-gray-50 px-4 py-2 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-primary-500 transition-all">
          <span class="text-sm font-bold text-gray-600">
            <svg class="w-5 h-5 inline-block rtl:ml-1 ltr:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            {{ $t('attendance_monitor.date') }}:
          </span>
          <input type="date" v-model="filterDate" @change="fetchOrders" class="border-none focus:ring-0 p-0 font-bold text-sm text-primary-700 bg-transparent outline-none">
          <button v-if="filterDate" @click="filterDate = ''; fetchOrders()" class="text-gray-400 hover:text-red-500 ml-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-500 mb-1">إجمالي المبيعات (حسب الفلتر)</p>
          <p class="text-2xl font-black text-secondary-600">{{ totalFilteredAmount.toFixed(2) }} {{ useCookie('erp_currency').value || 'SAR' }}</p>
        </div>
        <div class="bg-secondary-50 text-secondary-600 p-3 rounded-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-500 mb-1">عدد الطلبات (حسب الفلتر)</p>
          <p class="text-2xl font-black text-primary-600">{{ orders.length }}</p>
        </div>
        <div class="bg-primary-50 text-primary-600 p-3 rounded-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('restaurant.order_number') }}</th>
              <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">الزبون</th>
              <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('restaurant.time') }}</th>
              <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('restaurant.order_type') }}</th>
              <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('restaurant.items') }}</th>
              <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('restaurant.total_amount') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="order in paginatedOrders" :key="order._id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary-600">
                {{ order.orderNumber }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                {{ order.customerName || order.deliveryDetails?.customerName || '-' }}
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
                {{ order.financials?.grandTotal?.toFixed(2) }} {{ useCookie('erp_currency').value || 'SAR' }}
              </td>
            </tr>
            <tr v-if="paginatedOrders.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500 text-sm font-medium">
                {{ $t('common.no_data') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination -->
      <Pagination 
        v-if="orders.length > 0"
        :totalItems="orders.length" 
        :itemsPerPage="itemsPerPage"
        v-model:currentPage="currentPage" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import Pagination from '~/components/Pagination.vue'

definePageMeta({
  layout: 'dashboard'
})

const { $api } = useNuxtApp()

const filterDate = ref(new Date().toISOString().split('T')[0])
const filterCustomer = ref('')
const orders = ref([])
const loading = ref(true)

const currentPage = ref(1)
const itemsPerPage = 15

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return orders.value.slice(start, start + itemsPerPage)
})

const totalFilteredAmount = computed(() => {
  return orders.value.reduce((sum, order) => sum + (order.financials?.grandTotal || 0), 0)
})

const formatTime = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const fetchOrders = async () => {
  loading.value = true
  try {
    const dateParam = filterDate.value ? `&date=${filterDate.value}` : ''
    const customerParam = filterCustomer.value ? `&customer=${encodeURIComponent(filterCustomer.value)}` : ''
    orders.value = await $api(`/restaurant/orders/completed?${dateParam}${customerParam}`)
    currentPage.value = 1
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
