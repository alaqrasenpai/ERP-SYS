<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-700 p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{{ $t('roles.title', 'Roles & Permissions') }}</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ $t('roles.description', 'Manage system roles and their access levels') }}</p>
        </div>
        <div class="flex gap-4">
          <button @click="openAddModal" class="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors flex items-center">
            <svg class="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            {{ $t('roles.add_role', 'Add New Role') }}
          </button>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
        <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th scope="col" class="px-6 py-4 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('roles.name', 'Role Name') }}</th>
              <th scope="col" class="px-6 py-4 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('roles.permissions', 'Permissions Count') }}</th>
              <th scope="col" class="px-6 py-4 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('roles.actions', 'Actions') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-if="roles.length === 0">
              <td colspan="3" class="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No roles found.</td>
            </tr>
            <tr v-for="role in roles" :key="role._id" class="hover:bg-gray-50 dark:bg-gray-900">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{{ role.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <span v-if="role.permissions.includes('*')" class="px-2 py-1 bg-rose-100 text-rose-700 rounded text-xs font-bold">Full Access (Super)</span>
                <span v-else>{{ role.permissions.length }} permissions</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-start font-medium">
                <button @click="openEditModal(role)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 me-3 font-bold">
                  {{ $t('roles.edit', 'Edit') }}
                </button>
                <button v-if="role.name !== 'Admin' && role.name !== 'Store Admin'" @click="deleteRole(role._id)" class="text-rose-600 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-300 font-bold">
                  {{ $t('roles.delete', 'Delete') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Role Modal -->
      <ClientOnly>
        <Teleport to="body">
          <div v-if="showModal" class="fixed z-[100] inset-0 overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" @click="showModal = false"></div>
              
              <div class="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-start shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-3xl border border-gray-100 dark:border-gray-700">
                <form @submit.prevent="saveRole" class="flex flex-col max-h-[90vh]">
                  <div class="bg-white dark:bg-gray-800 px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ isEditMode ? $t('roles.edit_role', 'Edit Role') : $t('roles.add_new_role', 'Add New Role') }}</h3>
                    <button type="button" @click="showModal = false" class="text-gray-400 hover:text-gray-500">
                      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  <div class="px-6 py-6 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 flex-1">
                    <div class="mb-6">
                      <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('roles.role_name', 'Role Name') }}</label>
                      <input v-model="form.name" type="text" required class="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>

                    <div v-if="form.name === 'Admin' || form.name === 'Store Admin'" class="bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-6 text-sm font-medium">
                      {{ $t('roles.system_role_warning', 'This is a system role. It automatically has full access to all features.') }}
                    </div>
                    
                    <div v-else>
                      <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-4">{{ $t('roles.module_permissions', 'Module Permissions') }}</h4>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div v-for="(perms, moduleName) in availablePermissions" :key="moduleName" class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                          <h5 class="font-bold text-gray-800 dark:text-gray-200 mb-3 capitalize">{{ $t(`permissions.module_${moduleName}`, moduleName.replace(/_/g, ' ')) }}</h5>
                          <div class="space-y-2">
                            <label v-for="p in perms" :key="p.value" class="flex items-center">
                              <input type="checkbox" :value="p.value" v-model="form.permissions" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                              <span class="ms-2 text-sm text-gray-700 dark:text-gray-300">{{ $t(p.labelKey, p.fallback) }}</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="bg-white dark:bg-gray-900 px-6 py-4 flex flex-row-reverse border-t border-gray-100 dark:border-gray-700 shrink-0">
                    <button type="submit" class="inline-flex justify-center rounded-lg px-6 py-2.5 bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 shadow-sm ms-3">
                      {{ $t('roles.save', 'Save Role') }}
                    </button>
                    <button type="button" @click="showModal = false" class="inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2.5 bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900 shadow-sm">
                      {{ $t('roles.cancel', 'Cancel') }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Teleport>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Roles & Permissions' })
definePageMeta({ layout: 'app-layout', middleware: ['auth'] })

import { ref, onMounted } from 'vue'

const { $api } = useNuxtApp()
const roles = ref([])
const showModal = ref(false)
const isEditMode = ref(false)
const editRoleId = ref(null)

const form = ref({ name: '', permissions: [] })

const availablePermissions = {
  hr_dashboard: [
    { labelKey: 'permissions.hr_dashboard_view', fallback: 'View HR Dashboard', value: 'hr:dashboard:read' }
  ],
  hr_employees: [
    { labelKey: 'permissions.hr_employees_view', fallback: 'View Employees', value: 'hr:employees:read' },
    { labelKey: 'permissions.hr_employees_manage', fallback: 'Manage Employees', value: 'hr:employees:manage' }
  ],
  hr_departments: [
    { labelKey: 'permissions.hr_departments_view', fallback: 'View Departments', value: 'hr:departments:read' },
    { labelKey: 'permissions.hr_departments_manage', fallback: 'Manage Departments', value: 'hr:departments:manage' }
  ],
  hr_attendance: [
    { labelKey: 'permissions.hr_attendance_view', fallback: 'View Attendance', value: 'hr:attendance:read' },
    { labelKey: 'permissions.hr_attendance_manage', fallback: 'Manage Attendance & Overtime', value: 'hr:attendance:manage' }
  ],
  hr_shifts_leaves: [
    { labelKey: 'permissions.hr_shifts_view', fallback: 'View Shifts & Holidays', value: 'hr:shifts:read' },
    { labelKey: 'permissions.hr_shifts_manage', fallback: 'Manage Shifts & Holidays', value: 'hr:shifts:manage' },
    { labelKey: 'permissions.hr_leaves_view', fallback: 'View Leaves', value: 'hr:leaves:read' },
    { labelKey: 'permissions.hr_leaves_manage', fallback: 'Manage Leaves', value: 'hr:leaves:manage' }
  ],
  hr_payroll_financials: [
    { labelKey: 'permissions.hr_payroll_view', fallback: 'View Payroll', value: 'hr:payroll:read' },
    { labelKey: 'permissions.hr_payroll_manage', fallback: 'Manage Payroll', value: 'hr:payroll:manage' },
    { labelKey: 'permissions.hr_allowances_view', fallback: 'View Allowances', value: 'hr:allowances:read' },
    { labelKey: 'permissions.hr_allowances_manage', fallback: 'Manage Allowances', value: 'hr:allowances:manage' }
  ],
  hr_devices: [
    { labelKey: 'permissions.hr_devices_view', fallback: 'View Devices & Logs', value: 'hr:devices:read' },
    { labelKey: 'permissions.hr_devices_manage', fallback: 'Manage Devices', value: 'hr:devices:manage' }
  ],
  inventory: [
    { labelKey: 'permissions.inventory_read', fallback: 'Read Inventory (Items, Stock)', value: 'inventory:read' },
    { labelKey: 'permissions.inventory_manage', fallback: 'Manage Inventory', value: 'inventory:manage' }
  ],
  finance: [
    { labelKey: 'permissions.finance_read', fallback: 'Read Finance (Accounts)', value: 'finance:read' },
    { labelKey: 'permissions.finance_manage', fallback: 'Manage Finance', value: 'finance:manage' }
  ],
  store_pos: [
    { labelKey: 'permissions.store_pos_use', fallback: 'Use Retail POS', value: 'store_pos:use' },
    { labelKey: 'permissions.store_pos_manage', fallback: 'Manage Retail POS (Categories, Setup)', value: 'store_pos:manage' }
  ],
  restaurant: [
    { labelKey: 'permissions.restaurant_use', fallback: 'Use Restaurant (Orders, Tables, Kitchen)', value: 'restaurant:use' },
    { labelKey: 'permissions.restaurant_manage', fallback: 'Manage Restaurant (Sections, Menu Setup)', value: 'restaurant:manage' }
  ],
  crm: [
    { labelKey: 'permissions.crm_read', fallback: 'Read CRM', value: 'crm:read' },
    { labelKey: 'permissions.crm_manage', fallback: 'Manage CRM', value: 'crm:manage' }
  ],
  settings: [
    { labelKey: 'permissions.settings_manage', fallback: 'Manage System Settings', value: 'settings:manage' }
  ],
  team: [
    { labelKey: 'permissions.team_manage', fallback: 'Manage Users and Roles', value: 'team:manage' }
  ]
}

const fetchRoles = async () => {
  try {
    roles.value = await $api('/team/roles')
  } catch (err) {
    console.error(err)
  }
}

const openAddModal = () => {
  isEditMode.value = false
  editRoleId.value = null
  form.value = { name: '', permissions: [] }
  showModal.value = true
}

const openEditModal = (role) => {
  isEditMode.value = true
  editRoleId.value = role._id
  form.value = {
    name: role.name,
    permissions: [...role.permissions]
  }
  showModal.value = true
}

const saveRole = async () => {
  try {
    if (isEditMode.value) {
      await $api(`/team/roles/${editRoleId.value}`, { method: 'PUT', body: form.value })
    } else {
      await $api('/team/roles', { method: 'POST', body: form.value })
    }
    showModal.value = false
    fetchRoles()
  } catch (err) {
    alert(err.data?.message || 'Error saving role')
  }
}

const deleteRole = async (id) => {
  if (!confirm('Are you sure you want to delete this role?')) return
  try {
    await $api(`/team/roles/${id}`, { method: 'DELETE' })
    fetchRoles()
  } catch (err) {
    alert(err.data?.message || 'Error deleting role')
  }
}

onMounted(() => fetchRoles())
</script>
