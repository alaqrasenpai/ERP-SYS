<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">{{ $t('shifts.title') }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ $t('shifts.description') }}</p>
        </div>
        <div class="flex flex-row flex-nowrap gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 shrink-0">
          <button v-if="activeTab === 'shifts'" @click="openShiftModal()" class="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-white rounded-xl font-bold shadow-lg shadow-primary-200 transition-all flex items-center">
            <svg class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            {{ $t('shifts.add_shift') }}
          </button>
          <button v-if="activeTab === 'holidays'" @click="openHolidayModal()" class="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-white rounded-xl font-bold shadow-lg shadow-primary-200 transition-all flex items-center">
            <svg class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            {{ $t('shifts.add_holiday') }}
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6 border-b border-gray-100">
        <nav class="-mb-px flex gap-8">
          <button @click="activeTab = 'shifts'" :class="[activeTab === 'shifts' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-sm transition-colors']">
            {{ $t('shifts.working_shifts') }}
          </button>
          <button @click="activeTab = 'holidays'" :class="[activeTab === 'holidays' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-sm transition-colors']">
            {{ $t('shifts.public_holidays') }}
          </button>
        </nav>
      </div>

      <!-- Shifts Tab -->
      <div v-if="activeTab === 'shifts'">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div v-for="shift in shifts" :key="shift._id" class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 relative">
            <div class="absolute top-6 rtl:left-6 ltr:right-6 rtl:right-auto gap-2 flex">
               <button @click="openShiftModal(shift)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
               <button @click="deleteShift(shift._id)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
            </div>
            
            <h3 class="text-xl font-bold text-gray-900">{{ shift.name }}</h3>
            <div class="mt-4 flex items-center text-sm text-gray-600 font-mono">
               <svg class="w-5 h-5 me-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               {{ shift.startTime }} - {{ shift.endTime }}
            </div>
            <div class="mt-4">
              <span class="text-xs font-bold text-gray-500 uppercase">{{ $t('shifts.weekends') }}</span>
              <div class="flex gap-2 mt-2">
                <span v-for="day in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="day" 
                      :class="shift.weekendDays.includes(day) ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'"
                      class="px-2 py-1 border text-xs font-bold rounded-lg">{{ $t(`shifts.${day.toLowerCase()}`) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="shifts.length === 0" class="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
          <p class="text-gray-500 font-bold">{{ $t('hr.no_shifts_available') }}</p>
        </div>
      </div>

      <!-- Holidays Tab -->
      <div v-if="activeTab === 'holidays'">
        <div class="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('shifts.holiday_name') }}</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('shifts.dates') }}</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('shifts.type') }}</th>
                <th scope="col" class="px-6 py-4 text-end text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('shifts.actions') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="holiday in holidays" :key="holiday._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{{ holiday.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(holiday.fromDate) }} - {{ formatDate(holiday.toDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-if="holiday.isRecurringYearly" class="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-lg border border-primary-200">{{ $t('shifts.yearly') }}</span>
                  <span v-else class="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-100">{{ $t('shifts.one_time') }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
              <div class="flex items-center justify-end gap-2">
                  <button @click="openHolidayModal(holiday)" class="text-primary-600 hover:text-primary-900 bg-primary-50 px-3 py-1.5 rounded-lg font-bold">{{ $t('shifts.edit') }}</button>
                  <button @click="deleteHoliday(holiday._id)" class="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1.5 rounded-lg font-bold">{{ $t('shifts.delete') }}</button>
                </div>
            </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Shift Modal -->
      <div v-if="showShiftModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl text-start overflow-hidden shadow-2xl w-full max-w-lg border border-gray-100 flex flex-col max-h-[90vh]">
          <form @submit.prevent="saveShift" class="flex flex-col flex-1 overflow-hidden">
            <div class="bg-white px-6 pt-6 pb-6 overflow-y-auto flex-1">
              <h3 class="text-xl font-bold text-gray-900 mb-6">{{ shiftForm._id ? $t('shifts.edit_shift') : $t('shifts.create_shift') }}</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('shifts.shift_name') }}</label>
                  <input v-model="shiftForm.name" type="text" required class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('shifts.start_time') }}</label>
                    <input v-model="shiftForm.startTime" type="time" required class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('shifts.end_time') }}</label>
                    <input v-model="shiftForm.endTime" type="time" required class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                  </div>
                </div>
                
                <div class="pt-2">
                  <label class="block text-sm font-bold text-gray-700 mb-2">{{ $t('shifts.weekend_days') }}</label>
                  <div class="grid grid-cols-4 gap-2">
                    <label v-for="day in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="day" class="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-100 cursor-pointer">
                      <input type="checkbox" :value="day" v-model="shiftForm.weekendDays" class="rounded text-primary-600 focus:ring-primary-500 h-4 w-4">
                      <span class="text-sm font-bold text-gray-700">{{ $t(`shifts.${day.toLowerCase()}`) }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-6 py-4 flex flex-row-reverse border-t border-gray-100 flex-shrink-0 gap-3">
              <button type="submit" class="inline-flex justify-center rounded-lg px-4 py-2 shrink-0 whitespace-nowrap bg-primary-600 text-sm font-bold text-white hover:bg-primary-700 ms-3">{{ $t('shifts.save') }}</button>
              <button type="button" @click="showShiftModal = false" class="inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2 shrink-0 whitespace-nowrap bg-white text-sm font-bold text-gray-700 hover:bg-gray-50">{{ $t('shifts.cancel') }}</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Add/Edit Holiday Modal -->
      <div v-if="showHolidayModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl text-start overflow-hidden shadow-2xl w-full max-w-md border border-gray-100 flex flex-col max-h-[90vh]">
          <form @submit.prevent="saveHoliday" class="flex flex-col flex-1 overflow-hidden">
            <div class="bg-white px-6 pt-6 pb-6 overflow-y-auto flex-1">
              <h3 class="text-xl font-bold text-gray-900 mb-6">{{ holidayForm._id ? $t('shifts.edit_holiday') : $t('shifts.create_holiday') }}</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('shifts.holiday_name_req') }}</label>
                  <input v-model="holidayForm.name" type="text" required class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('shifts.from_date') }}</label>
                    <input v-model="holidayForm.fromDate" type="date" required class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('shifts.to_date') }}</label>
                    <input v-model="holidayForm.toDate" type="date" required class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                  </div>
                </div>
                <div>
                  <label class="flex items-center gap-2 mt-2">
                    <input type="checkbox" v-model="holidayForm.isRecurringYearly" class="rounded text-primary-600 focus:ring-primary-500 h-4 w-4">
                    <span class="text-sm font-bold text-gray-700">{{ $t('shifts.repeats_yearly') }}</span>
                  </label>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-6 py-4 flex flex-row-reverse border-t border-gray-100 flex-shrink-0 gap-3">
              <button type="submit" class="inline-flex justify-center rounded-lg px-4 py-2 shrink-0 whitespace-nowrap bg-primary-600 text-sm font-bold text-white hover:bg-primary-700 ms-3">{{ $t('shifts.save') }}</button>
              <button type="button" @click="showHolidayModal = false" class="inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2 shrink-0 whitespace-nowrap bg-white text-sm font-bold text-gray-700 hover:bg-gray-50">{{ $t('shifts.cancel') }}</button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Shifts' })

