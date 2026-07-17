<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-8">
    <div class="max-w-5xl mx-auto space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">Access Roles</h2>
          <p class="text-sm text-gray-500 mt-1">Manage custom roles and granular permissions.</p>
        </div>
      <button @click="openCreateModal" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        New Role
      </button>
    </div>

    <div v-if="loading" class="flex justify-center p-12">
      <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>

    <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Role Name</th>
            <th scope="col" class="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Permissions</th>
            <th scope="col" class="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr v-for="role in roles" :key="role._id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
              {{ role.name }}
              <span v-if="role.permissions.includes('*')" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">Super Admin</span>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-wrap gap-1 max-w-lg">
                <span v-if="role.permissions.includes('*')" class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800 uppercase">All Access</span>
                <span v-else v-for="perm in role.permissions" :key="perm" class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                  {{ perm }}
                </span>
                <span v-if="!role.permissions.includes('*') && role.permissions.length === 0" class="text-xs text-gray-400">No Permissions</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <button @click="openEditModal(role)" :disabled="role.name === 'Admin' || role.name === 'Store Admin'" class="px-3 py-1.5 rounded-lg font-bold text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Edit
              </button>
              <button @click="deleteRole(role)" :disabled="role.name === 'Admin' || role.name === 'Store Admin'" class="px-3 py-1.5 rounded-lg font-bold text-xs bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Delete
              </button>
            </td>
          </tr>
          <tr v-if="roles.length === 0">
            <td colspan="3" class="px-6 py-12 text-center text-gray-500 text-sm font-bold">No roles found.</td>
          </tr>
        </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Role Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-900">{{ editingRole ? 'Edit Role' : 'Create New Role' }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form @submit.prevent="saveRole" class="flex flex-col flex-1 overflow-hidden">
          <div class="p-6 overflow-y-auto flex-1 space-y-6">
            <!-- Role Name -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Role Name</label>
              <input v-model="form.name" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Inventory Manager" required>
            </div>

            <!-- Permissions Grid -->
            <div>
              <div class="flex justify-between items-end mb-3">
                <label class="block text-sm font-bold text-gray-700">Granular Permissions</label>
                <div class="space-x-2">
                  <button type="button" @click="selectAll" class="text-xs font-bold text-indigo-600 hover:text-indigo-800">Select All</button>
                  <button type="button" @click="form.permissions = []" class="text-xs font-bold text-gray-500 hover:text-gray-700">Clear All</button>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="group in permissionGroups" :key="group.group" class="border border-gray-200 rounded-xl overflow-hidden">
                  <div class="bg-gray-50 px-3 py-2 border-b border-gray-200 font-bold text-xs text-gray-700 uppercase">
                    {{ group.group }}
                  </div>
                  <div class="p-3 space-y-2">
                    <label v-for="perm in group.perms" :key="perm.id" class="flex items-center cursor-pointer group">
                      <input type="checkbox" :value="perm.id" v-model="form.permissions" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                      <span class="ml-3 text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">{{ perm.label }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
            <button type="button" @click="showModal = false" class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" :disabled="saving" class="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {{ saving ? 'Saving...' : 'Save Role' }}
            </button>
          </div>
        </form>
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

const roles = ref([])
const loading = ref(true)

const showModal = ref(false)
const editingRole = ref(null)
const form = ref({ name: '', permissions: [] })
const saving = ref(false)

const permissionGroups = [
  { group: 'Inventory & Supply Chain', perms: [{ id: 'inventory:read', label: 'Read Products & Stock' }, { id: 'inventory:write', label: 'Manage Products & Stock' }] },
  { group: 'Point of Sale (POS)', perms: [{ id: 'pos:create', label: 'Create Orders' }, { id: 'pos:write', label: 'Manage Shifts' }] },
  { group: 'Finance & Accounting', perms: [{ id: 'accounting:read', label: 'Read Ledgers & Transactions' }, { id: 'accounting:write', label: 'Manage Accounting' }] },
  { group: 'HR & Payroll', perms: [{ id: 'hr:read', label: 'Read Employee Data' }, { id: 'hr:write', label: 'Manage Employees & Payroll' }] },
  { group: 'Digital Archive', perms: [{ id: 'archive:read', label: 'Read Files' }, { id: 'archive:write', label: 'Upload/Delete Files' }] },
  { group: 'Team Access', perms: [{ id: 'team:manage', label: 'Manage Users & Roles' }] },
]

const fetchRoles = async () => {
  try {
    roles.value = await $api('/team/roles')
  } catch (error) {
    console.error('Failed to load roles', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingRole.value = null
  form.value = { name: '', permissions: [] }
  showModal.value = true
}

const openEditModal = (role) => {
  editingRole.value = role
  form.value = { name: role.name, permissions: [...role.permissions] }
  showModal.value = true
}

const selectAll = () => {
  form.value.permissions = permissionGroups.flatMap(g => g.perms.map(p => p.id))
}

const saveRole = async () => {
  saving.value = true
  try {
    if (editingRole.value) {
      await $api(`/team/roles/${editingRole.value._id}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      await $api('/team/roles', {
        method: 'POST',
        body: form.value
      })
    }
    await fetchRoles()
    showModal.value = false
  } catch (error) {
    alert('Failed to save role: ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

const deleteRole = async (role) => {
  if (!confirm(`Are you sure you want to delete the role "${role.name}"?`)) return
  try {
    await $api(`/team/roles/${role._id}`, { method: 'DELETE' })
    await fetchRoles()
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to delete role')
  }
}

onMounted(fetchRoles)
</script>
