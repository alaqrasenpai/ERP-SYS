<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <div class="max-w-6xl mx-auto space-y-6">
      
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">البصمات العالقة (Pending Attendance)</h2>
          <p class="text-sm text-gray-500 mt-1">عرض بصمات الموظفين غير المرتبطة بموظف محدد وربطها يدوياً.</p>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center p-12">
        <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>

      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">الجهاز</th>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">رقم البصمة</th>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">وقت التسجيل</th>
              <th class="px-6 py-4 text-end text-xs font-black text-gray-500 uppercase">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="log in logs" :key="log._id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{{ log.deviceId?.deviceName || 'Unknown' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">#{{ log.deviceEmployeeNumber }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ new Date(log.recordTime).toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-end space-x-2 space-x-reverse">
                <button @click="openLinkModal(log)" class="text-indigo-600 hover:text-indigo-900 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-lg">ربط بموظف</button>
              </td>
            </tr>
            <tr v-if="logs.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-500 font-bold">لا توجد بصمات عالقة.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Link Employee Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-right" dir="rtl">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 class="text-lg font-bold text-gray-900">ربط البصمة بموظف</h3>
            <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <form @submit.prevent="linkEmployee" class="p-6 space-y-4">
            <div>
              <p class="text-sm text-gray-600 mb-4">
                أنت تقوم بربط البصمة رقم <span class="font-bold text-indigo-600">{{ selectedLog?.deviceEmployeeNumber }}</span>. سيتم تعيين هذا الرقم للموظف المختار.
              </p>
              <label class="block text-sm font-bold text-gray-700 mb-1">اختر الموظف</label>
              <select v-model="selectedEmployeeId" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500">
                <option value="" disabled>-- اختر موظف --</option>
                <option v-for="emp in employees" :key="emp._id" :value="emp._id">
                  {{ emp.name }} ({{ emp.position || 'بدون منصب' }})
                </option>
              </select>
            </div>
            
            <div class="pt-4 flex justify-end gap-3" dir="ltr">
              <button type="submit" :disabled="saving" class="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">
                {{ saving ? 'جاري الربط...' : 'تأكيد الربط' }}
              </button>
              <button type="button" @click="showModal = false" class="px-4 py-2 border border-gray-300 rounded-xl font-medium text-gray-700">إلغاء</button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Pending Attendance' })

import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { $api } = useNuxtApp()

const logs = ref([])
const employees = ref([])
const loading = ref(true)
const showModal = ref(false)
const saving = ref(false)
const selectedLog = ref(null)
const selectedEmployeeId = ref('')

const fetchLogs = async () => {
  loading.value = true
  try {
    logs.value = await $api('/hr/devices/logs/pending')
  } catch (err) {
    alert('Failed to load pending logs')
  } finally {
    loading.value = false
  }
}

const fetchEmployees = async () => {
  try {
    employees.value = await $api('/hr/employees')
  } catch (err) {
    console.error('Failed to load employees')
  }
}

const openLinkModal = (log) => {
  selectedLog.value = log
  selectedEmployeeId.value = ''
  showModal.value = true
}

const linkEmployee = async () => {
  if (!selectedEmployeeId.value) return
  saving.value = true
  try {
    const res = await $api(`/hr/devices/logs/${selectedLog.value._id}/link`, {
      method: 'POST',
      body: { employeeId: selectedEmployeeId.value }
    })
    alert(`تم الربط بنجاح! تم معالجة ${res.linkedCount} سجل(سجلات).`)
    showModal.value = false
    fetchLogs() // refresh
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to link employee')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchLogs()
  fetchEmployees()
})
</script>
