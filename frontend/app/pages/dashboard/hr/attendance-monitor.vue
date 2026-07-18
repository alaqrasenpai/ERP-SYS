<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ $t('attendance_monitor.title') }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ $t('attendance_monitor.description') }}</p>
        </div>
        <div class="flex gap-3">
          <input type="date" v-model="filterDate" @change="fetchGrid" class="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-sm">
        </div>
      </div>

      <div v-if="loading" class="flex justify-center p-12">
        <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>

      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <!-- Tabs -->
        <div class="border-b border-gray-100 flex overflow-x-auto">
          <button @click="activeTab = 'grid'" :class="['px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap', activeTab === 'grid' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700']">{{ $t('attendance_monitor.daily_grid') }}</button>
          <button @click="activeTab = 'overtime'" :class="['px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap', activeTab === 'overtime' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700']">{{ $t('attendance_monitor.overtime_approval') }}</button>
        </div>

        <!-- Grid Tab -->
        <div v-if="activeTab === 'grid'" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('attendance_monitor.employee') }}</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('attendance_monitor.shift_dept') }}</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('attendance_monitor.status') }}</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('attendance_monitor.clock_in') }}</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('attendance_monitor.clock_out') }}</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('attendance_monitor.total_hrs') }}</th>
                <th scope="col" class="px-6 py-4 text-end text-xs font-black text-gray-500 uppercase">{{ $t('attendance_monitor.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="row in grid" :key="row.employee._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {{ row.employee.firstName }} {{ row.employee.lastName }}
                  <div class="text-xs text-gray-500 font-medium">{{ row.employee.code || $t('attendance_monitor.n_a') }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                  {{ row.shift }} <br>
                  <span class="text-xs text-gray-500">{{ row.department }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="{ 'bg-emerald-100 text-emerald-800': row.status === 'Present', 'bg-red-100 text-red-800': row.status === 'Absent', 'bg-yellow-100 text-yellow-800': row.status === 'Late' || row.isAnomalous }" class="px-2 py-1 text-[10px] font-bold uppercase rounded-md">
                    {{ row.isAnomalous ? $t('attendance_monitor.anomaly') : (row.status === 'Present' ? $t('attendance_monitor.present') : (row.status === 'Late' ? $t('attendance_monitor.late') : (row.status === 'Absent' ? $t('attendance_monitor.absent') : row.status))) }}
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
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">
                  {{ row.totalHours }}{{ $t('attendance_monitor.hrs_abbrev') }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-end text-sm">
                  <button @click="openOverride(row)" class="text-indigo-600 hover:text-indigo-900 font-bold bg-indigo-50 px-3 py-1 rounded-lg">{{ $t('attendance_monitor.override') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Overtime Tab -->
        <div v-if="activeTab === 'overtime'" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('attendance_monitor.employee') }}</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('attendance_monitor.overtime_hrs') }}</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('attendance_monitor.status') }}</th>
                <th scope="col" class="px-6 py-4 text-end text-xs font-black text-gray-500 uppercase">{{ $t('attendance_monitor.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="row in overtimeRequests" :key="row.attendanceId" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {{ row.employee.firstName }} {{ row.employee.lastName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-600">
                  {{ row.overtimeHours }}{{ $t('attendance_monitor.hrs_abbrev') }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-yellow-100 text-yellow-800">
                    {{ row.overtimeStatus }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-end">
              <div class="flex items-center justify-end gap-2">
                  <button @click="handleOvertime(row.attendanceId, 'Approved')" class="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg font-bold hover:bg-emerald-100">{{ $t('attendance_monitor.approve') }}</button>
                  <button @click="handleOvertime(row.attendanceId, 'Rejected')" class="text-red-600 bg-red-50 px-3 py-1 rounded-lg font-bold hover:bg-red-100">{{ $t('attendance_monitor.reject') }}</button>
                </div>
            </td>
              </tr>
              <tr v-if="overtimeRequests.length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-gray-500 text-sm font-bold">{{ $t('attendance_monitor.no_overtime_requests') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Override Modal -->
      <div v-if="showOverrideModal" class="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 class="text-lg font-bold text-gray-900">{{ $t('attendance_monitor.manual_override') }}</h3>
            <button @click="showOverrideModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <form @submit.prevent="submitOverride" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('attendance_monitor.clock_in_time') }}</label>
              <input type="datetime-local" v-model="overrideForm.newClockIn" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('attendance_monitor.clock_out_time') }}</label>
              <input type="datetime-local" v-model="overrideForm.newClockOut" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('attendance_monitor.reason_required') }}</label>
              <textarea v-model="overrideForm.reason" required rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500" :placeholder="$t('attendance_monitor.reason_placeholder')"></textarea>
            </div>
            <div class="pt-4 flex justify-end gap-3">
              <button type="button" @click="showOverrideModal = false" class="px-4 py-2 border border-gray-300 rounded-xl font-medium">{{ $t('attendance_monitor.cancel') }}</button>
              <button type="submit" :disabled="saving" class="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50">
                {{ saving ? $t('attendance_monitor.saving') : $t('attendance_monitor.save_override') }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Attendance Monitor' })

import { ref, onMounted, computed } from 'vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { $api } = useNuxtApp()

const filterDate = ref(new Date().toISOString().split('T')[0])
const grid = ref([])
const loading = ref(true)
const activeTab = ref('grid')

const overtimeRequests = computed(() => {
  return grid.value.filter(r => r.overtimeStatus === 'Pending Approval')
})

const showOverrideModal = ref(false)
const saving = ref(false)
const overrideForm = ref({
  attendanceId: null,
  employeeId: null,
  newClockIn: '',
  newClockOut: '',
  reason: ''
})

const formatTime = (isoString) => {
  if (!isoString) return '--:--'
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatDateTimeLocal = (isoString) => {
  if (!isoString) return ''
  const d = new Date(isoString)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

const fetchGrid = async () => {
  loading.value = true
  try {
    grid.value = await $api(`/hr/attendance/daily-grid?date=${filterDate.value}`)
  } catch (err) {
    alert(useNuxtApp().$i18n.t('attendance_monitor.failed_load_grid') + err.message)
  } finally {
    loading.value = false
  }
}

const openOverride = (row) => {
  if (!row.attendanceId) {
    alert(useNuxtApp().$i18n.t('attendance_monitor.cannot_override'))
    return
  }
  overrideForm.value = {
    attendanceId: row.attendanceId,
    employeeId: row.employee._id,
    newClockIn: formatDateTimeLocal(row.clockIn),
    newClockOut: formatDateTimeLocal(row.clockOut),
    reason: ''
  }
  showOverrideModal.value = true
}

const submitOverride = async () => {
  if (!overrideForm.value.reason) return alert(useNuxtApp().$i18n.t('attendance_monitor.reason_is_required'))
  saving.value = true
  try {
    await $api(`/hr/attendance/override/${overrideForm.value.attendanceId}`, {
      method: 'PUT',
      body: {
        newClockIn: overrideForm.value.newClockIn ? new Date(overrideForm.value.newClockIn).toISOString() : null,
        newClockOut: overrideForm.value.newClockOut ? new Date(overrideForm.value.newClockOut).toISOString() : null,
        reason: overrideForm.value.reason
      }
    })
    showOverrideModal.value = false
    await fetchGrid()
  } catch (err) {
    alert(err.response?.data?.message || useNuxtApp().$i18n.t('attendance_monitor.override_failed'))
  } finally {
    saving.value = false
  }
}

const handleOvertime = async (attendanceId, status) => {
  try {
    await $api(`/hr/attendance/overtime/approve/${attendanceId}`, {
      method: 'PUT',
      body: { status }
    })
    await fetchGrid()
  } catch (err) {
    alert(useNuxtApp().$i18n.t('attendance_monitor.failed_update_overtime'))
  }
}

onMounted(fetchGrid)
</script>
