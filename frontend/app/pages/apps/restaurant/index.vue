<template>
  <div class="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{{ $t('sidebar.dashboard') }} - POS & Restaurant</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">{{ $t('pos_dashboard.overview') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm font-bold px-3 py-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg">{{ $t('pos_dashboard.today') }} {{ new Date().toLocaleDateString() }}</span>
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
            <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">{{ $t('pos_dashboard.todays_sales') }}</p>
            <h3 class="text-2xl font-black text-gray-900 dark:text-white whitespace-nowrap">{{ stats.metrics?.todaysSales || 0 }} <span class="text-sm text-gray-400">{{ $t('pos_dashboard.sar') }}</span></h3>
          </div>
          <div class="p-3 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm font-bold text-emerald-600 relative z-10">
          <svg class="w-4 h-4 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
          {{ $t('pos_dashboard.vs_yesterday') }}
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full blur-2xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-all"></div>
        <div class="flex justify-between items-start relative z-10">
          <div>
            <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">{{ $t('pos_dashboard.orders') }}</p>
            <h3 class="text-3xl font-black text-gray-900 dark:text-white">{{ stats.metrics?.totalOrders || 0 }}</h3>
          </div>
          <div class="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm font-bold text-emerald-600 relative z-10">
          <svg class="w-4 h-4 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
          {{ $t('pos_dashboard.vs_yesterday') }}
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-full blur-2xl group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-all"></div>
        <div class="flex justify-between items-start relative z-10">
          <div>
            <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">{{ $t('pos_dashboard.active_tables') }}</p>
            <h3 class="text-3xl font-black text-gray-900 dark:text-white">{{ stats.metrics?.activeTables || 0 }}<span class="text-sm text-gray-400">/{{ Math.max(stats.metrics?.totalTables || 24, 24) }}</span></h3>
          </div>
          <div class="p-3 bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm font-bold text-purple-600 relative z-10">
          {{ Math.round((stats.metrics?.activeTables || 0) / Math.max(stats.metrics?.totalTables || 24, 1) * 100) }}% {{ $t('pos_dashboard.occupancy') }}
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-full blur-2xl group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-all"></div>
        <div class="flex justify-between items-start relative z-10">
          <div>
            <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">{{ $t('pos_dashboard.pending_kitchen') }}</p>
            <h3 class="text-3xl font-black text-gray-900 dark:text-white">{{ stats.metrics?.pendingKitchen || 0 }}</h3>
          </div>
          <div class="p-3 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm font-bold text-amber-600 relative z-10">
          {{ $t('pos_dashboard.average_prep') }} {{ stats.metrics?.avgPrepMins || 0 }} {{ $t('pos_dashboard.mins') }}
        </div>
      </div>
    </div>

    <div v-if="!loading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-black text-gray-900 dark:text-white tracking-tight">{{ $t('pos_dashboard.recent_orders') }}</h2>
          <NuxtLink to="/apps/restaurant/completed-orders" class="text-sm font-bold text-indigo-600 hover:text-indigo-700">{{ $t('pos_dashboard.view_all') }}</NuxtLink>
        </div>
        <div class="space-y-4">
          <div v-if="!stats.recentOrders?.length" class="text-sm text-gray-500 text-center py-4">
            No recent orders
          </div>
          <div v-for="o in stats.recentOrders" :key="o.id" class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">
                #{{ o.orderNumber }}
              </div>
              <div>
                <p class="font-bold text-gray-900 dark:text-white text-sm">{{ o.type }}</p>
                <p class="text-xs text-gray-500 font-medium">{{ o.itemsCount }} items • {{ new Date().toLocaleTimeString() }}</p>
              </div>
            </div>
            <span class="font-bold text-sm text-gray-900 dark:text-white">
              {{ o.total }} {{ $t('pos_dashboard.sar') }}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-black text-gray-900 dark:text-white tracking-tight">{{ $t('pos_dashboard.top_selling_items') }}</h2>
        </div>
        <div class="space-y-5">
          <div v-if="!stats.topSellingItems?.length" class="text-sm text-gray-500 text-center py-4">
            No items yet
          </div>
          <div v-for="(item, i) in stats.topSellingItems" :key="item.name || i">
            <div class="flex justify-between mb-1">
              <span class="text-sm font-bold text-gray-700 dark:text-gray-300">{{ item.name }}</span>
              <span class="text-sm font-bold text-gray-900 dark:text-white">{{ item.orders }} {{ $t('pos_dashboard.orders').toLowerCase() }}</span>
            </div>
            <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
              <div class="bg-indigo-500 h-2 rounded-full" :style="`width: ${Math.min(100, item.orders * 2)}%`"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'POS Dashboard' })

definePageMeta({ 
  layout: 'app-layout',
  middleware: ['auth', 'module-guard'],
  requiredModule: 'pos'
})

const { $api } = useNuxtApp()
const loading = ref(true)
const stats = ref({})

const fetchStats = async () => {
  try {
    loading.value = true
    const response = await $api('/pos/dashboard')
    stats.value = response
  } catch (error) {
    console.error('Failed to fetch POS dashboard stats:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>
