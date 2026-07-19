<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ $t('attendance_monitor.title') }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ $t('attendance_monitor.description') }}</p>
        </div>
        <div class="flex flex-wrap gap-3 mt-4 sm:mt-0 justify-end items-center">
          <input type="text" v-model="searchName" @input="fetchGrid" :placeholder="$t('attendance_monitor.search_employee')" class="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-sm w-40 sm:w-48">
          
          <div class="flex items-center gap-2 bg-white px-3 py-1.5 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500">
            <span class="text-xs font-bold text-gray-500">{{ $t('attendance_monitor.start_date') }}:</span>
            <input type="date" v-model="filterStartDate" @change="fetchGrid" class="border-none focus:ring-0 p-0 font-bold text-sm text-gray-700 bg-transparent outline-none">
          </div>

          <div class="flex items-center gap-2 bg-white px-3 py-1.5 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500">
            <span class="text-xs font-bold text-gray-500">{{ $t('attendance_monitor.end_date') }}:</span>
            <input type="date" v-model="filterEndDate" @change="fetchGrid" class="border-none focus:ring-0 p-0 font-bold text-sm text-gray-700 bg-transparent outline-none">
          </div>
          <button @click="openAddModal" class="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 transition font-bold flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span class="hidden sm:inline">{{ $t('attendance_monitor.add_attendance') }}</span>
          </button>
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
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('attendance_monitor.date') }}</th>
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
              <tr v-for="row in grid" :key="row.employee._id + row.date" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {{ row.date }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {{ row.employee.name }}
                  <div class="text-xs text-gray-500 font-medium">{{ row.employee.code || $t('attendance_monitor.n_a') }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                  {{ row.shift }} <br>
                  <span class="text-xs text-gray-500">{{ row.department }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col gap-1">
                    <span :class="{ 
                      'bg-emerald-100 text-emerald-800': row.status === 'Present', 
                      'bg-red-100 text-red-800': row.status === 'Absent' || row.status === 'Absent Without Permission', 
                      'bg-yellow-100 text-yellow-800': row.status === 'Late' || row.isAnomalous,
                      'bg-blue-100 text-blue-800': row.status.startsWith('On Leave') 
                    }" class="w-fit px-2 py-1 text-[10px] font-bold uppercase rounded-md">
                      {{ row.status === 'Present' ? $t('attendance_monitor.present') : (row.status === 'Absent' ? $t('attendance_monitor.absent') : (row.status === 'Absent Without Permission' ? $t('attendance_monitor.absent_no_perm') : row.status)) }}
                    </span>
                    <span v-if="row.lateMinutes > 0" class="w-fit px-2 py-0.5 text-[9px] font-bold text-orange-600 bg-orange-50 rounded border border-orange-200">
                      {{ $t('attendance_monitor.late') }}: {{ row.lateMinutes }}m
                    </span>
                    <span v-if="row.earlyExitMinutes > 0" class="w-fit px-2 py-0.5 text-[9px] font-bold text-red-600 bg-red-50 rounded border border-red-200">
                      {{ $t('attendance_monitor.early_exit') }}: {{ row.earlyExitMinutes }}m
                    </span>
                  </div>
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
                  {{ row.employee.name }}
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
      <!-- Add Attendance Modal -->
      <div v-if="showAddModal" class="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 class="text-lg font-bold text-gray-900">{{ $t('attendance_monitor.add_attendance') }}</h3>
            <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <form @submit.prevent="submitAddAttendance" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('attendance_monitor.select_employee') }}</label>
              <select v-model="addForm.employeeId" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold">
                <option value="" disabled>{{ $t('attendance_monitor.select_employee') }}</option>
                <option v-for="emp in employeesList" :key="emp._id" :value="emp._id">{{ emp.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('attendance_monitor.clock_in_time') }}</label>
              <input type="datetime-local" v-model="addForm.clockIn" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('attendance_monitor.clock_out_time') }}</label>
              <input type="datetime-local" v-model="addForm.clockOut" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('attendance_monitor.reason_required') }}</label>
              <textarea v-model="addForm.reason" required rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500" :placeholder="$t('attendance_monitor.reason_placeholder')"></textarea>
            </div>
            <div class="pt-4 flex justify-end gap-3">
              <button type="button" @click="showAddModal = false" class="px-4 py-2 border border-gray-300 rounded-xl font-medium">{{ $t('attendance_monitor.cancel') }}</button>
              <button type="submit" :disabled="saving" class="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50">
                {{ saving ? $t('attendance_monitor.saving') : $t('attendance_monitor.add_attendance') }}
              </button>
            </div>
          </form>
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

