<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">{{ $t('attendance.title') }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ $t('attendance.description') }}</p>
        </div>
      </div>

      <!-- Sync / Simulate Biometric Punch -->
      <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-8">
        <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <svg class="w-5 h-5 me-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path></svg>
          {{ $t('attendance.device_sync') }}
        </h3>
        <div class="flex flex-col md:flex-row gap-4 items-end">
          <div class="flex-1 w-full">
            <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('attendance.employee_national_id') }}</label>
            <input v-model="sim.nationalId" type="text" :placeholder="$t('attendance.enter_national_id')" class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
          </div>
          <div class="flex-1 w-full">
            <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('attendance.punch_time') }}</label>
            <input v-model="sim.timestamp" type="datetime-local" class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
          </div>
          <button @click="simulateBiometricPunch" class="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 shadow-sm w-full md:w-auto h-10">
            {{ $t('attendance.simulate_punch') }}
          </button>
        </div>
      </div>

      <!-- Month Filter -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-900">{{ $t('attendance.live_attendance_log') }}</h2>
        <input type="month" v-model="filterMonth" @change="fetchAttendance" class="border border-gray-300 rounded-lg py-1.5 px-3 text-sm font-bold text-gray-700">
      </div>

      <!-- Attendance Table -->
      <div class="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('attendance.date') }}</th>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('attendance.employee') }}</th>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('attendance.clock_in') }}</th>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('attendance.clock_out') }}</th>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('attendance.total_hours') }}</th>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('attendance.source') }}</th>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('attendance.status') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="log in paginatedLogs" :key="log._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {{ log.date }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900">{{ log.employeeId?.name || $t('attendance.unknown') }}</div>
                  <div class="text-xs text-gray-500">{{ log.employeeId?.nationalId || $t('attendance.no_id') }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {{ log.clockIn ? new Date(log.clockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--' }}
                  <div v-if="log.lastAudit && log.lastAudit.modifiedBy" class="text-xs text-primary-500 mt-1 cursor-pointer" :title="log.lastAudit.reason">
                    * {{ $t('attendance.modified_by') }}: {{ log.lastAudit.modifiedBy }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {{ log.clockOut ? new Date(log.clockOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {{ log.totalHours ? log.totalHours.toFixed(2) + ' ' + $t('attendance.hrs') : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span class="text-xs font-medium text-gray-500 flex items-center">
                    <svg v-if="log.punchType === 'Biometric/Fingerprint'" class="w-4 h-4 me-1 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path></svg>
                    {{ log.punchType }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full mb-1"
                        :class="[ log.status === 'Present' ? 'bg-green-100 text-green-800' : '', log.status === 'Late' ? 'bg-orange-100 text-orange-800' : '', log.status === 'Absent' ? 'bg-red-100 text-red-800' : '', log.status === 'Leave' ? 'bg-primary-100 text-primary-800' : '' ]">
                    {{ log.status === 'Present' ? $t('attendance.present') : (log.status === 'Late' ? $t('attendance.late') : (log.status === 'Absent' ? $t('attendance.absent') : (log.status === 'Leave' ? $t('attendance.leave') : log.status))) }}
                  </span>
                  <div v-if="log.isAutoClosed" class="text-xs text-orange-600 bg-orange-50 inline-block px-2 py-0.5 rounded border border-orange-200 mt-1 w-full text-center">
                    {{ $t('attendance.auto_closed') }}
                  </div>
                </td>
              </tr>
              <tr v-if="attendanceLogs.length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-sm text-gray-500">{{ $t('attendance.no_records') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <Pagination 
          v-if="attendanceLogs.length > 0"
          :totalItems="attendanceLogs.length" 
          :itemsPerPage="itemsPerPage"
          v-model:currentPage="currentPage" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Attendance' })

import { ref, computed, onMounted } from 'vue'
import Pagination from '~/components/Pagination.vue'

definePageMeta({ 
  layout: 'dashboard',
  middleware: ['auth', 'module-guard'],
  requiredModule: 'hr'
})

const { $api } = useNuxtApp()
const attendanceLogs = ref([])

const currentPage = ref(1)
const itemsPerPage = 15

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return attendanceLogs.value.slice(start, start + itemsPerPage)
})

const now = new Date()
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
const filterMonth = ref(currentMonth)

const sim = ref({
  nationalId: '',
  timestamp: ''
})

const fetchAttendance = async () => {
  try {
    attendanceLogs.value = await $api(`/hr/attendance/report?month=${filterMonth.value}`)
    currentPage.value = 1
  } catch (error) {
    console.error('Failed to fetch attendance logs', error)
  }
}

const simulateBiometricPunch = async () => {
  if (!sim.value.nationalId) return alert(useNuxtApp().$i18n.t('attendance.enter_id_alert'))
  try {
    const timestamp = sim.value.timestamp ? new Date(sim.value.timestamp).toISOString() : new Date().toISOString()
    await $api('/hr/attendance/biometric-punch', {
      method: 'POST',
      body: {
        nationalId: sim.value.nationalId,
        timestamp,
        deviceId: 'SIM-DEVICE-001',
        verificationMethod: 'Fingerprint'
      }
    })
    sim.value.timestamp = ''
    fetchAttendance()
  } catch (error) {
    alert(error.data?.message || useNuxtApp().$i18n.t('attendance.sync_failed'))
  }
}

onMounted(() => {
  fetchAttendance()
})
</script>
