<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">Financial Reports & Insights</h2>
          <p class="text-sm text-gray-500 mt-1">Real-time business intelligence and performance tracking.</p>
        </div>
        <div class="flex space-x-3 mt-4 sm:mt-0 print:hidden">
          <button @click="printReport" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 shadow-sm transition-colors flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Print / PDF
          </button>
          <button @click="exportCSV" class="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-sm transition-colors flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Export Excel
          </button>
          <NuxtLink to="/" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 shadow-sm transition-colors flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Dashboard
          </NuxtLink>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6 print:hidden">
        <nav class="flex divide-x divide-gray-200" aria-label="Tabs">
          <button @click="activeReport = 'pnl'" :class="activeReport === 'pnl' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'" class="flex-1 group relative min-w-0 overflow-hidden py-4 px-4 text-center text-sm font-bold hover:bg-gray-50 focus:z-10 transition-colors">
            <span>Profit & Loss</span>
            <span aria-hidden="true" :class="activeReport === 'pnl' ? 'bg-indigo-500' : 'bg-transparent'" class="absolute inset-x-0 bottom-0 h-1"></span>
          </button>
          <button @click="activeReport = 'debtors'" :class="activeReport === 'debtors' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'" class="flex-1 group relative min-w-0 overflow-hidden py-4 px-4 text-center text-sm font-bold hover:bg-gray-50 focus:z-10 transition-colors">
            <span>Debtors & Collections</span>
            <span aria-hidden="true" :class="activeReport === 'debtors' ? 'bg-indigo-500' : 'bg-transparent'" class="absolute inset-x-0 bottom-0 h-1"></span>
          </button>
          <button @click="activeReport = 'inventory'" :class="activeReport === 'inventory' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'" class="flex-1 group relative min-w-0 overflow-hidden py-4 px-4 text-center text-sm font-bold hover:bg-gray-50 focus:z-10 transition-colors">
            <span>Inventory Valuation</span>
            <span aria-hidden="true" :class="activeReport === 'inventory' ? 'bg-indigo-500' : 'bg-transparent'" class="absolute inset-x-0 bottom-0 h-1"></span>
          </button>
        </nav>
      </div>

      <div v-if="loading" class="flex justify-center p-12">
        <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>

      <template v-else>
        <!-- Profit & Loss Report -->
        <div v-if="activeReport === 'pnl'" class="space-y-6">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 print:hidden">
            <h3 class="font-bold text-gray-900 mb-4">Date Range Filter</h3>
            <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-end">
              <div class="flex-1">
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
                <input v-model="dateRange.start" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
              </div>
              <div class="flex-1">
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
                <input v-model="dateRange.end" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
              </div>
              <button @click="fetchPnL" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm">
                Generate Report
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <p class="text-sm font-bold text-gray-500 uppercase">Total Revenue</p>
              <p class="text-3xl font-black text-emerald-600 mt-2">{{ currency }}{{ (pnl.totalRevenue || 0).toLocaleString('en-US', {minimumFractionDigits: 2}) }}</p>
              <p class="text-xs text-gray-400 mt-1">From Sales (Credit)</p>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <p class="text-sm font-bold text-gray-500 uppercase">COGS & Expenses</p>
              <p class="text-3xl font-black text-rose-600 mt-2">{{ currency }}{{ (pnl.totalCostAndExpenses || 0).toLocaleString('en-US', {minimumFractionDigits: 2}) }}</p>
              <p class="text-xs text-gray-400 mt-1">Cost of Goods + Operating (Debit)</p>
            </div>
            <div class="bg-indigo-600 p-6 rounded-2xl shadow-md border border-indigo-700 text-white">
              <p class="text-sm font-bold text-indigo-200 uppercase">Net Profit</p>
              <p class="text-4xl font-black mt-2">{{ currency }}{{ (pnl.netProfit || 0).toLocaleString('en-US', {minimumFractionDigits: 2}) }}</p>
              <p class="text-xs text-indigo-200 mt-1">Revenue - Expenses</p>
            </div>
          </div>
        </div>

        <!-- Debtors & Overdue Report -->
        <div v-if="activeReport === 'debtors'" class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
              <h3 class="text-lg font-black text-gray-900 tracking-tight">Debtors Summary</h3>
              <p class="text-sm text-gray-500 mt-1">Customers with outstanding balances, sorted by highest debt.</p>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50/50">
                <tr>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Total Debt</th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Alerts</th>
                  <th scope="col" class="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                <tr v-for="customer in debtors" :key="customer._id" class="hover:bg-gray-50/50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-bold text-gray-900">{{ customer.name }}</div>
                    <div class="text-xs text-gray-500">{{ customer.phone || 'No Phone' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-lg font-black text-rose-600">{{ currency }}{{ customer.totalDebt.toLocaleString('en-US', {minimumFractionDigits: 2}) }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span v-if="customer.hasOverdue" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      <svg class="-ml-0.5 mr-1.5 h-3 w-3 text-rose-600" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3"></circle></svg>
                      {{ customer.overdueInstallmentsCount }} Overdue ({{ currency }}{{ customer.overdueAmount }})
                    </span>
                    <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      No Overdue Installments
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <NuxtLink to="/dashboard/customers" class="text-indigo-600 hover:text-indigo-900 font-bold">Go to CRM</NuxtLink>
                  </td>
                </tr>
                <tr v-if="debtors.length === 0">
                  <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                    <p class="text-sm font-bold">No debtors found. Everyone is paid up!</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Inventory Valuation Report -->
        <div v-if="activeReport === 'inventory'" class="space-y-6">
          <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-lg mx-auto mt-12">
            <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
            <h3 class="text-lg font-black text-gray-900 mb-2">Total Inventory Capital</h3>
            <p class="text-sm text-gray-500 mb-6">The total value of all items currently in stock, based on their purchase price.</p>
            <p class="text-5xl font-black text-blue-600 tracking-tight">{{ currency }}{{ (inventoryValuation || 0).toLocaleString('en-US', {minimumFractionDigits: 2}) }}</p>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { $api } = useNuxtApp()
const loading = ref(false)
const activeReport = ref('pnl')

const currency = ref('$')
const pnl = ref({})
const debtors = ref([])
const inventoryValuation = ref(0)

const dateRange = ref({
  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0]
})

const fetchGlobalSettings = async () => {
  try {
    const settings = await $api('/settings')
    if (settings && settings.currency) {
      currency.value = settings.currency
    }
  } catch(e) {}
}

const fetchPnL = async () => {
  loading.value = true
  try {
    pnl.value = await $api(`/reports/profit-and-loss?startDate=${dateRange.value.start}&endDate=${dateRange.value.end}`)
  } catch (e) {
    alert('Failed to load P&L')
  } finally {
    loading.value = false
  }
}

const fetchDebtors = async () => {
  loading.value = true
  try {
    debtors.value = await $api('/reports/debtors-summary')
  } catch (e) {
    alert('Failed to load Debtors')
  } finally {
    loading.value = false
  }
}

const fetchInventoryValuation = async () => {
  loading.value = true
  try {
    const res = await $api('/reports/inventory-valuation')
    inventoryValuation.value = res.totalInventoryValue
  } catch (e) {
    alert('Failed to load Inventory Valuation')
  } finally {
    loading.value = false
  }
}

const printReport = () => {
  window.print()
}

const exportCSV = () => {
  let csvContent = "data:text/csv;charset=utf-8,";
  if (activeReport.value === 'pnl') {
    csvContent += "Report,Profit & Loss\n";
    csvContent += `Start Date,${dateRange.value.start}\n`;
    csvContent += `End Date,${dateRange.value.end}\n\n`;
    csvContent += "Category,Amount\n";
    csvContent += `Total Revenue,${pnl.value.totalRevenue || 0}\n`;
    csvContent += `COGS & Expenses,${pnl.value.totalCostAndExpenses || 0}\n`;
    csvContent += `Net Profit,${pnl.value.netProfit || 0}\n`;
  } else if (activeReport.value === 'debtors') {
    csvContent += "Customer Name,Phone,Total Debt,Overdue Installments,Overdue Amount\n";
    debtors.value.forEach(c => {
      csvContent += `"${c.name}","${c.phone||''}","${c.totalDebt}","${c.overdueInstallmentsCount}","${c.overdueAmount}"\n`;
    });
  } else if (activeReport.value === 'inventory') {
    csvContent += "Report,Inventory Valuation\n";
    csvContent += `Total Inventory Capital,${inventoryValuation.value || 0}\n`;
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${activeReport.value}_report.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

watch(activeReport, (newVal) => {
  if (newVal === 'pnl') fetchPnL()
  else if (newVal === 'debtors') fetchDebtors()
  else if (newVal === 'inventory') fetchInventoryValuation()
})

onMounted(async () => {
  await fetchGlobalSettings()
  fetchPnL() // Default active report
})
</script>

<style>
@media print {
  body {
    background-color: white !important;
  }
  .print\:hidden {
    display: none !important;
  }
  .shadow-sm, .shadow-md {
    box-shadow: none !important;
  }
}
</style>
