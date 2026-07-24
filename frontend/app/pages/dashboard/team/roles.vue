<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-8">
    <div class="max-w-5xl mx-auto space-y-6">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 ">
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight truncate">{{ $t('roles.title') }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ $t('roles.description') }}</p>
        </div>
      <button @click="openCreateModal" class="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-white rounded-xl font-bold flex items-center gap-2">
        <svg class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        {{ $t('roles.new_role') }}
      </button>
    </div>

    <div v-if="loading" class="flex justify-center p-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>

    <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-4 py-3 sm:px-6 sm:py-4 text-start text-xs font-black text-gray-500 uppercase tracking-wider">{{ $t('roles.role_name') }}</th>
            <th scope="col" class="px-4 py-3 sm:px-6 sm:py-4 text-start text-xs font-black text-gray-500 uppercase tracking-wider">{{ $t('roles.permissions') }}</th>
            <th scope="col" class="px-4 py-3 sm:px-6 sm:py-4 text-end text-xs font-black text-gray-500 uppercase tracking-wider">{{ $t('roles.actions') }}</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr v-for="role in roles" :key="role._id" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-bold text-gray-900">
              {{ role.name }}
              <span v-if="role.permissions.includes('*')" class="ms-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-secondary-100 text-secondary-800 uppercase">{{ $t('roles.super_admin') }}</span>
            </td>
            <td class="px-4 py-3 sm:px-6 sm:py-4">
              <div class="flex flex-wrap gap-1 max-w-lg">
                <span v-if="role.permissions.includes('*')" class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800 uppercase">{{ $t('roles.all_access') }}</span>
                <span v-else v-for="perm in role.permissions" :key="perm" class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                  {{ perm }}
                </span>
                <span v-if="!role.permissions.includes('*') && role.permissions.length === 0" class="text-xs text-gray-400">{{ $t('roles.no_permissions') }}</span>
              </div>
            </td>
            <td class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-end text-sm font-medium">
              <div class="flex items-center justify-end gap-2">
              <button @click="openEditModal(role)" :disabled="role.name === 'Admin' || role.name === 'Store Admin'" class="px-3 py-1.5 rounded-lg font-bold text-xs bg-primary-50 text-primary-600 hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {{ $t('roles.edit') }}
              </button>
              <button @click="deleteRole(role)" :disabled="role.name === 'Admin' || role.name === 'Store Admin'" class="px-3 py-1.5 rounded-lg font-bold text-xs bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {{ $t('roles.delete') }}
              </button>
              </div>
            </td>
          </tr>
          <tr v-if="roles.length === 0">
            <td colspan="3" class="px-6 py-12 text-center text-gray-500 text-sm font-bold">{{ $t('roles.no_roles_found') }}</td>
          </tr>
        </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Role Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-900">{{ editingRole ? $t('roles.edit_role') : $t('roles.create_new_role') }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form @submit.prevent="saveRole" class="flex flex-col flex-1 overflow-hidden">
          <div class="p-6 overflow-y-auto flex-1 space-y-6">
            <!-- Role Name -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('roles.role_name') }}</label>
              <input v-model="form.name" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500" :placeholder="$t('roles.role_name_placeholder')" required>
            </div>

            <!-- Permissions Grid -->
            <div>
              <div class="flex justify-between items-end mb-3">
                <label class="block text-sm font-bold text-gray-700">{{ $t('roles.granular_permissions') }}</label>
                <div class="flex items-center gap-3">
                  <button type="button" @click="selectAll" class="text-xs font-bold text-primary-600 hover:text-primary-800">{{ $t('roles.select_all') }}</button>
                  <button type="button" @click="form.permissions = []" class="text-xs font-bold text-gray-500 hover:text-gray-700">{{ $t('roles.clear_all') }}</button>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="group in permissionGroups" :key="group.group" class="border border-gray-100 rounded-xl overflow-hidden">
                  <div class="bg-gray-50 px-3 py-2 border-b border-gray-100 font-bold text-xs text-gray-700 uppercase">
                    {{ $t(`roles.groups.${group.group}`) }}
                  </div>
                  <div class="p-3 space-y-2">
                    <label v-for="perm in group.perms" :key="perm.id" class="flex items-center cursor-pointer group">
                      <input type="checkbox" :value="perm.id" v-model="form.permissions" class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500">
                      <span class="ms-3 text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors">{{ $t(`roles.groups.${perm.label}`) }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button type="button" @click="showModal = false" class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">{{ $t('roles.cancel') }}</button>
            <button type="submit" :disabled="saving" class="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50 transition-colors">
              {{ saving ? $t('roles.saving') : $t('roles.save_role') }}
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Roles' })

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
  { group: 'inventory_supply_chain', perms: [{ id: 'inventory:read', label: 'read_products_stock' }, { id: 'inventory:write', label: 'manage_products_stock' }] },
  { group: 'pos', perms: [{ id: 'pos:create', label: 'create_orders' }, { id: 'pos:write', label: 'manage_shifts' }] },
  { group: 'finance_accounting', perms: [{ id: 'accounting:read', label: 'read_ledgers_transactions' }, { id: 'accounting:write', label: 'manage_accounting' }] },
  { group: 'hr_payroll', perms: [{ id: 'hr:read', label: 'read_employee_data' }, { id: 'hr:write', label: 'manage_employees_payroll' }] },
  { group: 'ess', perms: [{ id: 'ess:read', label: 'access_ess_portal' }] },
  { group: 'digital_archive', perms: [{ id: 'archive:read', label: 'read_files' }, { id: 'archive:write', label: 'upload_delete_files' }] },
  { group: 'team_access', perms: [{ id: 'team:manage', label: 'manage_users_roles' }] },
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
    alert(useNuxtApp().$i18n.t('roles.failed_save') + ' ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

const deleteRole = async (role) => {
  if (!confirm(`${useNuxtApp().$i18n.t('roles.confirm_delete')} "${role.name}"?`)) return
  try {
    await $api(`/team/roles/${role._id}`, { method: 'DELETE' })
    await fetchRoles()
  } catch (error) {
    alert(error.response?.data?.message || useNuxtApp().$i18n.t('roles.failed_delete'))
  }
}

onMounted(fetchRoles)
</script>
