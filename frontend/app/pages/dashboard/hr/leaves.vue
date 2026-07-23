<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">{{ $t('leaves.title') }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ $t('leaves.description') }}</p>
        </div>
        <div class="flex flex-row flex-nowrap gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 shrink-0">
          <button @click="showBalancesModal = true" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 rounded-xl font-bold flex items-center">
            تعديل الأرصدة
          </button>
          <button @click="openRequestModal" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center">
            <svg class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            {{ $t('leaves.submit_request') }}
          </button>
        </div>
      </div>

      <!-- Filters & Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex justify-between items-center">
          <div>
            <p class="text-sm font-medium text-gray-500">{{ $t('leaves.pending_requests') }}</p>
            <p class="text-2xl font-bold text-yellow-600">{{ pendingCount }}</p>
          </div>
          <div class="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
      </div>

      <!-- Leaves Table -->
      <div class="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('leaves.employee') }}</th>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('leaves.type_duration') }}</th>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('leaves.dates') }}</th>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('leaves.reason') }}</th>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('leaves.status') }}</th>
                <th class="px-6 py-4 text-end text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('leaves.actions') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="leave in paginatedLeaves" :key="leave._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900">{{ leave.employeeId?.name || $t('leaves.unknown') }}</div>
                  <div class="text-xs text-gray-500">{{ leave.employeeId?.position }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-indigo-700 font-bold">
                    {{ leave.type === 'Hourly Departure' ? $t('leaves.translated_hourly_departure') : (leave.type === 'Annual' ? $t('leaves.annual_leave') : (leave.type === 'Sick' ? $t('leaves.sick_leave') : (leave.type === 'Unpaid' ? $t('leaves.unpaid_leave') : leave.type))) }}
                  </div>
                  <div class="text-xs text-gray-500" v-if="leave.type === 'Hourly Departure'">{{ leave.totalHours }} {{ $t('leaves.hours') }}</div>
                  <div class="text-xs text-gray-500" v-else>{{ leave.totalDays }} {{ $t('leaves.days') }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div v-if="leave.type === 'Hourly Departure'">
                    {{ formatDate(leave.startDate) }}<br>
                    <span class="text-xs text-gray-400">{{ leave.startTime }} - {{ leave.endTime }}</span>
                  </div>
                  <div v-else>
                    {{ formatDate(leave.startDate) }} {{ $t('leaves.to') }}<br>{{ formatDate(leave.endDate) }}
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" :title="leave.reason">
                  {{ leave.reason }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-if="leave.status === 'Pending'" class="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-lg border border-yellow-200">{{ $t('leaves.pending') }}</span>
                  <span v-else-if="leave.status === 'Approved'" class="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-lg border border-green-200">{{ $t('leaves.approved') }}</span>
                  <span v-else class="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-lg border border-red-200">{{ $t('leaves.rejected') }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
              <div class="flex items-center justify-end gap-2">
                  <button v-if="leave.status === 'Pending'" @click="openApproveModal(leave)" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg font-bold transition-colors">{{ $t('leaves.review') }}</button>
                  <span v-else class="text-xs text-gray-400">{{ leave.approvedBy?.name ? $t('leaves.resolved_by', {name: leave.approvedBy.name}) : $t('leaves.resolved_by_system') }}</span>
                </div>
            </td>
              </tr>
              <tr v-if="leaves.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-sm text-gray-500">{{ $t('leaves.no_leave_requests_found') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <Pagination 
          v-if="leaves.length > 0"
          :totalItems="leaves.length" 
          :itemsPerPage="itemsPerPage"
          v-model:currentPage="currentPage" 
        />
      </div>
      <!-- Submit Request Modal -->
      <div v-if="showRequestModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl text-start overflow-hidden shadow-2xl w-full max-w-md border border-gray-100 flex flex-col max-h-[90vh]">
          <form @submit.prevent="submitRequest" class="flex flex-col flex-1 overflow-hidden">
            <div class="bg-white px-6 pt-6 pb-6 overflow-y-auto flex-1">
              <h3 class="text-xl font-bold text-gray-900 mb-6">{{ $t('leaves.submit_request') }}</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('leaves.employee_req') }}</label>
                  <select v-model="form.employeeId" required class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option v-for="emp in employees" :key="emp._id" :value="emp._id">{{ emp.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('leaves.leave_type') }}</label>
                  <select v-model="form.type" required class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="Annual">{{ $t('leaves.annual_leave') }}</option>
                    <option value="Sick">{{ $t('leaves.sick_leave') }}</option>
                    <option value="Unpaid">{{ $t('leaves.unpaid_leave') }}</option>
                    <option value="Hourly Departure">{{ $t('leaves.hourly_departure') }}</option>
                    <option v-for="lt in leaveTypes" :key="lt._id" :value="lt._id">{{ lt.name }}</option>
                  </select>
                </div>

                <div v-if="form.type === 'Hourly Departure'" class="space-y-4">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('leaves.date_req') }}</label>
                    <input v-model="form.startDate" type="date" required class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('leaves.start_time') }}</label>
                      <input v-model="form.startTime" type="time" required class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('leaves.end_time') }}</label>
                      <input v-model="form.endTime" type="time" required class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                  </div>
                </div>
                
                <div v-else class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('leaves.start_date') }}</label>
                    <input v-model="form.startDate" type="date" required class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('leaves.end_date') }}</label>
                    <input v-model="form.endDate" type="date" required class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('leaves.reason_notes') }}</label>
                  <textarea v-model="form.reason" required rows="3" class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-6 py-4 flex flex-row-reverse border-t border-gray-100 flex-shrink-0 gap-3">
              <button type="submit" class="inline-flex justify-center rounded-lg px-4 py-2 shrink-0 whitespace-nowrap bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 ms-3">{{ $t('leaves.submit_btn') }}</button>
              <button type="button" @click="showRequestModal = false" class="inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2 shrink-0 whitespace-nowrap bg-white text-sm font-bold text-gray-700 hover:bg-gray-50">{{ $t('leaves.cancel') }}</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Review/Approve Modal -->
      <div v-if="showReviewModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl text-start overflow-hidden shadow-2xl w-full max-w-md border border-gray-100 flex flex-col max-h-[90vh]">
          <div class="bg-white px-6 pt-6 pb-6 overflow-y-auto flex-1">
            <h3 class="text-xl font-bold text-gray-900 mb-6">{{ $t('leaves.review_leave_request') }}</h3>
            
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4 text-sm">
              <p><strong>{{ $t('leaves.employee') }}:</strong> {{ selectedLeave.employeeId?.name }}</p>
              <p><strong>{{ $t('leaves.type') }}</strong> 
                {{ selectedLeave.type === 'Hourly Departure' ? $t('leaves.translated_hourly_departure') : (selectedLeave.type === 'Annual' ? $t('leaves.annual_leave') : (selectedLeave.type === 'Sick' ? $t('leaves.sick_leave') : (selectedLeave.type === 'Unpaid' ? $t('leaves.unpaid_leave') : selectedLeave.type))) }}
              </p>
              <p v-if="selectedLeave.type !== 'Hourly Departure'"><strong>{{ $t('leaves.duration') }}</strong> {{ selectedLeave.totalDays }} {{ $t('leaves.days_calculated') }}</p>
              <p v-else><strong>{{ $t('leaves.duration') }}</strong> {{ selectedLeave.totalHours }} {{ $t('leaves.hours') }}</p>
              <p><strong>{{ $t('leaves.reason') }}:</strong> {{ selectedLeave.reason }}</p>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('leaves.manager_notes') }}</label>
              <textarea v-model="reviewForm.managerNotes" rows="3" class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" :placeholder="$t('leaves.manager_notes_placeholder')"></textarea>
            </div>
          </div>
          <div class="bg-gray-50 px-6 py-4 flex flex-row-reverse border-t border-gray-100 flex-shrink-0 gap-3">
            <button @click="processLeave('Approved')" class="inline-flex justify-center rounded-lg px-4 py-2 shrink-0 whitespace-nowrap bg-green-600 text-sm font-bold text-white hover:bg-green-700 ms-3">{{ $t('leaves.approve') }}</button>
            <button @click="processLeave('Rejected')" class="inline-flex justify-center rounded-lg px-4 py-2 shrink-0 whitespace-nowrap bg-red-600 text-sm font-bold text-white hover:bg-red-700 ms-3">{{ $t('leaves.reject') }}</button>
            <button @click="showReviewModal = false" class="inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2 shrink-0 whitespace-nowrap bg-white text-sm font-bold text-gray-700 hover:bg-gray-50">{{ $t('leaves.cancel') }}</button>
          </div>
        </div>
      </div>

      <!-- Leave Balances Modal -->
      <HrLeaveBalancesModal v-if="showBalancesModal" @close="showBalancesModal = false" @saved="handleBalancesSaved" :employees="employees" :leaveTypes="leaveTypes" />
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Leaves' })