import { ref, onMounted } from 'vue'

definePageMeta({ 
  layout: 'dashboard',
  middleware: ['auth', 'module-guard'],
  requiredModule: 'hr'
})

const { $api } = useNuxtApp()
const activeTab = ref('shifts')

const shifts = ref([])
const holidays = ref([])

const showShiftModal = ref(false)
const showHolidayModal = ref(false)

const shiftForm = ref({ name: '', startTime: '', endTime: '', weekendDays: [] })
const holidayForm = ref({ name: '', fromDate: '', toDate: '', isRecurringYearly: false })

const fetchData = async () => {
  shifts.value = await $api('/hr/shifts')
  holidays.value = await $api('/hr/holidays')
}

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toISOString().split('T')[0]
}

const openShiftModal = (shift = null) => {
  if (shift) {
    shiftForm.value = { ...shift }
  } else {
    shiftForm.value = { name: '', startTime: '09:00', endTime: '17:00', weekendDays: ['Fri', 'Sat'] }
  }
  showShiftModal.value = true
}

const openHolidayModal = (holiday = null) => {
  if (holiday) {
    holidayForm.value = { 
      ...holiday, 
      fromDate: formatDate(holiday.fromDate),
      toDate: formatDate(holiday.toDate)
    }
  } else {
    holidayForm.value = { name: '', fromDate: '', toDate: '', isRecurringYearly: false }
  }
  showHolidayModal.value = true
}

const saveShift = async () => {
  try {
    const payload = { ...shiftForm.value }
    if (payload._id) {
      await $api(`/hr/shifts/${payload._id}`, { method: 'PUT', body: payload })
    } else {
      await $api('/hr/shifts', { method: 'POST', body: payload })
    }
    showShiftModal.value = false
    fetchData()
  } catch (err) { alert(useNuxtApp().$i18n.t('shifts.error_saving_shift')) }
}

const deleteShift = async (id) => {
  if (!confirm(useNuxtApp().$i18n.t('shifts.delete_shift_prompt'))) return
  await $api(`/hr/shifts/${id}`, { method: 'DELETE' })
  fetchData()
}

const saveHoliday = async () => {
  try {
    const payload = { ...holidayForm.value }
    if (payload._id) {
      await $api(`/hr/holidays/${payload._id}`, { method: 'PUT', body: payload })
    } else {
      await $api('/hr/holidays', { method: 'POST', body: payload })
    }
    showHolidayModal.value = false
    fetchData()
  } catch (err) { alert(useNuxtApp().$i18n.t('shifts.error_saving_holiday')) }
}

const deleteHoliday = async (id) => {
  if (!confirm(useNuxtApp().$i18n.t('shifts.delete_holiday_prompt'))) return
  await $api(`/hr/holidays/${id}`, { method: 'DELETE' })
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>
