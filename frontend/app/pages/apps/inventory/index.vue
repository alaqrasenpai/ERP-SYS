<template>
  <div class="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{{ $t('sidebar.dashboard') }} - Inventory</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">{{ $t('inventory_dashboard.overview') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm font-bold px-3 py-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg">{{ $t('inventory_dashboard.today') }} {{ new Date().toLocaleDateString() }}</span>
      </div>
    </div>

    <!-- Stats Grid -->
    <div v-if="loading" class="flex justify-center p-8">
      <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-2xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-all"></div>
        <div class="flex justify-between items-start relative z-10">
          <div>
            <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">{{ $t('inventory_dashboard.total_items') }}</p>
            <h3 class="text-3xl font-black text-gray-900 dark:text-white">{{ stats.metrics?.totalItems || 0 }}</h3>
          </div>
          <div class="p-3 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm font-bold text-emerald-600 relative z-10">
          {{ $t('inventory_dashboard.in_categories') }} {{ stats.metrics?.totalCategories || 0 }}
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full blur-2xl group-hover:bg-rose-100 dark:group-hover:bg-rose-900/30 transition-all"></div>
        <div class="flex justify-between items-start relative z-10">
          <div>
            <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">{{ $t('inventory_dashboard.low_stock_alerts') }}</p>
            <h3 class="text-3xl font-black text-rose-600 dark:text-rose-500">{{ stats.metrics?.lowStockAlerts || 0 }}</h3>
          </div>
          <div class="p-3 bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm font-bold text-rose-600 relative z-10">
          {{ $t('inventory_dashboard.require_reorder') }}
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full blur-2xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-all"></div>
        <div class="flex justify-between items-start relative z-10">
          <div>
            <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">{{ $t('inventory_dashboard.inventory_value') }}</p>
            <h3 class="text-2xl font-black text-gray-900 dark:text-white whitespace-nowrap">{{ stats.metrics?.inventoryValue || 0 }} <span class="text-sm text-gray-400">{{ $t('inventory_dashboard.sar') }}</span></h3>
          </div>
          <div class="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm font-bold text-emerald-600 relative z-10">
          {{ $t('inventory_dashboard.estimated_retail_value') }}
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-full blur-2xl group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-all"></div>
        <div class="flex justify-between items-start relative z-10">
          <div>
            <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">{{ $t('inventory_dashboard.pending_movements') }}</p>
            <h3 class="text-3xl font-black text-gray-900 dark:text-white">{{ stats.metrics?.pendingMovements || 0 }}</h3>
          </div>
          <div class="p-3 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm font-bold text-gray-500 dark:text-gray-400 relative z-10">
          {{ $t('inventory_dashboard.incoming_shipments') }}
        </div>
      </div>
    </div>

    <div v-if="!loading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-black text-gray-900 dark:text-white tracking-tight">{{ $t('inventory_dashboard.recent_stock_movements') }}</h2>
          <NuxtLink to="/apps/inventory/movements" class="text-sm font-bold text-indigo-600 hover:text-indigo-700">{{ $t('inventory_dashboard.view_all') }}</NuxtLink>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th class="px-4 py-3">{{ $t('inventory_dashboard.item') }}</th>
                <th class="px-4 py-3">{{ $t('inventory_dashboard.type') }}</th>
                <th class="px-4 py-3">{{ $t('inventory_dashboard.qty') }}</th>
                <th class="px-4 py-3">{{ $t('inventory_dashboard.date') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr v-if="!stats.recentMovements?.length">
                <td colspan="4" class="px-4 py-4 text-center text-gray-500">No recent movements</td>
              </tr>
              <tr v-for="(m, i) in stats.recentMovements" :key="m.id || i">
                <td class="px-4 py-3 font-bold text-gray-900 dark:text-white">{{ m.itemName }}</td>
                <td class="px-4 py-3">
                  <span :class="m.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'" class="px-2 py-1 rounded text-xs font-bold">
                    {{ m.type }}
                  </span>
                </td>
                <td class="px-4 py-3 font-mono">{{ m.type === 'IN' ? '+' : '-' }}{{ m.quantity }}</td>
                <td class="px-4 py-3 text-gray-500">{{ new Date().toLocaleDateString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-black text-gray-900 dark:text-white tracking-tight">{{ $t('inventory_dashboard.top_categories') }}</h2>
        </div>
        <div class="space-y-5">
          <div v-if="!stats.topCategories?.length" class="text-sm text-gray-500 text-center py-4">
            No categories
          </div>
          <div v-for="(c, i) in stats.topCategories" :key="c.name || i">
            <div class="flex justify-between mb-1">
              <span class="text-sm font-bold text-gray-700 dark:text-gray-300">{{ c.name }}</span>
              <span class="text-sm font-bold text-gray-900 dark:text-white">{{ 45 - (i * 10) }}%</span>
            </div>
            <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
              <div :class="i === 0 ? 'bg-indigo-500' : i === 1 ? 'bg-indigo-400' : i === 2 ? 'bg-indigo-300' : 'bg-gray-300'" class="h-2 rounded-full" :style="`width: ${45 - (i * 10)}%`"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'Inventory Dashboard' })

definePageMeta({ 
  layout: 'app-layout',
  middleware: ['auth', 'module-guard'],
  requiredModule: 'inventory'
})

const { $api } = useNuxtApp()
const loading = ref(true)
const stats = ref({})

const fetchStats = async () => {
  try {
    loading.value = true
    const response = await $api('/inventory/dashboard')
    stats.value = response
  } catch (error) {
    console.error('Failed to fetch Inventory dashboard stats:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>