import { ref, computed, onMounted } from 'vue'
import Pagination from '~/components/Pagination.vue'

definePageMeta({ 
  layout: 'dashboard',
  middleware: ['auth', 'module-guard'],
  requiredModule: 'hr'
})

const { $api } = useNuxtApp()
const leaves = ref([])
const employees = ref([])

const currentPage = ref(1)
const itemsPerPage = 15

const paginatedLeaves = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return leaves.value.slice(start, start + itemsPerPage)
})

const showRequestModal = ref(false)
const showReviewModal = ref(false)
const showBalancesModal = ref(false)
const selectedLeave = ref(null)

const form = ref({
  employeeId: '',
  type: 'Annual',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  reason: ''
})

const reviewForm = ref({
  managerNotes: ''
})

const pendingCount = computed(() => leaves.value.filter(l => l.status === 'Pending').length)

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toISOString().split('T')[0]
}

const leaveTypes = ref([])

const fetchData = async () => {
  try {
    leaves.value = await $api('/hr/leaves')
    employees.value = await $api('/hr/employees')
    leaveTypes.value = await $api('/settings/leave-types')
  } catch (error) {
    console.error('Failed to fetch data', error)
  }
}

const handleBalancesSaved = () => {
  showBalancesModal.value = false
  fetchData()
}

