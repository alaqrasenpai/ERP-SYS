<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h2 class="text-2xl font-black text-gray-900 tracking-tight">Double-Entry Accounting Ledger</h2>
      <div class="flex space-x-3 mt-4 sm:mt-0">
        <NuxtLink to="/" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 shadow-sm transition-colors flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Dashboard
        </NuxtLink>
      </div>
    </div>

    <!-- Chart of Accounts Grid -->
    <div>
      <h3 class="text-xl font-black text-gray-900 mb-5 tracking-tight flex items-center">
        <svg class="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
        Chart of Accounts (Live Balances)
      </h3>
      <div v-if="loading" class="flex justify-center p-8">
        <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="acc in accounts" :key="acc.code" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all relative group">
          <div class="absolute top-0 left-0 w-1.5 h-full" :class="getBorderColor(acc.type)"></div>
          <div class="p-5 pl-6">
            <div class="flex justify-between items-center mb-4">
              <span class="px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-200 text-xs font-black rounded-lg font-mono">{{ acc.code }}</span>
              <span class="text-xs font-bold px-2.5 py-1 rounded-lg" :class="getTypeBadgeClass(acc.type)">{{ acc.type }}</span>
            </div>
            <h4 class="font-bold text-gray-500 text-sm mb-1 uppercase tracking-wider">{{ acc.name }}</h4>
            <div class="flex items-end mt-2">
              <p class="text-3xl font-black tracking-tight" :class="getAccountColor(acc.type, acc.balance)">
                <span class="text-xl font-medium opacity-50 mr-0.5">$</span>{{ Math.abs(acc.balance).toLocaleString('en-US', {minimumFractionDigits: 2}) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- General Journal Ledger -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8">
      <div class="px-6 py-5 border-b border-gray-100 bg-white flex justify-between items-center">
        <div>
          <h3 class="text-lg font-black text-gray-900 tracking-tight flex items-center">
            <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            General Journal
          </h3>
          <p class="text-sm text-gray-500 font-medium mt-1">Chronological record of all financial transactions</p>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50/50">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider w-1/4">Date & Reference</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider w-1/4">Account</th>
              <th scope="col" class="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider w-1/4">Debit</th>
              <th scope="col" class="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider w-1/4">Credit</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <template v-for="entry in journal" :key="entry._id">
              <!-- Entry Header Row -->
              <tr class="bg-indigo-50/30 border-t-2 border-indigo-100/50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900">{{ new Date(entry.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</div>
                  <div class="text-xs font-bold text-indigo-600 mt-1">{{ entry.entryNumber }}</div>
                </td>
                <td colspan="3" class="px-6 py-4">
                  <span class="text-sm font-bold text-gray-800 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">{{ entry.description }}</span>
                </td>
              </tr>
              <!-- Entry Lines Rows -->
              <tr v-for="(line, idx) in entry.lines" :key="`${entry._id}-${idx}`" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-6 py-3"></td>
                <td class="px-6 py-3 whitespace-nowrap" :class="{'pl-12': line.credit > 0}">
                  <div class="flex items-center">
                    <svg v-if="line.credit > 0" class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    <div>
                      <div class="text-sm font-bold" :class="line.debit > 0 ? 'text-gray-900' : 'text-gray-600'">{{ line.accountId?.name || 'Unknown Account' }}</div>
                      <div class="text-xs text-gray-500 font-mono mt-0.5">{{ line.accountId?.code }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-3 whitespace-nowrap text-right font-mono">
                  <span v-if="line.debit > 0" class="inline-flex px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-sm rounded-lg border border-emerald-100">
                    {{ line.debit.toLocaleString('en-US', {minimumFractionDigits: 2}) }}
                  </span>
                </td>
                <td class="px-6 py-3 whitespace-nowrap text-right font-mono">
                  <span v-if="line.credit > 0" class="inline-flex px-3 py-1 bg-rose-50 text-rose-700 font-bold text-sm rounded-lg border border-rose-100">
                    {{ line.credit.toLocaleString('en-US', {minimumFractionDigits: 2}) }}
                  </span>
                </td>
              </tr>
            </template>
            <tr v-if="journal.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <p class="text-sm font-bold">No journal entries found.</p>
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
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { $api } = useNuxtApp()
const accounts = ref([])
const journal = ref([])
const loading = ref(true)

const fetchData = async () => {
  loading.value = true
  try {
    const [accData, jeData] = await Promise.all([
      $api('/finance/accounts'),
      $api('/finance/journal')
    ])
    accounts.value = accData
    journal.value = jeData
  } catch (error) {
    console.error('Failed to load accounting data', error)
  } finally {
    loading.value = false
  }
}

const getAccountColor = (type, balance) => {
  if (balance === 0) return 'text-gray-900'
  if (type === 'Asset') return balance > 0 ? 'text-emerald-600' : 'text-rose-600'
  if (type === 'Liability') return balance > 0 ? 'text-orange-600' : 'text-emerald-600'
  if (type === 'Revenue') return 'text-emerald-600'
  if (type === 'Expense') return 'text-rose-600'
  return 'text-gray-900'
}

const getTypeBadgeClass = (type) => {
  if (type === 'Asset') return 'bg-blue-50 text-blue-700 border border-blue-200'
  if (type === 'Liability') return 'bg-orange-50 text-orange-700 border border-orange-200'
  if (type === 'Revenue') return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  if (type === 'Expense') return 'bg-rose-50 text-rose-700 border border-rose-200'
  return 'bg-gray-50 text-gray-700 border border-gray-200'
}

const getBorderColor = (type) => {
  if (type === 'Asset') return 'bg-blue-500'
  if (type === 'Liability') return 'bg-orange-500'
  if (type === 'Revenue') return 'bg-emerald-500'
  if (type === 'Expense') return 'bg-rose-500'
  return 'bg-gray-300'
}

onMounted(fetchData)
</script>
