<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">{{ $t('employees.title') }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ $t('employees.description') }}</p>
        </div>
        <div class="flex flex-row flex-nowrap gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 shrink-0">
          <button @click="openAddModal" class="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all flex items-center">
            <svg class="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            {{ $t('employees.add_employee') }}
          </button>
        </div>
      </div>

      <!-- Employees Table -->
      <div class="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('employees.employee') }}</th>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('employees.job_department') }}</th>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('employees.shift') }}</th>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('employees.leave_balances') }}</th>
                <th class="px-6 py-4 text-end text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('employees.actions') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="emp in paginatedEmployees" :key="emp._id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold me-3">
                      {{ emp.name.charAt(0) }}
                    </div>
                    <div>
                      <div class="text-sm font-bold text-gray-900">{{ emp.name }}</div>
                      <div class="text-xs text-gray-500">{{ emp.nationalId || $t('employees.no_id') }} • #{{ emp.employeeNumber || 'N/A' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 font-bold">{{ emp.position }}</div>
                  <div class="text-xs text-primary-600">{{ emp.departmentId?.name || $t('employees.unassigned_dept') }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ emp.shiftId?.name || $t('employees.no_shift') }}</div>
                  <div class="text-xs text-gray-500" v-if="emp.shiftId">{{ emp.shiftId.startTime }} - {{ emp.shiftId.endTime }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-xs text-gray-700">{{ $t('employees.annual') }} <span class="font-bold">{{ emp.annualLeaveBalance }}</span> {{ $t('employees.days') }}</div>
                  <div class="text-xs text-gray-700">{{ $t('employees.sick') }} <span class="font-bold">{{ emp.sickLeaveBalance }}</span> {{ $t('employees.days') }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
              <div class="flex items-center justify-end gap-2">
                  <button @click="openEditModal(emp)" class="text-primary-600 hover:text-primary-900 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors">{{ $t('employees.profile') }}</button>
                  <button @click="deleteEmployee(emp._id)" class="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">{{ $t('employees.delete') }}</button>
                </div>
            </td>
              </tr>
              <tr v-if="employees.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-sm text-gray-500">{{ $t('employees.no_employees_found') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <Pagination 
          v-if="employees.length > 0"
          :totalItems="employees.length" 
          :itemsPerPage="itemsPerPage"
          v-model:currentPage="currentPage" 
        />
      </div>

      <!-- Add/Edit Employee Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl text-start overflow-hidden shadow-2xl w-full max-w-3xl border border-gray-100 flex flex-col max-h-[90vh]">
          
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 class="text-xl font-bold text-gray-900">{{ isEditing ? $t('employees.edit_hr_profile') : $t('employees.new_employee_profile') }}</h3>
            <button @click="showModal = false" class="text-gray-400 hover:text-gray-500"><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>

          <!-- Tabs -->
          <div class="border-b border-gray-100 px-6">
            <nav class="-mb-px flex gap-8">
              <button @click="activeModalTab = 'personal'" :class="[activeModalTab === 'personal' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-3 px-1 border-b-2 font-bold text-sm transition-colors']">{{ $t('employees.personal_info') }}</button>
              <button @click="activeModalTab = 'job'" :class="[activeModalTab === 'job' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-3 px-1 border-b-2 font-bold text-sm transition-colors']">{{ $t('employees.job_shift') }}</button>
              <button @click="activeModalTab = 'leaves'" :class="[activeModalTab === 'leaves' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-3 px-1 border-b-2 font-bold text-sm transition-colors']">{{ $t('employees.leave_balances') }}</button>
            </nav>
          </div>

          <form @submit.prevent="saveEmployee" class="flex flex-col flex-1 overflow-hidden">
            <div class="bg-white px-6 py-6 overflow-y-auto flex-1">
              
              <!-- Personal Tab -->
              <div v-if="activeModalTab === 'personal'" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('employees.full_name') }}</label>
                    <input v-model="form.name" type="text" required class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('employees.national_id') }}</label>
                    <input v-model="form.nationalId" type="text" class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('employees.employee_number') }} (رقم البصمة)</label>
                    <input v-model="form.employeeNumber" type="text" class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('employees.email') }}</label>
                    <input v-model="form.email" type="email" required class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('employees.phone') }}</label>
                    <input v-model="form.phone" type="text" class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('employees.gender') }}</label>
                    <select v-model="form.gender" class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                      <option value="Male">{{ $t('employees.male') }}</option>
                      <option value="Female">{{ $t('employees.female') }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('employees.birth_date') }}</label>
                    <input v-model="form.birthDate" type="date" class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('employees.address') }}</label>
                  <textarea v-model="form.address" rows="2" class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"></textarea>
                </div>
                <h4 class="text-sm font-bold text-gray-900 border-b pb-1 mt-4">{{ $t('employees.emergency_contact') }}</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input v-model="form.emergencyContact.name" type="text" :placeholder="$t('employees.name')" class="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm">
                  <input v-model="form.emergencyContact.phone" type="text" :placeholder="$t('employees.phone')" class="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm">
                  <input v-model="form.emergencyContact.relationship" type="text" :placeholder="$t('employees.relationship')" class="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm">
                </div>
              </div>

              <!-- Job Tab -->
              <div v-if="activeModalTab === 'job'" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('employees.job_position') }}</label>
                    <input v-model="form.position" type="text" required class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('employees.department') }}</label>
                    <select v-model="form.departmentId" class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                      <option :value="null">{{ $t('employees.unassigned') }}</option>
                      <option v-for="d in departments" :key="d._id" :value="d._id">{{ d.name }}</option>
                    </select>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('employees.working_shift') }}</label>
                    <select v-model="form.shiftId" class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                      <option :value="null">{{ $t('employees.default_flexible') }}</option>
                      <option v-for="s in shifts" :key="s._id" :value="s._id">{{ s.name }} ({{ s.startTime }}-{{ s.endTime }})</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('employees.join_date') }}</label>
                    <input v-model="form.joinedAt" type="date" class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                  </div>
                </div>
                
                <h4 class="text-sm font-bold text-gray-900 border-b pb-1 mt-6">{{ $t('employees.payroll_details') }}</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('employees.basic_salary') }}</label>
                    <input v-model="form.basicSalary" type="number" step="0.01" required class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('employees.monthly_allowance') }}</label>
                    <input v-model="form.allowance" type="number" step="0.01" class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                  </div>
                </div>

                <h4 class="text-sm font-bold text-gray-900 border-b pb-1 mt-6">التفويض (Delegation)</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">تفويض إلى الموظف</label>
                    <select v-model="form.delegatedTo" class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                      <option :value="null">بدون تفويض</option>
                      <option v-for="emp in employees" :key="emp._id" :value="emp._id">{{ emp.name }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">تاريخ انتهاء التفويض</label>
                    <input v-model="form.delegationEnd" type="date" class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                  </div>
                </div>
              </div>

              <!-- Leaves Tab -->
              <div v-if="activeModalTab === 'leaves'" class="space-y-4">
                <div class="bg-primary-50 rounded-lg p-4 border border-primary-100 mb-4">
                  <p class="text-sm text-primary-800">
                    {{ $t('employees.leave_balances_notice') }}
                  </p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('employees.annual_leave_balance') }}</label>
                    <input v-model="form.annualLeaveBalance" type="number" class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-bold text-primary-700 text-lg">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('employees.sick_leave_balance') }}</label>
                    <input v-model="form.sickLeaveBalance" type="number" class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-bold text-red-700 text-lg">
                  </div>
                </div>
              </div>

            </div>
            <div class="bg-gray-50 px-6 py-4 flex flex-row-reverse border-t border-gray-100 flex-shrink-0 gap-3">
              <button type="submit" class="inline-flex justify-center rounded-lg px-6 py-2.5 bg-primary-600 text-sm font-bold text-white hover:bg-primary-700 shadow-sm ms-3">
                {{ isEditing ? $t('employees.save_profile') : $t('employees.add_employee') }}
              </button>
              <button type="button" @click="showModal = false" class="inline-flex justify-center rounded-lg border border-gray-300 px-6 py-2.5 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm">
                {{ $t('employees.cancel') }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Employees' })

import { ref, computed, onMounted } from 'vue'
import Pagination from '~/components/Pagination.vue'

definePageMeta({ 
  layout: 'dashboard',
  middleware: ['auth', 'module-guard'],
  requiredModule: 'hr'
})

const { $api } = useNuxtApp()
const employees = ref([])
const departments = ref([])
const shifts = ref([])

const currentPage = ref(1)
const itemsPerPage = 15

const paginatedEmployees = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return employees.value.slice(start, start + itemsPerPage)
})

