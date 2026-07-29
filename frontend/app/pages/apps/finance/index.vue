<template>
  <div class="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{{ $t('sidebar.dashboard') }} - Finance</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">{{ $t('finance_dashboard.overview') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm font-bold px-3 py-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg">{{ $t('finance_dashboard.today') }} {{ new Date().toLocaleDateString() }}</span>
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
            <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">{{ $t('finance_dashboard.total_assets') }}</p>
            <h3 class="text-2xl font-black text-gray-900 dark:text-white whitespace-nowrap">{{ stats.metrics?.totalAssets || 0 }} <span class="text-sm text-gray-400">{{ $t('finance_dashboard.sar') }}</span></h3>
          </div>
          <div class="p-3 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm font-bold text-emerald-600 relative z-10">
          <svg class="w-4 h-4 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
          {{ $t('finance_dashboard.vs_last_month') }}
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full blur-2xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-all"></div>
        <div class="flex justify-between items-start relative z-10">
          <div>
            <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">{{ $t('finance_dashboard.total_revenue') }}</p>
            <h3 class="text-2xl font-black text-gray-900 dark:text-white whitespace-nowrap">{{ stats.metrics?.totalRevenue || 0 }} <span class="text-sm text-gray-400">{{ $t('finance_dashboard.sar') }}</span></h3>
          </div>
          <div class="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm font-bold text-emerald-600 relative z-10">
          <svg class="w-4 h-4 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
          {{ $t('finance_dashboard.vs_last_month') }}
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full blur-2xl group-hover:bg-rose-100 dark:group-hover:bg-rose-900/30 transition-all"></div>
        <div class="flex justify-between items-start relative z-10">
          <div>
            <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">{{ $t('finance_dashboard.total_expenses') }}</p>
            <h3 class="text-2xl font-black text-gray-900 dark:text-white whitespace-nowrap">{{ stats.metrics?.totalExpenses || 0 }} <span class="text-sm text-gray-400">{{ $t('finance_dashboard.sar') }}</span></h3>
          </div>
          <div class="p-3 bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm font-bold text-rose-600 relative z-10">
          <svg class="w-4 h-4 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
          {{ $t('finance_dashboard.vs_last_month') }}
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-full blur-2xl group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-all"></div>
        <div class="flex justify-between items-start relative z-10">
          <div>
            <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">{{ $t('finance_dashboard.pending_checks') }}</p>
            <h3 class="text-2xl font-black text-gray-900 dark:text-white whitespace-nowrap">{{ stats.metrics?.pendingChecks || 0 }}</h3>
          </div>
          <div class="p-3 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm font-bold text-gray-500 dark:text-gray-400 relative z-10">
          {{ $t('finance_dashboard.needs_action') }}
        </div>
      </div>
    </div>

    <div v-if="!loading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-black text-gray-900 dark:text-white tracking-tight">{{ $t('finance_dashboard.recent_transactions') }}</h2>
          <NuxtLink to="/apps/finance/accounting" class="text-sm font-bold text-indigo-600 hover:text-indigo-700">{{ $t('finance_dashboard.journal') }}</NuxtLink>
        </div>
        <div class="space-y-4">
          <div v-if="!stats.recentTransactions?.length" class="text-sm text-gray-500 text-center py-4">
            No recent transactions
          </div>
          <div v-for="(t, i) in stats.recentTransactions" :key="t.id" class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-3">
              <div :class="t.type === 'out' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'" class="w-10 h-10 rounded-full flex items-center justify-center font-bold">
                <svg v-if="t.type === 'out'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
              </div>
              <div>
                <p class="font-bold text-gray-900 dark:text-white text-sm">{{ t.reference }}</p>
                <p class="text-xs text-gray-500 font-medium">{{ $t('finance_dashboard.journal') }}</p>
              </div>
            </div>
            <span class="font-bold text-sm" :class="t.type === 'out' ? 'text-rose-600' : 'text-emerald-600'">
              {{ t.type === 'out' ? '-' : '+' }}{{ t.amount }} {{ $t('finance_dashboard.sar') }}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-black text-gray-900 dark:text-white tracking-tight">{{ $t('finance_dashboard.financial_health') }}</h2>
          </div>
          <div class="relative pt-1">
            <div class="flex mb-2 items-center justify-between">
              <div>
                <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                  {{ $t('finance_dashboard.profit_margin') }}
                </span>
              </div>
              <div class="text-right">
                <span class="text-xs font-semibold inline-block text-indigo-600">
                  {{ stats.metrics?.profitMargin || 0 }}%
                </span>
              </div>
            </div>
            <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
              <div :style="`width: ${Math.max(0, Math.min(100, stats.metrics?.profitMargin || 0))}%`" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
            </div>
          </div>
          <p class="text-sm text-gray-500 mt-4 leading-relaxed">{{ $t('finance_dashboard.health_desc') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'Finance Dashboard' })

definePageMeta({ 
  layout: 'app-layout',
  middleware: ['auth', 'module-guard'],
  requiredModule: 'accounting'
})

const { $api } = useNuxtApp()
const loading = ref(true)
const stats = ref({})

const fetchStats = async () => {
  try {
    loading.value = true
    const response = await $api('/finance/dashboard')
    stats.value = response
  } catch (error) {
    console.error('Failed to fetch Finance dashboard stats:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>