const openRequestModal = () => {
  form.value = {
    employeeId: employees.value[0]?._id || '',
    type: 'Annual',
    startDate: formatDate(new Date()),
    endDate: formatDate(new Date()),
    startTime: '08:00',
    endTime: '10:00',
    reason: ''
  }
  showRequestModal.value = true
}

const submitRequest = async () => {
  try {
    const payload = { ...form.value }
    if (payload.type === 'Hourly Departure') {
      payload.endDate = payload.startDate // same day
    }
    await $api('/hr/leaves/request', { method: 'POST', body: payload })
    showRequestModal.value = false
    fetchData()
  } catch (error) {
    alert(error.data?.message || useNuxtApp().$i18n.t('leaves.error_submitting'))
  }
}

const openApproveModal = (leave) => {
  selectedLeave.value = leave
  reviewForm.value.managerNotes = ''
  showReviewModal.value = true
}

const processLeave = async (status) => {
  try {
    await $api(`/hr/leaves/${selectedLeave.value._id}/approve`, {
      method: 'PUT',
      body: { status, managerNotes: reviewForm.value.managerNotes }
    })
    showReviewModal.value = false
    fetchData()
  } catch (error) {
    alert(error.data?.message || useNuxtApp().$i18n.t('leaves.error_processing'))
  }
}

onMounted(() => {
  fetchData()
})
</script>