const showModal = ref(false)
const activeModalTab = ref('personal')
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  name: '', email: '', phone: '', nationalId: '', employeeNumber: '', gender: 'Male', birthDate: '', address: '',
  emergencyContact: { name: '', phone: '', relationship: '' },
  position: '', departmentId: null, shiftId: null, joinedAt: '',
  basicSalary: '', allowance: 0, 
  annualLeaveBalance: 21, sickLeaveBalance: 14,
  delegatedTo: null, delegationEnd: ''
})

const formatDate = (d) => d ? new Date(d).toISOString().split('T')[0] : ''

const fetchData = async () => {
  try {
    employees.value = await $api('/hr/employees')
    departments.value = await $api('/hr/departments')
    shifts.value = await $api('/hr/shifts')
  } catch (error) {
    console.error('Failed to fetch HR data', error)
  }
}

const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  activeModalTab.value = 'personal'
  form.value = {
    name: '', email: '', phone: '', nationalId: '', employeeNumber: '', gender: 'Male', birthDate: '', address: '',
    emergencyContact: { name: '', phone: '', relationship: '' },
    position: '', departmentId: null, shiftId: null, joinedAt: formatDate(new Date()),
    basicSalary: '', allowance: 0, 
    annualLeaveBalance: 21, sickLeaveBalance: 14,
    delegatedTo: null, delegationEnd: ''
  }
  showModal.value = true
}

