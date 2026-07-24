<template>
  <div class="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
        <h3 class="font-bold text-gray-900 text-lg">تعديل أرصدة الإجازات للموظفين</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      
      <div class="p-6 flex-1 overflow-y-auto space-y-6">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">اختر الموظف</label>
          <select v-model="selectedEmployeeId" @change="loadEmployeeData" class="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-primary-500 focus:border-primary-500">
            <option value="" disabled>-- الرجاء الاختيار --</option>
            <option v-for="emp in employees" :key="emp._id" :value="emp._id">{{ emp.name }} - {{ emp.position }}</option>
          </select>
        </div>

        <div v-if="selectedEmployeeId && form">
          <h4 class="font-bold text-primary-900 mb-4 border-b pb-2">الأرصدة الأساسية</h4>
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm text-gray-600 mb-1">الرصيد السنوي (أيام)</label>
              <input type="number" v-model.number="form.annualLeaveBalance" class="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-primary-500">
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">رصيد الإجازات المرضية (أيام)</label>
              <input type="number" v-model.number="form.sickLeaveBalance" class="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-primary-500">
            </div>
          </div>

          <div class="flex justify-between items-center border-b pb-2 mb-4">
            <h4 class="font-bold text-primary-900">الأرصدة المخصصة</h4>
            <div class="flex gap-2">
              <select v-model="newCustomType" class="text-sm border border-gray-300 rounded-lg px-2 py-1">
                <option value="" disabled>اختر نوع الإجازة لإضافته</option>
                <option v-for="lt in availableCustomTypes" :key="lt._id" :value="lt._id">{{ lt.name }}</option>
              </select>
              <button @click="addCustomLeave" class="bg-primary-50 text-primary-600 px-3 py-1 rounded-lg text-sm font-bold hover:bg-primary-100" :disabled="!newCustomType">إضافة</button>
            </div>
          </div>

          <div v-if="form.activeLeaveBalances.length === 0" class="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            لا توجد إجازات مخصصة مفعلة لهذا الموظف
          </div>
          <div v-else class="space-y-3">
            <div v-for="(leave, index) in form.activeLeaveBalances" :key="index" class="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div class="flex-1">
                <span class="font-bold text-gray-700 block">{{ leave.name }}</span>
                <span class="text-xs text-gray-500">الرصيد المتبقي:</span>
              </div>
              <div class="w-32">
                <input type="number" v-model.number="leave.balance" class="w-full border border-gray-300 rounded-lg px-3 py-1 text-center">
              </div>
              <button @click="removeCustomLeave(index)" class="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
        <button type="button" @click="$emit('close')" class="px-5 py-2.5 bg-white border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-100">إلغاء</button>
        <button @click="saveBalances" :disabled="!selectedEmployeeId || saving" class="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 flex items-center">
          <span v-if="saving">جاري الحفظ...</span>
          <span v-else>حفظ التعديلات</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  employees: Array,
  leaveTypes: Array
})

const emit = defineEmits(['close', 'saved'])
const { $api } = useNuxtApp()

const selectedEmployeeId = ref('')
const form = ref(null)
const newCustomType = ref('')
const saving = ref(false)

const loadEmployeeData = () => {
  const emp = props.employees.find(e => e._id === selectedEmployeeId.value)
  if (emp) {
    form.value = {
      annualLeaveBalance: emp.annualLeaveBalance || 0,
      sickLeaveBalance: emp.sickLeaveBalance || 0,
      activeLeaveBalances: JSON.parse(JSON.stringify(emp.activeLeaveBalances || []))
    }
  }
}

const availableCustomTypes = computed(() => {
  if (!form.value) return []
  const activeIds = form.value.activeLeaveBalances.map(l => l.leaveTypeId)
  return props.leaveTypes.filter(lt => !activeIds.includes(lt._id))
})

const addCustomLeave = () => {
  const type = props.leaveTypes.find(lt => lt._id === newCustomType.value)
  if (type) {
    form.value.activeLeaveBalances.push({
      leaveTypeId: type._id,
      name: type.name,
      balance: type.defaultBalance || 0
    })
    newCustomType.value = ''
  }
}

const removeCustomLeave = (index) => {
  form.value.activeLeaveBalances.splice(index, 1)
}

const saveBalances = async () => {
  if (!selectedEmployeeId.value) return
  saving.value = true
  try {
    await $api(`/hr/employees/${selectedEmployeeId.value}/leave-balances`, {
      method: 'PUT',
      body: form.value
    })
    emit('saved')
  } catch (error) {
    console.error('Failed to save balances', error)
    alert('حدث خطأ أثناء الحفظ')
  } finally {
    saving.value = false
  }
}
</script>
