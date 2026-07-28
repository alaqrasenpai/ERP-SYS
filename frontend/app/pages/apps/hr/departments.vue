<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{{ $t('departments.title') }}</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ $t('departments.description') }}</p>
      </div>
      <button @click="openAddModal" class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center">
        <svg class="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        {{ $t('departments.add') }}
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('departments.name') }}</th>
              <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('departments.code') }}</th>
              <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('departments.manager') }}</th>
              <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('departments.parent') }}</th>
              <th class="px-6 py-4 text-end text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('departments.actions') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-for="dept in hierarchicalDepartments" :key="dept._id" class="hover:bg-gray-50 dark:bg-gray-900 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center" :style="{ 'padding-inline-start': dept.level > 0 ? `${dept.level * 2.5}rem` : '0' }">
                  <!-- Branch Icon for Sub-departments -->
                  <div v-if="dept.level > 0" class="text-gray-300 dark:text-gray-600 me-3 flex-shrink-0 flex items-center justify-center">
                    <svg class="w-5 h-5 rtl:-scale-x-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                  </div>
                  <div class="h-10 w-10 rounded-xl flex items-center justify-center font-bold me-3 shadow-inner" :class="dept.level === 0 ? 'bg-indigo-600 text-white' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'">
                    {{ dept.name.charAt(0) }}
                  </div>
                  <div>
                    <div class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {{ dept.name }}
                      <span v-if="dept.level === 0" class="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Main</span>
                    </div>
                    <div class="text-xs text-gray-500">{{ dept.description || '' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">{{ dept.code }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <span v-if="dept.managerId" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                  {{ dept.managerId.name }}
                </span>
                <span v-else class="text-xs text-gray-400">{{ $t('departments.no_manager') }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ dept.parentDepartmentId ? dept.parentDepartmentId.name : $t('departments.no_parent') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                <button @click="openEditModal(dept)" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 me-3 font-bold">{{ $t('departments.edit') }}</button>
                <button @click="deleteDepartment(dept._id)" class="text-rose-600 dark:text-rose-400 hover:text-rose-900 font-bold">{{ $t('departments.delete') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed z-50 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" @click="showModal = false"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-start overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full border border-gray-100 dark:border-gray-700">
          <form @submit.prevent="saveDepartment">
            <div class="bg-white dark:bg-gray-800 px-6 py-6">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {{ isEditing ? $t('departments.edit') : $t('departments.add') }}
              </h3>
              
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('departments.name') }}</label>
                    <input v-model="form.name" type="text" required class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('departments.code') }}</label>
                    <input v-model="form.code" type="text" required class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('departments.manager') }}</label>
                    <select v-model="form.managerId" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option :value="null">{{ $t('departments.no_manager') }}</option>
                      <option v-for="emp in employees" :key="emp._id" :value="emp._id">{{ emp.name }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('departments.parent') }}</label>
                    <select v-model="form.parentDepartmentId" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option :value="null">{{ $t('departments.no_parent') }}</option>
                      <option v-for="d in availableParentDepartments" :key="d._id" :value="d._id">{{ d.name }}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('departments.desc') }}</label>
                  <textarea v-model="form.description" rows="2" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                </div>
              </div>

            </div>
            <div class="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex flex-row-reverse border-t border-gray-100 dark:border-gray-700 flex-shrink-0 gap-3">
              <button type="submit" class="inline-flex justify-center rounded-lg px-6 py-2.5 bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 shadow-sm ms-3">
                {{ $t('departments.save') }}
              </button>
              <button type="button" @click="showModal = false" class="inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2.5 bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900 shadow-sm">
                {{ $t('departments.cancel') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
useHead({ title: 'Departments' })

import { ref, computed, onMounted } from 'vue'

definePageMeta({ 
  layout: 'app-layout',
  middleware: ['auth', 'module-guard'],
  requiredModule: 'hr'
})

const { $api } = useNuxtApp()
const departments = ref([])
const employees = ref([])

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  name: '',
  code: '',
  managerId: null,
  parentDepartmentId: null,
  description: ''
})

const availableParentDepartments = computed(() => {
  if (!isEditing.value) return departments.value
  return departments.value.filter(d => d._id !== editingId.value && d.parentDepartmentId?._id !== editingId.value)
})

const hierarchicalDepartments = computed(() => {
  if (!departments.value || departments.value.length === 0) return []
  
  const result = []
  const visited = new Set()
  
  const traverse = (parentId, level) => {
    const children = departments.value.filter(d => {
      const pId = d.parentDepartmentId?._id || d.parentDepartmentId || null;
      return pId === parentId;
    })
    
    for (const child of children) {
      if (visited.has(child._id)) continue;
      visited.add(child._id)
      result.push({ ...child, level })
      traverse(child._id, level + 1)
    }
  }
  
  // start with roots (no parent)
  traverse(null, 0)
  
  // catch any disconnected parts (if a parent was deleted but reference kept, or bad data)
  const unvisited = departments.value.filter(d => !visited.has(d._id))
  for (const child of unvisited) {
    if (visited.has(child._id)) continue;
    visited.add(child._id)
    result.push({ ...child, level: 0 })
    traverse(child._id, 1)
  }
  
  return result
})

const fetchData = async () => {
  try {
    departments.value = await $api('/hr/departments')
    employees.value = await $api('/hr/employees')
  } catch (error) {
    console.error('Failed to fetch data', error)
  }
}

const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = {
    name: '', code: '', managerId: null, parentDepartmentId: null, description: ''
  }
  showModal.value = true
}

const openEditModal = (dept) => {
  isEditing.value = true
  editingId.value = dept._id
  form.value = { 
    name: dept.name, 
    code: dept.code, 
    managerId: dept.managerId?._id || dept.managerId || null, 
    parentDepartmentId: dept.parentDepartmentId?._id || dept.parentDepartmentId || null, 
    description: dept.description || '' 
  }
  showModal.value = true
}

const saveDepartment = async () => {
  try {
    const payload = { ...form.value }
    if (!payload.managerId) payload.managerId = null
    if (!payload.parentDepartmentId) payload.parentDepartmentId = null

    if (isEditing.value) {
      await $api(`/hr/departments/${editingId.value}`, { method: 'PUT', body: payload })
    } else {
      await $api('/hr/departments', { method: 'POST', body: payload })
    }
    showModal.value = false
    fetchData()
  } catch (error) {
    console.error('Failed to save department', error)
    alert(error.data?.message || 'Error saving department')
  }
}

const deleteDepartment = async (id) => {
  if (!confirm('Are you sure you want to delete this department?')) return
  try {
    await $api(`/hr/departments/${id}`, { method: 'DELETE' })
    fetchData()
  } catch (error) {
    console.error('Failed to delete', error)
    alert('Failed to delete department')
  }
}

onMounted(() => {
  fetchData()
})
</script>