const openEditModal = (emp) => {
  isEditing.value = true
  editingId.value = emp._id
  activeModalTab.value = 'personal'
  form.value = { 
    name: emp.name, email: emp.email, phone: emp.phone || '', nationalId: emp.nationalId || '', employeeNumber: emp.employeeNumber || '',
    gender: emp.gender || 'Male', birthDate: formatDate(emp.birthDate), address: emp.address || '',
    emergencyContact: { 
      name: emp.emergencyContact?.name || '', 
      phone: emp.emergencyContact?.phone || '', 
      relationship: emp.emergencyContact?.relationship || '' 
    },
    position: emp.position, 
    departmentId: emp.departmentId?._id || emp.departmentId || null, 
    shiftId: emp.shiftId?._id || emp.shiftId || null, 
    joinedAt: formatDate(emp.joinedAt),
    basicSalary: emp.basicSalary, allowance: emp.allowance || 0, 
    annualLeaveBalance: emp.annualLeaveBalance ?? 21, 
    sickLeaveBalance: emp.sickLeaveBalance ?? 14,
    delegatedTo: emp.delegatedTo?._id || emp.delegatedTo || null,
    delegationEnd: formatDate(emp.delegationEnd)
  }
  showModal.value = true
}

const saveEmployee = async () => {
  try {
    const payload = { ...form.value }
    if (!payload.departmentId) delete payload.departmentId
    if (!payload.shiftId) delete payload.shiftId
    if (!payload.nationalId) delete payload.nationalId
    if (!payload.employeeNumber) delete payload.employeeNumber
    if (!payload.birthDate) delete payload.birthDate
    if (!payload.joinedAt) delete payload.joinedAt

    if (isEditing.value) {
      await $api(`/hr/employees/${editingId.value}`, { method: 'PUT', body: payload })
    } else {
      await $api('/hr/employees', { method: 'POST', body: payload })
    }
    showModal.value = false
    fetchData()
  } catch (error) {
    alert(error.data?.message || error.data?.error || useNuxtApp().$i18n.t('employees.failed_save'))
  }
}

const deleteEmployee = async (id) => {
  if (!confirm(useNuxtApp().$i18n.t('employees.delete_prompt'))) return
  try {
    await $api(`/hr/employees/${id}`, { method: 'DELETE' })
    fetchData()
  } catch (error) {
    alert(useNuxtApp().$i18n.t('employees.failed_delete'))
  }
}

onMounted(() => {
  fetchData()
})
</script>
