<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <div class="max-w-6xl mx-auto space-y-6">
      
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ $t('my_attendance.title') }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ $t('my_attendance.description') }}</p>
        </div>
        <div class="flex items-center space-x-4 space-x-reverse">
          <div class="text-end me-4">
            <p class="text-xs font-bold text-gray-500 uppercase">{{ $t('my_attendance.current_time') }}</p>
            <p class="text-xl font-black text-indigo-600">{{ currentTime }}</p>
          </div>
          <button @click="punch('in')" :disabled="loadingPunch" class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-200 transition-all disabled:opacity-50">{{ $t('my_attendance.clock_in') }}</button>
          <button @click="punch('out')" :disabled="loadingPunch" class="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black shadow-lg shadow-orange-200 transition-all disabled:opacity-50">{{ $t('my_attendance.clock_out') }}</button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center space-x-4 space-x-reverse">
        <label class="text-sm font-bold text-gray-700">{{ $t('my_attendance.filter_month') }}</label>
        <input type="month" v-model="filterMonth" @change="fetchAttendance" class="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-sm">
      </div>

      <div v-if="loading" class="flex justify-center p-12">
        <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
      
      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('my_attendance.date') }}</th>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('my_attendance.status') }}</th>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('my_attendance.clock_in') }}</th>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('my_attendance.clock_out') }}</th>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('my_attendance.total_hrs') }}</th>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('my_attendance.overtime') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="row in attendance" :key="row._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{{ row.date }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="{'bg-emerald-100 text-emerald-800': row.status === 'Present', 'bg-red-100 text-red-800': row.status === 'Absent', 'bg-yellow-100 text-yellow-800': row.status === 'Late' || row.isAnomalous}" class="px-2 py-1 text-[10px] font-bold uppercase rounded-md">
                  {{ row.isAnomalous ? $t('my_attendance.anomaly') : (row.status === 'Present' ? $t('my_attendance.present') : (row.status === 'Late' ? $t('my_attendance.late') : (row.status === 'Absent' ? $t('my_attendance.absent') : row.status))) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                {{ formatTime(row.clockIn) }}
                <div v-if="row.punchInType" class="text-[10px] text-gray-500 uppercase">{{ row.punchInType }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                {{ formatTime(row.clockOut) }}
                <div v-if="row.punchOutType" class="text-[10px] text-gray-500 uppercase">{{ row.punchOutType }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">{{ row.totalHours }}{{ $t('my_attendance.hrs_abbrev') }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-600">
                <span v-if="row.overtimeHours > 0">{{ row.overtimeHours }}{{ $t('my_attendance.hrs_abbrev') }} <span class="text-[10px] uppercase text-gray-500 ms-1">({{row.overtimeStatus}})</span></span>
                <span v-else class="text-gray-400">-</span>
              </td>
            </tr>
            <tr v-if="attendance.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500 font-bold">{{ $t('my_attendance.no_records') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script setup>
useHead({ title: 'My Attendance' })

import { ref, onMounted, onUnmounted } from 'vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { $api } = useNuxtApp()

const attendance = ref([])
const loading = ref(true)
const loadingPunch = ref(false)

const d = new Date()
const currentMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
const filterMonth = ref(currentMonthStr)

const currentTime = ref(new Date().toLocaleTimeString())
let timer = null

onMounted(() => {
  timer = setInterval(() => { currentTime.value = new Date().toLocaleTimeString() }, 1000)
  fetchAttendance()
})

onUnmounted(() => { if (timer) clearInterval(timer) })

const formatTime = (isoString) => {
  if (!isoString) return '--:--'
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const fetchAttendance = async () => {
  loading.value = true
  try {
    attendance.value = await $api(`/ess/my-attendance?month=${filterMonth.value}`)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const punch = async (type) => {
  loadingPunch.value = true
  try {
    await $api('/ess/my-attendance/punch', { method: 'POST', body: { type } })
    await fetchAttendance()
  } catch (err) {
    alert(err.response?.data?.message || useNuxtApp().$i18n.t('my_attendance.punch_failed'))
  } finally {
    loadingPunch.value = false
  }
}
</script>