const filterStartDate = ref(new Date().toISOString().split('T')[0])
const filterEndDate = ref(new Date().toISOString().split('T')[0])
const searchName = ref('')
const grid = ref([])
const loading = ref(true)
const activeTab = ref('grid')

const overtimeRequests = computed(() => {
  return grid.value.filter(r => r.overtimeStatus === 'Pending Approval')
})

const showOverrideModal = ref(false)
const showAddModal = ref(false)
const saving = ref(false)
const employeesList = ref([])

const overrideForm = ref({
  attendanceId: null,
  employeeId: null,
  date: '',
  newClockIn: '',
  newClockOut: '',
  reason: ''
})

const addForm = ref({
  employeeId: '',
  clockIn: '',
  clockOut: '',
  reason: 'تمت إضافته يدوياً من قبل الإدارة'
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
    grid.value = await $api(`/hr/attendance/daily-grid?startDate=${filterStartDate.value}&endDate=${filterEndDate.value}&searchName=${encodeURIComponent(searchName.value)}`)
  } catch (err) {
    alert(useNuxtApp().$i18n.t('attendance_monitor.failed_load_grid') + err.message)
  } finally {
    loading.value = false
  }
}

const fetchEmployees = async () => {
  try {
    employeesList.value = await $api('/hr/employees')
  } catch (err) {
    console.error(err)
  }
}

const openAddModal = () => {
  addForm.value = {
    employeeId: '',
    clockIn: '',
    clockOut: '',
    reason: 'تمت إضافته يدوياً من قبل الإدارة'
  }
  showAddModal.value = true
}

const submitAddAttendance = async () => {
  if (!addForm.value.reason || !addForm.value.employeeId) return alert(useNuxtApp().$i18n.t('attendance_monitor.reason_is_required'))
  saving.value = true
  try {
    await $api('/hr/attendance/manual', {
      method: 'POST',
      body: {
        employeeId: addForm.value.employeeId,
        date: addForm.value.clockIn ? addForm.value.clockIn.split('T')[0] : filterStartDate.value,
        clockIn: addForm.value.clockIn ? new Date(addForm.value.clockIn).toISOString() : null,
        clockOut: addForm.value.clockOut ? new Date(addForm.value.clockOut).toISOString() : null,
        reason: addForm.value.reason
      }
    })
    showAddModal.value = false
    await fetchGrid()
  } catch (err) {
    alert(err.response?.data?.message || useNuxtApp().$i18n.t('attendance_monitor.override_failed'))
  } finally {
    saving.value = false
  }
}

const openOverride = (row) => {
  overrideForm.value = {
    attendanceId: row.attendanceId || null,
    employeeId: row.employee._id,
    date: row.date,
    newClockIn: row.clockIn ? formatDateTimeLocal(row.clockIn) : '',
    newClockOut: row.clockOut ? formatDateTimeLocal(row.clockOut) : '',
    reason: ''
  }
  showOverrideModal.value = true
}

const submitOverride = async () => {
  if (!overrideForm.value.reason) return alert(useNuxtApp().$i18n.t('attendance_monitor.reason_is_required'))
  saving.value = true
  try {
    if (overrideForm.value.attendanceId) {
      await $api(`/hr/attendance/override/${overrideForm.value.attendanceId}`, {
        method: 'PUT',
        body: {
          newClockIn: overrideForm.value.newClockIn ? new Date(overrideForm.value.newClockIn).toISOString() : null,
          newClockOut: overrideForm.value.newClockOut ? new Date(overrideForm.value.newClockOut).toISOString() : null,
          reason: overrideForm.value.reason
        }
      })
    } else {
      await $api('/hr/attendance/manual', {
        method: 'POST',
        body: {
          employeeId: overrideForm.value.employeeId,
          date: overrideForm.value.date,
          clockIn: overrideForm.value.newClockIn ? new Date(overrideForm.value.newClockIn).toISOString() : null,
          clockOut: overrideForm.value.newClockOut ? new Date(overrideForm.value.newClockOut).toISOString() : null,
          reason: overrideForm.value.reason
        }
      })
    }
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

onMounted(() => {
  fetchGrid()
  fetchEmployees()
})
</script>
