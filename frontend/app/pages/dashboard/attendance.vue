<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Attendance Logger</h1>
          <p class="text-sm text-gray-500 mt-1">Clock-in and Clock-out to track daily working hours.</p>
        </div>
        <div class="flex space-x-3">
          <NuxtLink to="/" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">Dashboard</NuxtLink>
        </div>
      </div>

      <!-- Employee Selection & Actions -->
      <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-4">
        <div class="flex-1 w-full">
          <label class="block text-sm font-bold text-gray-700 mb-1">Select Employee</label>
          <select v-model="selectedEmployeeId" class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="">-- Select --</option>
            <option v-for="emp in employees" :key="emp._id" :value="emp._id">{{ emp.name }} ({{ emp.position }})</option>
          </select>
        </div>
        <div class="flex space-x-3 mt-4 md:mt-6 w-full md:w-auto">
          <button @click="clockIn" :disabled="!selectedEmployeeId" class="flex-1 md:flex-none px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-sm transition-colors disabled:opacity-50 flex justify-center items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
            Clock IN
          </button>
          <button @click="clockOut" :disabled="!selectedEmployeeId" class="flex-1 md:flex-none px-6 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700 shadow-sm transition-colors disabled:opacity-50 flex justify-center items-center">
            Clock OUT
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </div>

      <!-- Month Filter -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-900">Attendance Log</h2>
        <input type="month" v-model="filterMonth" @change="fetchAttendance" class="border border-gray-300 rounded-lg py-1.5 px-3 text-sm">
      </div>

      <!-- Attendance Table -->
      <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Clock In</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Clock Out</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Hours</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="log in attendanceLogs" :key="log._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {{ log.date }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900">{{ log.employeeId?.name || 'Unknown' }}</div>
                  <div class="text-xs text-gray-500">{{ log.employeeId?.position }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ log.clockIn ? new Date(log.clockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ log.clockOut ? new Date(log.clockOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {{ log.totalHours ? log.totalHours.toFixed(2) + ' hrs' : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full"
                        :class="log.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                    {{ log.status }}
                  </span>
                </td>
              </tr>
              <tr v-if="attendanceLogs.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-sm text-gray-500">No attendance records found for this period.</td>
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
  middleware: ['auth', 'module-guard'],
  requiredModule: 'hr'
})

const { $api } = useNuxtApp()
const employees = ref([])
const attendanceLogs = ref([])
const selectedEmployeeId = ref('')

const now = new Date()
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
const filterMonth = ref(currentMonth)

const fetchData = async () => {
  try {
    employees.value = await $api('/hr/employees')
    await fetchAttendance()
  } catch (error) {
    console.error('Failed to fetch data', error)
  }
}

const fetchAttendance = async () => {
  try {
    attendanceLogs.value = await $api(`/hr/attendance/report?month=${filterMonth.value}`)
  } catch (error) {
    console.error('Failed to fetch attendance logs', error)
  }
}

const clockIn = async () => {
  try {
    await $api('/hr/attendance/clock-in', {
      method: 'POST',
      body: { employeeId: selectedEmployeeId.value }
    })
    alert('Clocked In Successfully!')
    fetchAttendance()
  } catch (error) {
    alert(error.data?.message || 'Failed to clock in')
  }
}

const clockOut = async () => {
  try {
    await $api('/hr/attendance/clock-out', {
      method: 'POST',
      body: { employeeId: selectedEmployeeId.value }
    })
    alert('Clocked Out Successfully!')
    fetchAttendance()
  } catch (error) {
    alert(error.data?.message || 'Failed to clock out')
  }
}

onMounted(() => {
  fetchData()
})
</script>
