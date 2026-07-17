<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight">Staff Management</h2>
        <p class="text-sm text-gray-500 mt-1">Manage team members, roles, and access status.</p>
      </div>
      <button @click="openCreateModal" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        New Staff
      </button>
    </div>

    <div v-if="loading" class="flex justify-center p-12">
      <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>

    <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Staff Details</th>
            <th scope="col" class="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Assigned Role</th>
            <th scope="col" class="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" class="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr v-for="user in users" :key="user._id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-bold text-gray-900">{{ user.name }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ user.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                {{ user.role?.name || 'No Role' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span v-if="user.isActive" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Active</span>
              <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">Suspended</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <button @click="openEditModal(user)" class="px-3 py-1.5 rounded-lg font-bold text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                Edit
              </button>
              <button @click="toggleStatus(user)" class="px-3 py-1.5 rounded-lg font-bold text-xs transition-colors" :class="user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'">
                {{ user.isActive ? 'Suspend' : 'Activate' }}
              </button>
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="4" class="px-6 py-12 text-center text-gray-500 text-sm font-bold">No staff members found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Staff Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-900">{{ editingUser ? 'Edit Staff Member' : 'Add New Staff Member' }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form @submit.prevent="saveUser" class="flex flex-col">
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
              <input v-model="form.name" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
              <input v-model="form.email" type="email" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">
                Password <span v-if="editingUser" class="text-xs text-gray-400 font-normal">(leave blank to keep current)</span>
              </label>
              <input v-model="form.password" type="password" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" :required="!editingUser">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Assigned Role</label>
              <select v-model="form.roleId" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required>
                <option value="" disabled>Select a role...</option>
                <option v-for="role in roles" :key="role._id" :value="role._id">{{ role.name }}</option>
              </select>
            </div>
          </div>
          
          <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
            <button type="button" @click="showModal = false" class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" :disabled="saving" class="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {{ saving ? 'Saving...' : 'Save Staff' }}
            </button>
          </div>
        </form>
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

const users = ref([])
const roles = ref([])
const loading = ref(true)

const showModal = ref(false)
const editingUser = ref(null)
const form = ref({ name: '', email: '', password: '', roleId: '' })
const saving = ref(false)

const fetchData = async () => {
  try {
    const [usersRes, rolesRes] = await Promise.all([
      $api('/team/users'),
      $api('/team/roles')
    ])
    users.value = usersRes
    roles.value = rolesRes
  } catch (error) {
    console.error('Failed to load team data', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingUser.value = null
  form.value = { name: '', email: '', password: '', roleId: '' }
  showModal.value = true
}

const openEditModal = (user) => {
  editingUser.value = user
  form.value = { 
    name: user.name, 
    email: user.email, 
    password: '', 
    roleId: user.role?._id || '' 
  }
  showModal.value = true
}

const saveUser = async () => {
  saving.value = true
  try {
    if (editingUser.value) {
      const payload = { ...form.value }
      if (!payload.password) delete payload.password // Don't send empty password
      
      await $api(`/team/users/${editingUser.value._id}`, {
        method: 'PUT',
        body: payload
      })
    } else {
      await $api('/team/users', {
        method: 'POST',
        body: form.value
      })
    }
    await fetchData()
    showModal.value = false
  } catch (error) {
    alert('Failed to save staff member: ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (user) => {
  const newStatus = !user.isActive
  const msg = newStatus ? `Activate ${user.name}?` : `Suspend ${user.name}? They will not be able to log in.`
  if (!confirm(msg)) return
  
  try {
    await $api(`/team/users/${user._id}/status`, {
      method: 'PUT',
      body: { isActive: newStatus }
    })
    user.isActive = newStatus
  } catch (error) {
    alert('Failed to update status')
  }
}

onMounted(fetchData)
</script>
