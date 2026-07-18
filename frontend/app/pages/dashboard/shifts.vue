<template>
  <div class="p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ $t('cash_shifts_page.title') }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ $t('cash_shifts_page.description') }}</p>
        </div>
      </div>

      <!-- Filters & Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 font-bold mb-1">{{ $t('cash_shifts_page.total_shifts') }}</p>
            <h3 class="text-3xl font-black text-gray-900">{{ shifts.length }}</h3>
          </div>
          <div class="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 font-bold mb-1">{{ $t('cash_shifts_page.open_shifts') }}</p>
            <h3 class="text-3xl font-black text-emerald-600">{{ openShiftsCount }}</h3>
          </div>
          <div class="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div v-if="loading" class="flex justify-center p-12">
          <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase tracking-wider">{{ $t('cash_shifts_page.cashier') }}</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase tracking-wider">{{ $t('cash_shifts_page.status') }}</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase tracking-wider">{{ $t('cash_shifts_page.opened_at') }}</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase tracking-wider">{{ $t('cash_shifts_page.closed_at') }}</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase tracking-wider">{{ $t('cash_shifts_page.opening_balance') }}</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase tracking-wider">{{ $t('cash_shifts_page.expected_balance') }}</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase tracking-wider">{{ $t('cash_shifts_page.closing_balance') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="shift in shifts" :key="shift._id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900">{{ shift.cashierId?.name || $t('cash_shifts_page.unknown_cashier') }}</div>
                  <div class="text-xs text-gray-500">{{ shift.cashierId?.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-if="shift.status === 'Open'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {{ $t('cash_shifts_page.status_open') }}
                  </span>
                  <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
                    {{ $t('cash_shifts_page.status_closed') }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ new Date(shift.openedAt).toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ shift.closedAt ? new Date(shift.closedAt).toLocaleString() : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  ${{ shift.openingBalance?.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">
                  {{ shift.expectedBalance !== undefined ? '$' + shift.expectedBalance?.toFixed(2) : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="shift.closingBalance !== undefined" class="text-sm font-bold" :class="(shift.closingBalance >= shift.expectedBalance) ? 'text-emerald-600' : 'text-red-600'">
                    ${{ shift.closingBalance?.toFixed(2) }}
                    <span v-if="shift.closingBalance !== shift.expectedBalance" class="text-xs ms-1">
                      ({{ (shift.closingBalance - shift.expectedBalance) > 0 ? '+' : '' }}{{ (shift.closingBalance - shift.expectedBalance).toFixed(2) }})
                    </span>
                  </div>
                  <div v-else class="text-sm text-gray-400">-</div>
                </td>
              </tr>
              <tr v-if="shifts.length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-gray-500 font-medium">
                  {{ $t('cash_shifts_page.no_shifts_found') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Cash Shifts Tracking' })

import { ref, onMounted, computed } from 'vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { $api } = useNuxtApp()
const loading = ref(true)
const shifts = ref([])

const openShiftsCount = computed(() => shifts.value.filter(s => s.status === 'Open').length)

const fetchShifts = async () => {
  try {
    shifts.value = await $api('/pos/shifts')
  } catch (error) {
    console.error('Failed to load shifts', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchShifts()
})
</script>
