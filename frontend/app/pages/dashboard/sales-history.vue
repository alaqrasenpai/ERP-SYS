<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Sales History</h1>
          <p class="text-sm text-gray-500 mt-1">Review past POS orders, receipts, and cash shifts.</p>
        </div>
        <div class="flex space-x-3">
          <NuxtLink to="/" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">Dashboard</NuxtLink>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
           <div class="flex items-center justify-between">
              <div>
                 <p class="text-sm font-medium text-gray-500">Total Sales (Cash)</p>
                 <p class="text-2xl font-bold text-emerald-600">${{ totalCash.toFixed(2) }}</p>
              </div>
              <div class="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                 <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
           </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
           <div class="flex items-center justify-between">
              <div>
                 <p class="text-sm font-medium text-gray-500">Total Sales (Card)</p>
                 <p class="text-2xl font-bold text-blue-600">${{ totalCard.toFixed(2) }}</p>
              </div>
              <div class="p-3 bg-blue-50 text-blue-600 rounded-lg">
                 <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              </div>
           </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
           <div class="flex items-center justify-between">
              <div>
                 <p class="text-sm font-medium text-gray-500">Total Orders</p>
                 <p class="text-2xl font-bold text-gray-900">{{ orders.length }}</p>
              </div>
              <div class="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                 <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              </div>
           </div>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order No</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Items Count</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="order in orders" :key="order._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ new Date(order.createdAt).toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">
                  {{ order.orderNumber }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ order.items.length }} items
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full"
                        :class="order.paymentMethod === 'Cash' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'">
                    {{ order.paymentMethod }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-black text-right text-gray-900">
                  ${{ order.grandTotal.toFixed(2) }}
                </td>
              </tr>
              <tr v-if="orders.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-sm text-gray-500">No sales history found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

definePageMeta({ middleware: ['auth'] })

const { $api } = useNuxtApp()
const orders = ref([])

const fetchOrders = async () => {
  try {
    orders.value = await $api('/pos/orders')
  } catch (error) {
    console.error('Failed to fetch orders', error)
  }
}

const totalCash = computed(() => {
  return orders.value.filter(o => o.paymentMethod === 'Cash').reduce((sum, o) => sum + o.grandTotal, 0)
})

const totalCard = computed(() => {
  return orders.value.filter(o => o.paymentMethod === 'Card').reduce((sum, o) => sum + o.grandTotal, 0)
})

onMounted(() => {
  fetchOrders()
})
</script>
