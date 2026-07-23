<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <div class="max-w-6xl mx-auto space-y-6">
      
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ $t('ess.manager_approvals') }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ $t('ess.approvals_desc') }}</p>
        </div>
        <div class="flex bg-gray-100 rounded-lg p-1">
          <button @click="showHistory = false; fetchRequests()" :class="!showHistory ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'" class="px-4 py-2 text-sm font-bold rounded-md transition-all">الطلبات المعلقة</button>
          <button @click="showHistory = true; fetchRequests()" :class="showHistory ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'" class="px-4 py-2 text-sm font-bold rounded-md transition-all">سجل الطلبات السابقة</button>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center p-12">
        <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>

      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('attendance_monitor.employee') }}</th>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('my_leaves.type') }}</th>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('my_leaves.duration') }}</th>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('my_leaves.deduction') }}</th>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('my_leaves.reason') }}</th>
              <th v-if="showHistory" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">الحالة</th>
              <th v-if="!showHistory" class="px-6 py-4 text-end text-xs font-black text-gray-500 uppercase">{{ $t('general.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="req in requests" :key="req._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-bold text-gray-900">{{ req.employeeId?.name || 'Unknown' }}</div>
                <div class="text-xs text-gray-500">{{ req.employeeId?.position || '' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                {{ req.type === 'Hourly Departure' ? $t('my_leaves.hourly_departure') : (req.type === 'Annual' ? $t('my_leaves.annual_leave') : (req.type === 'Sick' ? $t('my_leaves.sick_leave') : (req.type === 'Unpaid' ? $t('my_leaves.unpaid_leave') : req.type))) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                <span v-if="req.type === 'Hourly Departure'">{{ req.startTime }} - {{ req.endTime }}<br><span class="text-xs text-gray-500">{{ new Date(req.startDate).toLocaleDateString() }}</span></span>
                <span v-else>{{ new Date(req.startDate).toLocaleDateString() }} <br>{{ new Date(req.endDate).toLocaleDateString() }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                <span v-if="req.type === 'Hourly Departure'">{{ req.totalHours }} {{ $t('my_leaves.hours') }}</span>
                <span v-else>{{ req.totalDays }} {{ $t('my_leaves.days') }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" :title="req.reason">{{ req.reason }}</td>
              <td v-if="showHistory" class="px-6 py-4 whitespace-nowrap">
                <span v-if="req.status === 'Approved'" class="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-lg border border-green-200">{{ $t('my_leaves.approved') }}</span>
                <span v-else-if="req.status === 'Rejected'" class="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-lg border border-red-200">{{ $t('my_leaves.rejected') }}</span>
              </td>
              <td v-if="!showHistory" class="px-6 py-4 whitespace-nowrap text-end">
                <div class="flex justify-end gap-2">
                  <button @click="openActionModal(req, 'Approved')" class="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors" :title="$t('my_leaves.approved')">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  </button>
                  <button @click="openActionModal(req, 'Rejected')" class="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" :title="$t('my_leaves.rejected')">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="requests.length === 0">
              <td :colspan="showHistory ? 7 : 6" class="px-6 py-12 text-center text-gray-500 font-bold">لا يوجد طلبات</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Action Modal -->
      <div v-if="selectedRequest" class="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md my-8">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 class="text-lg font-bold text-gray-900">{{ actionType === 'Approved' ? $t('ess.approve_request') : $t('ess.reject_request') }}</h3>
            <button @click="selectedRequest = null" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <form @submit.prevent="submitAction" class="p-6 space-y-4">
            <div>
              <p class="text-sm text-gray-600 mb-4">{{ $t('ess.confirm_action_desc', { action: actionType === 'Approved' ? $t('my_leaves.approved') : $t('my_leaves.rejected'), employee: selectedRequest.employeeId?.name }) }}</p>
              
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('my_leaves.note') }} ({{ $t('common.optional') }})</label>
              <textarea v-model="managerNotes" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"></textarea>
            </div>

            <div v-if="errorMsg" class="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold">
              {{ errorMsg }}
            </div>

            <div class="pt-4 flex justify-end gap-3">
              <button type="button" @click="selectedRequest = null" class="px-4 py-2 border border-gray-300 rounded-xl font-medium">{{ $t('common.cancel') }}</button>
              <button type="submit" :disabled="saving" :class="actionType === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'" class="px-4 py-2 text-white rounded-xl font-bold disabled:opacity-50 transition-colors">
                {{ saving ? $t('common.saving') : $t('common.confirm') }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Manager Approvals' })

import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'ess',
  middleware: ['auth']
})

const { $api } = useNuxtApp()
const { t } = useI18n()

const requests = ref([])
const loading = ref(true)
const selectedRequest = ref(null)
const actionType = ref('')
const managerNotes = ref('')
const saving = ref(false)
const errorMsg = ref('')
const showHistory = ref(false)

const fetchRequests = async () => {
  loading.value = true
  try {
    requests.value = await $api(`/ess/approvals?history=${showHistory.value}`)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const openActionModal = (req, type) => {
  selectedRequest.value = req
  actionType.value = type
  managerNotes.value = ''
  errorMsg.value = ''
}

const submitAction = async () => {
  errorMsg.value = ''
  saving.value = true
  try {
    await $api(`/ess/approvals/${selectedRequest.value._id}`, {
      method: 'PUT',
      body: {
        status: actionType.value,
        managerNotes: managerNotes.value
      }
    })
    
    selectedRequest.value = null
    await fetchRequests()
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message || t('common.error_occurred')
  } finally {
    saving.value = false
  }
}

onMounted(fetchRequests)
</script>
