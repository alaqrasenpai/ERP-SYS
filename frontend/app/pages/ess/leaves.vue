<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <div class="max-w-6xl mx-auto space-y-6">
      
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ $t('my_leaves.title') }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ $t('my_leaves.description') }}</p>
        </div>
        <button @click="showModal = true" class="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-white rounded-xl font-bold shadow-lg shadow-primary-200 transition-all">
          {{ $t('my_leaves.new_request') }}
        </button>
      </div>

      <div v-if="loading" class="flex justify-center p-12">
        <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>

      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('my_leaves.type') }}</th>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('my_leaves.duration') }}</th>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('my_leaves.deduction') }}</th>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('my_leaves.reason') }}</th>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('my_leaves.status') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="req in requests" :key="req._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{{ req.type === 'Hourly Departure' ? $t('my_leaves.hourly_departure') : (req.type === 'Annual' ? $t('my_leaves.annual_leave') : (req.type === 'Sick' ? $t('my_leaves.sick_leave') : (req.type === 'Unpaid' ? $t('my_leaves.unpaid_leave') : req.type))) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                <span v-if="req.type === 'Hourly Departure'">{{ req.startTime }} - {{ req.endTime }}<br><span class="text-xs text-gray-500">{{ new Date(req.startDate).toLocaleDateString() }}</span></span>
                <span v-else>{{ new Date(req.startDate).toLocaleDateString() }} {{ $t('leaves.to') || 'to' }} <br>{{ new Date(req.endDate).toLocaleDateString() }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                <span v-if="req.type === 'Hourly Departure'">{{ req.totalHours }} {{ $t('my_leaves.hours') }}</span>
                <span v-else>{{ req.totalDays }} {{ $t('my_leaves.days') }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" :title="req.reason">{{ req.reason }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col items-start">
                  <span :class="{ 'bg-secondary-100 text-secondary-800': req.status === 'Approved', 'bg-red-100 text-red-800': req.status === 'Rejected', 'bg-yellow-100 text-yellow-800': req.status === 'Pending' }" class="px-2 py-1 text-[10px] font-bold uppercase rounded-md">
                    {{ req.status === 'Approved' ? $t('my_leaves.approved') : (req.status === 'Rejected' ? $t('my_leaves.rejected') : (req.status === 'Pending' ? $t('my_leaves.pending') : req.status)) }}
                  </span>
                  <p v-if="req.status === 'Rejected' && req.managerNotes" class="text-xs text-red-600 font-bold mt-1 max-w-[150px] truncate" :title="req.managerNotes">{{ $t('my_leaves.note') }} {{ req.managerNotes }}</p>
                </div>
              </td>
            </tr>
            <tr v-if="requests.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500 font-bold">{{ $t('my_leaves.no_requests') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- New Request Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md my-8">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 class="text-lg font-bold text-gray-900">{{ $t('my_leaves.submit_request') }}</h3>
            <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <form @submit.prevent="submitRequest" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('my_leaves.request_type') }}</label>
              <select v-model="form.type" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                <option value="Annual">{{ $t('my_leaves.annual_leave') }}</option>
                <option value="Sick">{{ $t('my_leaves.sick_leave') }}</option>
                <option value="Unpaid">{{ $t('my_leaves.unpaid_leave') }}</option>
                <option value="Hourly Departure">{{ $t('my_leaves.hourly_departure') }}</option>
              </select>
            </div>

            <template v-if="form.type !== 'Hourly Departure'">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('my_leaves.start_date') }}</label>
                <input type="date" v-model="form.startDate" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('my_leaves.end_date') }}</label>
                <input type="date" v-model="form.endDate" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
              </div>
              <p class="text-xs text-gray-500 font-medium">{{ $t('my_leaves.business_days_hint') }}</p>
            </template>
            <template v-else>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('my_leaves.date') }}</label>
                <input type="date" v-model="form.startDate" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('my_leaves.start_time') }}</label>
                  <input type="time" v-model="form.startTime" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('my_leaves.end_time') }}</label>
                  <input type="time" v-model="form.endTime" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                </div>
              </div>
            </template>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('my_leaves.reason') }}</label>
              <textarea v-model="form.reason" required rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"></textarea>
            </div>

            <div v-if="errorMsg" class="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold">
              {{ errorMsg }}
            </div>

            <div class="pt-4 flex justify-end gap-3">
              <button type="button" @click="showModal = false" class="px-4 py-2 border border-gray-300 rounded-xl font-medium">{{ $t('my_leaves.cancel') }}</button>
              <button type="submit" :disabled="saving" class="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50">
                {{ saving ? $t('my_leaves.submitting') : $t('my_leaves.submit_request') }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
useHead({ title: 'My Leaves' })

import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'ess',
  middleware: ['auth']
})

const { $api } = useNuxtApp()

const requests = ref([])
const loading = ref(true)
const showModal = ref(false)
const saving = ref(false)
const errorMsg = ref('')

const form = ref({
  type: 'Annual',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  reason: ''
})

const fetchLeaves = async () => {
  loading.value = true
  try {
    requests.value = await $api('/ess/my-leaves')
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const submitRequest = async () => {
  errorMsg.value = ''
  saving.value = true
  try {
    const payload = { ...form.value }
    if (payload.type === 'Hourly Departure') {
      payload.endDate = payload.startDate // sync dates
    }
    
    await $api('/ess/my-leaves/request', {
      method: 'POST',
      body: payload
    })
    
    showModal.value = false
    form.value = { type: 'Annual', startDate: '', endDate: '', startTime: '', endTime: '', reason: '' }
    await fetchLeaves()
  } catch (err) {
    errorMsg.value = err.response?.data?.message || useNuxtApp().$i18n.t('my_leaves.failed_submit')
  } finally {
    saving.value = false
  }
}

onMounted(fetchLeaves)
</script>
