<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">{{ $t('payroll.title') }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ $t('payroll.description') }}</p>
        </div>
        <div class="flex space-x-3 space-x-reverse">
          <NuxtLink to="/" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">{{ $t('payroll.dashboard') }}</NuxtLink>
        </div>
      </div>

      <!-- Action Area -->
      <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8 flex flex-col md:flex-row items-end justify-between gap-4">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('payroll.target_month') }}</label>
          <input type="month" v-model="targetMonth" class="block w-full md:w-64 border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        </div>
        <div class="flex space-x-3 space-x-reverse w-full md:w-auto">
          <button @click="runPayroll" class="flex-1 md:flex-none px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors flex justify-center items-center">
            <svg class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {{ $t('payroll.generate') }}
          </button>
          <button @click="printPayroll" class="flex-1 md:flex-none px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 shadow-sm transition-colors flex justify-center items-center">
            {{ $t('payroll.print_sheet') }}
          </button>
        </div>
      </div>

      <!-- Payroll Table -->
      <div id="payroll-printable-area" class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div class="p-4 border-b border-gray-200 bg-gray-50 hidden print:block">
           <h2 class="text-2xl font-bold text-gray-900 text-center">{{ $t('payroll.sheet_title') }} {{ targetMonth }}</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('payroll.month') }}</th>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('payroll.employee') }}</th>
                <th class="px-6 py-4 text-end text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('payroll.basic') }}</th>
                <th class="px-6 py-4 text-end text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('payroll.allowances') }}</th>
                <th class="px-6 py-4 text-end text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('payroll.overtime') }}</th>
                <th class="px-6 py-4 text-end text-xs font-bold text-gray-500 uppercase tracking-wider text-red-600">{{ $t('payroll.deductions') }}</th>
                <th class="px-6 py-4 text-end text-xs font-bold text-gray-900 uppercase tracking-wider">{{ $t('payroll.net_salary') }}</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider print:hidden">{{ $t('payroll.status') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="run in filteredPayroll" :key="run._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{{ run.month }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900">{{ run.employeeId?.name || $t('payroll.unknown') }}</div>
                  <div class="text-xs text-gray-500">{{ run.employeeId?.position }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-end font-medium text-gray-600">{{ run.basicSalary.toFixed(2) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-end font-medium text-green-600">+ {{ run.totalAllowances.toFixed(2) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-end font-medium text-green-600">
                  <span :title="$t('payroll.overtime_hours')" class="cursor-help">+ {{ run.totalOvertimePay.toFixed(2) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-end font-medium text-red-600">- {{ run.deductions.toFixed(2) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-end font-black text-gray-900 bg-gray-50">${{ run.netSalary.toFixed(2) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm print:hidden">
                  <button v-if="!run.isPaid" @click="markAsPaid(run._id)" class="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-md text-xs transition-colors">{{ $t('payroll.mark_paid') }}</button>
                  <span v-else class="px-3 py-1 bg-green-100 text-green-800 font-bold rounded-md text-xs inline-flex items-center">
                    <svg class="w-3 h-3 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    {{ $t('payroll.paid') }}
                  </span>
                </td>
              </tr>
              <tr v-if="filteredPayroll.length === 0">
                <td colspan="8" class="px-6 py-12 text-center text-sm text-gray-500">{{ $t('payroll.no_data') }} {{ targetMonth }}{{ $t('payroll.no_data_click') }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50 font-bold" v-if="filteredPayroll.length > 0">
              <tr>
                <td colspan="6" class="px-6 py-4 text-end text-sm text-gray-900 uppercase">{{ $t('payroll.total_cost') }}</td>
                <td class="px-6 py-4 text-end text-lg text-indigo-700">${{ totalNetPayroll.toFixed(2) }}</td>
                <td class="print:hidden"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Payroll' })

import { ref, computed, onMounted } from 'vue'

definePageMeta({ 
  layout: 'dashboard',
  middleware: ['auth', 'module-guard'],
  requiredModule: 'hr'
})

const { $api } = useNuxtApp()
const payrollRuns = ref([])

const now = new Date()
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
const targetMonth = ref(currentMonth)

const filteredPayroll = computed(() => {
  return payrollRuns.value.filter(run => run.month === targetMonth.value)
})

const totalNetPayroll = computed(() => {
  return filteredPayroll.value.reduce((sum, run) => sum + run.netSalary, 0)
})

const fetchPayroll = async () => {
  try {
    payrollRuns.value = await $api('/hr/payroll')
  } catch (error) {
    console.error('Failed to fetch payroll', error)
  }
}

const runPayroll = async () => {
  if (!confirm(`${useNuxtApp().$i18n.t('payroll.confirm_generate')} ${targetMonth.value}?`)) return
  
  try {
    await $api('/hr/payroll/calculate', {
      method: 'POST',
      body: { month: targetMonth.value }
    })
    alert(useNuxtApp().$i18n.t('payroll.success_generate'))
    fetchPayroll()
  } catch (error) {
    alert(error.data?.message || useNuxtApp().$i18n.t('payroll.failed_generate'))
  }
}

const markAsPaid = async (id) => {
  try {
    await $api(`/hr/payroll/pay/${id}`, { method: 'PUT' })
    fetchPayroll()
  } catch (error) {
    alert(error.data?.message || useNuxtApp().$i18n.t('payroll.failed_update'))
  }
}

const printPayroll = () => {
  window.print()
}

onMounted(() => {
  fetchPayroll()
})
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #payroll-printable-area, #payroll-printable-area * {
    visibility: visible;
  }
  #payroll-printable-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>
