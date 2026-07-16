<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Employee Directory</h1>
          <p class="text-sm text-gray-500 mt-1">Manage staff details, positions, and salary configurations.</p>
        </div>
        <div class="flex space-x-3">
          <NuxtLink to="/" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">Dashboard</NuxtLink>
          <button @click="openAddModal" class="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Add Employee
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
           <div class="flex items-center justify-between">
              <div>
                 <p class="text-sm font-medium text-gray-500">Total Employees</p>
                 <p class="text-2xl font-bold text-gray-900">{{ employees.length }}</p>
              </div>
              <div class="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                 <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
           </div>
        </div>
      </div>

      <!-- Employees Table -->
      <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Salary Details</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Work Hours</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="emp in employees" :key="emp._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900">{{ emp.name }}</div>
                  <div class="text-xs text-indigo-600 font-medium">{{ emp.position }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ emp.email }}</div>
                  <div class="text-xs text-gray-500">{{ emp.phone || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 font-bold">${{ emp.basicSalary.toFixed(2) }} <span class="text-xs font-normal text-gray-500">/mo</span></div>
                  <div class="text-xs text-gray-500">Allowances: ${{ (emp.allowance || 0).toFixed(2) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ emp.dailyWorkHours }} hrs/day<br>
                  OT: ${{ (emp.overtimeRatePerHour || 0).toFixed(2) }}/hr
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click="openEditModal(emp)" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors">Edit</button>
                  <button @click="deleteEmployee(emp._id)" class="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1.5 rounded-md hover:bg-red-100 transition-colors ml-2">Delete</button>
                </td>
              </tr>
              <tr v-if="employees.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-sm text-gray-500">No employees found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Employee Modal -->
      <div v-if="showModal" class="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm" @click="showModal = false"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <form @submit.prevent="saveEmployee">
              <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 class="text-xl font-bold text-gray-900 mb-6">{{ isEditing ? 'Edit Employee' : 'Add Employee' }}</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
                    <input v-model="form.name" type="text" required class="w-full border border-gray-300 rounded-lg py-2 px-3">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Job Position *</label>
                    <input v-model="form.position" type="text" required class="w-full border border-gray-300 rounded-lg py-2 px-3">
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Email *</label>
                    <input v-model="form.email" type="email" required class="w-full border border-gray-300 rounded-lg py-2 px-3">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                    <input v-model="form.phone" type="text" class="w-full border border-gray-300 rounded-lg py-2 px-3">
                  </div>
                </div>

                <h4 class="text-md font-bold text-gray-900 border-b pb-2 mb-4 mt-6">Financial Setup</h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Basic Salary ($) *</label>
                    <input v-model="form.basicSalary" type="number" step="0.01" required class="w-full border border-gray-300 rounded-lg py-2 px-3">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Monthly Allowance ($)</label>
                    <input v-model="form.allowance" type="number" step="0.01" class="w-full border border-gray-300 rounded-lg py-2 px-3">
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Daily Work Hours</label>
                    <input v-model="form.dailyWorkHours" type="number" step="0.5" placeholder="8" class="w-full border border-gray-300 rounded-lg py-2 px-3">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">Overtime Rate / Hour ($)</label>
                    <input v-model="form.overtimeRatePerHour" type="number" step="0.01" class="w-full border border-gray-300 rounded-lg py-2 px-3">
                  </div>
                </div>

              </div>
              <div class="bg-gray-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse border-t">
                <button type="submit" class="w-full inline-flex justify-center rounded-lg border border-transparent px-5 py-2 bg-indigo-600 text-base font-bold text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">
                  {{ isEditing ? 'Save Changes' : 'Add Employee' }}
                </button>
                <button type="button" @click="showModal = false" class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 px-5 py-2 bg-white text-base font-bold text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

definePageMeta({ 
  layout: 'dashboard',
  middleware: ['auth'] 
})

const { $api } = useNuxtApp()
const employees = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  name: '',
  email: '',
  phone: '',
  position: '',
  basicSalary: '',
  allowance: 0,
  dailyWorkHours: 8,
  overtimeRatePerHour: 0
})

const fetchEmployees = async () => {
  try {
    employees.value = await $api('/hr/employees')
  } catch (error) {
    console.error('Failed to fetch employees', error)
  }
}

const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = { name: '', email: '', phone: '', position: '', basicSalary: '', allowance: 0, dailyWorkHours: 8, overtimeRatePerHour: 0 }
  showModal.value = true
}

const openEditModal = (emp) => {
  isEditing.value = true
  editingId.value = emp._id
  form.value = { 
    name: emp.name, 
    email: emp.email, 
    phone: emp.phone || '', 
    position: emp.position, 
    basicSalary: emp.basicSalary, 
    allowance: emp.allowance || 0, 
    dailyWorkHours: emp.dailyWorkHours || 8, 
    overtimeRatePerHour: emp.overtimeRatePerHour || 0 
  }
  showModal.value = true
}

const saveEmployee = async () => {
  try {
    if (isEditing.value) {
      await $api(`/hr/employees/${editingId.value}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      await $api('/hr/employees', {
        method: 'POST',
        body: form.value
      })
    }
    showModal.value = false
    fetchEmployees()
  } catch (error) {
    alert(error.data?.message || 'Failed to save employee')
  }
}

const deleteEmployee = async (id) => {
  if (!confirm('Delete this employee?')) return
  try {
    await $api(`/hr/employees/${id}`, { method: 'DELETE' })
    fetchEmployees()
  } catch (error) {
    alert('Failed to delete employee')
  }
}

onMounted(() => {
  fetchEmployees()
})
</script>
