<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">{{ $t('structure.title') }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ $t('structure.description') }}</p>
        </div>
        <div class="flex gap-3 mt-4 sm:mt-0">
          <button @click="openAddModal()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center">
            <svg class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            {{ $t('structure.add_department') }}
          </button>
        </div>
      </div>

      <!-- Structure Tree Table -->
      <div class="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden mb-8">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('structure.department_name') }}</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('structure.code') }}</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('structure.manager') }}</th>
                <th scope="col" class="px-6 py-4 text-end text-xs font-bold text-gray-500 uppercase tracking-wider">{{ $t('structure.actions') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="dept in sortedDepartments" :key="dept._id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center" :style="{ paddingInlineStart: `${getDepth(dept._id) * 2}rem` }">
                    <svg v-if="getDepth(dept._id) > 0" class="w-4 h-4 text-gray-300 me-2 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    <div class="text-sm font-bold text-gray-900">{{ dept.name }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                  {{ dept.code }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold me-3" v-if="dept.managerId">
                      {{ dept.managerId.name.charAt(0) }}
                    </div>
                    <span v-if="dept.managerId">{{ dept.managerId.name }}</span>
                    <span v-else class="text-gray-400 italic">{{ $t('structure.no_manager') }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
              <div class="flex items-center justify-end gap-2">
                  <button @click="openEditModal(dept)" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg font-bold transition-colors">{{ $t('structure.edit') }}</button>
                  <button @click="deleteDepartment(dept._id)" class="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1.5 rounded-lg font-bold transition-colors">{{ $t('structure.delete') }}</button>
                </div>
            </td>
              </tr>
              <tr v-if="departments.length === 0 && !loading">
                <td colspan="4" class="px-6 py-12 text-center text-sm text-gray-500">
                  {{ $t('structure.no_departments_found') }}
                </td>
              </tr>
              <tr v-if="loading">
                <td colspan="4" class="px-6 py-12 text-center text-sm text-gray-500">
                  {{ $t('structure.loading') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl text-start overflow-hidden shadow-2xl w-full max-w-md border border-gray-100 flex flex-col max-h-[90vh]">
          <form @submit.prevent="saveDepartment" class="flex flex-col flex-1 overflow-hidden">
            <div class="bg-white px-6 pt-6 pb-6 overflow-y-auto flex-1">
              <h3 class="text-xl font-bold text-gray-900 mb-6">{{ isEditing ? $t('structure.edit_department') : $t('structure.create_department') }}</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('structure.department_name_req') }}</label>
                  <input v-model="form.name" type="text" required class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('structure.code_req') }}</label>
                  <input v-model="form.code" type="text" required class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono uppercase">
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('structure.parent_department') }}</label>
                  <select v-model="form.parentDepartmentId" class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option :value="null">{{ $t('structure.none_top_level') }}</option>
                    <option v-for="d in departments.filter(dep => dep._id !== editingId)" :key="d._id" :value="d._id">{{ d.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('structure.manager') }}</label>
                  <select v-model="form.managerId" class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option :value="null">{{ $t('structure.unassigned') }}</option>
                    <option v-for="emp in employees" :key="emp._id" :value="emp._id">{{ emp.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('structure.dept_description') }}</label>
                  <textarea v-model="form.description" rows="3" class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-6 py-4 flex flex-row-reverse border-t border-gray-100 flex-shrink-0 gap-3">
              <button type="submit" class="inline-flex justify-center rounded-lg px-5 py-2.5 bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 ms-3">
                {{ isEditing ? $t('structure.save_changes') : $t('structure.create') }}
              </button>
              <button type="button" @click="showModal = false" class="inline-flex justify-center rounded-lg border border-gray-300 px-5 py-2.5 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50">
                {{ $t('structure.cancel') }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Structure' })

import { ref, computed, onMounted } from 'vue'

definePageMeta({ 
  layout: 'dashboard',
  middleware: ['auth', 'module-guard'],
  requiredModule: 'hr'
})

const { $api } = useNuxtApp()
const departments = ref([])
const employees = ref([])
const loading = ref(true)

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  name: '',
  code: '',
  parentDepartmentId: null,
  managerId: null,
  description: ''
})

const fetchDepartments = async () => {
  loading.value = true
  try {
    departments.value = await $api('/hr/departments')
    employees.value = await $api('/hr/employees')
  } catch (error) {
    console.error('Failed to fetch data', error)
  } finally {
    loading.value = false
  }
}

// Simple logic to order departments hierarchically
const sortedDepartments = computed(() => {
  const map = {}
  const roots = []
  
  departments.value.forEach(d => {
    map[d._id] = { ...d, children: [] }
  })
  
  departments.value.forEach(d => {
    if (d.parentDepartmentId && d.parentDepartmentId._id && map[d.parentDepartmentId._id]) {
      map[d.parentDepartmentId._id].children.push(map[d._id])
    } else if (d.parentDepartmentId && map[d.parentDepartmentId]) {
      map[d.parentDepartmentId].children.push(map[d._id])
    } else {
      roots.push(map[d._id])
    }
  })
  
  const flat = []
  const traverse = (node, depth) => {
    node.depth = depth
    flat.push(node)
    node.children.forEach(c => traverse(c, depth + 1))
  }
  
  roots.forEach(r => traverse(r, 0))
  return flat
})

const getDepth = (id) => {
  const d = sortedDepartments.value.find(dep => dep._id === id)
  return d ? d.depth : 0
}

const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = { name: '', code: '', parentDepartmentId: null, managerId: null, description: '' }
  showModal.value = true
}

const openEditModal = (dept) => {
  isEditing.value = true
  editingId.value = dept._id
  form.value = {
    name: dept.name,
    code: dept.code,
    parentDepartmentId: dept.parentDepartmentId?._id || dept.parentDepartmentId || null,
    managerId: dept.managerId?._id || dept.managerId || null,
    description: dept.description || ''
  }
  showModal.value = true
}

const saveDepartment = async () => {
  try {
    const payload = { ...form.value }
    if (!payload.parentDepartmentId) delete payload.parentDepartmentId
    if (!payload.managerId) delete payload.managerId
    
    if (isEditing.value) {
      await $api(`/hr/departments/${editingId.value}`, { method: 'PUT', body: payload })
    } else {
      await $api('/hr/departments', { method: 'POST', body: payload })
    }
    
    showModal.value = false
    fetchDepartments()
  } catch (error) {
    alert(error.data?.message || useNuxtApp().$i18n.t('structure.failed_save'))
  }
}

const deleteDepartment = async (id) => {
  if (!confirm(useNuxtApp().$i18n.t('structure.delete_prompt'))) return
  try {
    await $api(`/hr/departments/${id}`, { method: 'DELETE' })
    fetchDepartments()
  } catch (error) {
    alert(error.data?.message || useNuxtApp().$i18n.t('structure.failed_delete'))
  }
}

onMounted(() => {
  fetchDepartments()
})
</script>
