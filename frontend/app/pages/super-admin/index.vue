<template>
  <div class="p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h2 class="text-3xl font-black text-gray-900 tracking-tight">SaaS Control Panel</h2>
          <p class="text-sm text-gray-500 mt-1">Manage all tenant stores and sub-accounts.</p>
        </div>
        <NuxtLink to="/super-admin/onboard" class="mt-4 sm:mt-0 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all flex items-center">
          <svg class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Onboard New Store
        </NuxtLink>
      </div>

      <div v-if="loading" class="flex justify-center p-12">
        <svg class="animate-spin h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>

      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase tracking-wider">Store Details</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase tracking-wider">Tenant ID / DB</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase tracking-wider">Modules</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-6 py-4 text-end text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="tenant in tenants" :key="tenant._id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900">{{ tenant.name }}</div>
                  <div class="text-xs text-gray-500 mt-1">Created: {{ new Date(tenant.createdAt).toLocaleDateString() }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-xs font-mono bg-gray-100 text-gray-800 px-2 py-1 rounded inline-block">{{ tenant.tenantId }}</div>
                  <div class="text-xs text-gray-500 mt-1">DB: {{ tenant.dbName }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1 max-w-[200px]">
                    <span v-for="mod in tenant.enabledModules" :key="mod" class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                      {{ mod }}
                    </span>
                    <span v-if="!tenant.enabledModules || tenant.enabledModules.length === 0" class="text-xs text-gray-400">None</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-if="tenant.status === 'active'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active
                  </span>
                  <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                    Suspended
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
              <div class="flex items-center justify-end gap-2">
                  <button @click="openUsersModal(tenant)" class="px-4 py-1.5 rounded-lg font-bold text-xs border transition-colors shadow-sm bg-white border-purple-200 text-purple-600 hover:bg-purple-50">
                    Users
                  </button>
                  <button @click="openModulesModal(tenant)" class="px-4 py-1.5 rounded-lg font-bold text-xs border transition-colors shadow-sm bg-white border-blue-200 text-blue-600 hover:bg-blue-50">
                    Modules
                  </button>
                  <button @click="copyLoginLink(tenant.tenantId)" class="px-4 py-1.5 rounded-lg font-bold text-xs border transition-colors shadow-sm bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                    Copy Link
                  </button>
                  <button @click="toggleStatus(tenant)" class="px-4 py-1.5 rounded-lg font-bold text-xs border transition-colors shadow-sm" :class="tenant.status === 'active' ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' : 'bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50'">
                    {{ tenant.status === 'active' ? 'Suspend' : 'Activate' }}
                  </button>
                </div>
            </td>
              </tr>
              <tr v-if="tenants.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                  <p class="text-sm font-bold">No stores found. Start by onboarding one.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Manage Modules Modal -->
    <div v-if="showModulesModal" class="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-900">Manage Modules: {{ selectedTenant?.name }}</h3>
          <button @click="showModulesModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="p-6">
          <div class="space-y-3">
            <label v-for="mod in availableModules" :key="mod.id" class="flex items-center p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors" :class="editingModules.includes(mod.id) ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-100'">
              <input type="checkbox" :value="mod.id" v-model="editingModules" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
              <span class="ms-3 font-bold text-sm text-gray-700">{{ mod.label }}</span>
            </label>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button @click="showModulesModal = false" class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
            <button @click="saveModules" :disabled="savingModules" class="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50">
              {{ savingModules ? 'Saving...' : 'Save Modules' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Manage Users Modal -->
    <div v-if="showUsersModal" class="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-900">Manage Users: {{ selectedTenant?.name }}</h3>
          <button @click="showUsersModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="p-6 overflow-y-auto flex-1">
          <div v-if="loadingUsers" class="flex justify-center p-8">
            <svg class="animate-spin h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
          <div v-else>
            <table class="min-w-full divide-y divide-gray-100">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-4 py-3 text-start text-xs font-black text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" class="px-4 py-3 text-start text-xs font-black text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" class="px-4 py-3 text-start text-xs font-black text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" class="px-4 py-3 text-end text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                <tr v-for="u in tenantUsers" :key="u._id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm font-bold text-gray-900">{{ u.name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-500">{{ u.email }}</td>
                  <td class="px-4 py-3 text-sm text-gray-500">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">{{ u.role?.name || 'Unknown' }}</span>
                  </td>
                  <td class="px-4 py-3 text-end text-sm font-medium">
                    <button @click="openEditUserModal(u)" class="text-purple-600 hover:text-purple-900 font-bold bg-purple-50 px-3 py-1 rounded-md">Edit</button>
                  </td>
                </tr>
                <tr v-if="tenantUsers.length === 0">
                  <td colspan="4" class="px-4 py-8 text-center text-gray-500 text-sm">No users found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditUserModal" class="fixed inset-0 bg-gray-900/60 flex items-center justify-center p-4 z-[60]">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-900">Edit User</h3>
          <button @click="showEditUserModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="p-6">
          <form @submit.prevent="saveUser">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Name</label>
                <input v-model="editUserForm.name" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500" required>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">New Password (leave blank to keep current)</label>
                <input v-model="editUserForm.password" type="password" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="••••••••">
              </div>
            </div>
            <div class="mt-6 flex justify-end gap-3">
              <button type="button" @click="showEditUserModal = false" class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
              <button type="submit" :disabled="savingUser" class="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50">
                {{ savingUser ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Super Admin' })

import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'super-admin'
})

const router = useRouter()
const tenants = ref([])
const loading = ref(true)

const availableModules = [
  { id: 'inventory', label: 'Inventory & Warehouse' },
  { id: 'pos', label: 'Point of Sale (POS)' },
  { id: 'hr', label: 'Human Resources (HR)' },
  { id: 'accounting', label: 'Accounting & Finance' },
  { id: 'archive', label: 'Digital Archive' },
  { id: 'ess', label: 'Self Service (ESS)' },
  { id: 'restaurant', label: 'Restaurant & F&B' }
]

const showModulesModal = ref(false)
const selectedTenant = ref(null)
const editingModules = ref([])
const savingModules = ref(false)

const copyLoginLink = (tenantId) => {
  const url = `${window.location.origin}/${tenantId}/login`
  navigator.clipboard.writeText(url)
  alert(`Login link copied: ${url}`)
}

// User Management State
const showUsersModal = ref(false)
const loadingUsers = ref(false)
const tenantUsers = ref([])

const showEditUserModal = ref(false)
const selectedUser = ref(null)
const editUserForm = ref({ name: '', password: '' })
const superAdminToken = useCookie('super_admin_token')
const API_BASE = process.env.NODE_ENV === 'production' ? 'https://erp-sys-71b6.onrender.com/api' : 'http://localhost:5000/api'

const fetchTenants = async () => {
  const token = localStorage.getItem('super_token')
  if (!token) {
    router.push('/super-admin/login')
    return
  }

  try {
    tenants.value = await $fetch(`${API_BASE}/super/tenants`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('super_token')
      router.push('/super-admin/login')
    } else {
      alert('Failed to load tenants')
    }
  } finally {
    loading.value = false
  }
}

const toggleStatus = async (tenant) => {
  const token = localStorage.getItem('super_token')
  const newStatus = tenant.status === 'active' ? 'suspended' : 'active'
  const confirmMsg = newStatus === 'suspended' ? `Are you sure you want to SUSPEND ${tenant.name}? They will lose all access.` : `Reactivate ${tenant.name}?`
  
  if (!confirm(confirmMsg)) return

  try {
    await $fetch(`${API_BASE}/super/tenants/${tenant._id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { status: newStatus }
    })
    tenant.status = newStatus
  } catch (error) {
    alert('Failed to update status')
  }
}

const openModulesModal = (tenant) => {
  selectedTenant.value = tenant
  editingModules.value = [...(tenant.enabledModules || [])]
  showModulesModal.value = true
}

const saveModules = async () => {
  const token = localStorage.getItem('super_token')
  savingModules.value = true
  try {
    const res = await $fetch(`${API_BASE}/super/tenants/${selectedTenant.value._id}/modules`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { enabledModules: editingModules.value }
    })
    selectedTenant.value.enabledModules = [...editingModules.value]
    showModulesModal.value = false
  } catch (error) {
    alert('Failed to update modules')
  } finally {
    savingModules.value = false
  }
}

const fetchTenantUsers = async (tenant) => {
  const token = localStorage.getItem('super_token')
  loadingUsers.value = true
  try {
    tenantUsers.value = await $fetch(`${API_BASE}/super/tenants/${tenant._id}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (error) {
    alert('Failed to fetch users')
  } finally {
    loadingUsers.value = false
  }
}

const openUsersModal = (tenant) => {
  selectedTenant.value = tenant
  showUsersModal.value = true
  fetchTenantUsers(tenant)
}

const openEditUserModal = (user) => {
  selectedUser.value = user
  editUserForm.value = { name: user.name, password: '' }
  showEditUserModal.value = true
}

const saveUser = async () => {
  const token = localStorage.getItem('super_token')
  savingUser.value = true
  try {
    const payload = { name: editUserForm.value.name }
    if (editUserForm.value.password) {
      payload.password = editUserForm.value.password
    }
    
    await $fetch(`${API_BASE}/super/tenants/${selectedTenant.value._id}/users/${selectedUser.value._id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: payload
    })
    
    // Update local state
    selectedUser.value.name = payload.name
    showEditUserModal.value = false
    
    if (payload.password) {
      alert('تم حفظ كلمة السر الجديدة بنجاح')
    } else {
      alert('User updated successfully')
    }
  } catch (error) {
    alert('Failed to update user')
  } finally {
    savingUser.value = false
  }
}

onMounted(fetchTenants)
</script>
