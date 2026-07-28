<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-700 p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{{ $t('users_page.title') }}</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ $t('users_page.description') }}</p>
        </div>
        <div class="flex gap-4">
          <button @click="openAddModal" class="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors flex items-center">
            <svg class="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            {{ $t('users_page.add_new_user') }}
          </button>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
        <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th scope="col" class="px-6 py-4 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('users_page.name') }}</th>
              <th scope="col" class="px-6 py-4 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('users_page.email') }}</th>
              <th scope="col" class="px-6 py-4 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('users_page.role') }}</th>
              <th scope="col" class="px-6 py-4 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('users_page.status') }}</th>
              <th scope="col" class="px-6 py-4 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('users_page.actions') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-for="user in users" :key="user._id" class="hover:bg-gray-50 dark:bg-gray-900">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{{ user.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <span class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{{ user.role?.name || 'User' }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-50 text-green-700 border border-green-200" v-if="user.isActive">{{ $t('users_page.active') }}</span>
                <span class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-red-50 text-red-700 border border-red-200" v-else>{{ $t('users_page.inactive') }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-start font-medium">
                <button @click="openEditModal(user)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add User Modal -->
      <div v-if="showModal" class="fixed z-50 inset-0 overflow-y-auto">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm" @click="showModal = false"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-start overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100 dark:border-gray-700">
            <form @submit.prevent="addUser">
              <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">{{ isEditMode ? $t('users_page.edit_user') : $t('users_page.add_new_user') }}</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('users_page.name') }}</label>
                    <input v-model="form.name" type="text" required class="block w-full border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm ring-1 ring-gray-900/5 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('users_page.email') }}</label>
                    <input v-model="form.email" type="email" required class="block w-full border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm ring-1 ring-gray-900/5 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('users_page.password') }}</label>
                    <input v-model="form.password" type="password" :required="!isEditMode" :placeholder="isEditMode ? 'Leave blank to keep current password' : ''" class="block w-full border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm ring-1 ring-gray-900/5 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('users_page.role') }}</label>
                    <select v-model="form.roleName" class="block w-full border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm ring-1 ring-gray-900/5 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500">
                      <option value="User">User</option>
                      <option value="Manager">Manager</option>
                      <option value="Cashier">Cashier</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div v-if="isEditMode" class="flex items-center mt-4">
                    <input id="isActive" v-model="form.isActive" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                    <label for="isActive" class="ms-2 block text-sm text-gray-900 dark:text-white">
                      {{ $t('users_page.active') }}
                    </label>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 dark:bg-gray-900 px-4 py-4 sm:flex sm:flex-row-reverse border-t border-gray-100 dark:border-gray-700">
                <button type="submit" class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 shrink-0 whitespace-nowrap bg-indigo-600 text-white font-bold hover:bg-indigo-700 sm:ms-3 sm:w-auto text-sm">{{ $t('users_page.save') }}</button>
                <button type="button" @click="showModal = false" class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 shrink-0 whitespace-nowrap bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:bg-gray-900 sm:mt-0 sm:ms-3 sm:w-auto text-sm">{{ $t('users_page.cancel') }}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Users' })

definePageMeta({ layout: 'app-layout', middleware: ['auth'] })

const { $api } = useNuxtApp()
const users = ref([])
const showModal = ref(false)
const isEditMode = ref(false)
const editUserId = ref(null)
const form = ref({ name: '', email: '', password: '', roleName: 'User', isActive: true })

const fetchUsers = async () => {
  try {
    users.value = await $api('/users')
  } catch (err) {
    console.error(err)
  }
}

const openAddModal = () => {
  isEditMode.value = false
  editUserId.value = null
  form.value = { name: '', email: '', password: '', roleName: 'User', isActive: true }
  showModal.value = true
}

const openEditModal = (user) => {
  isEditMode.value = true
  editUserId.value = user._id
  form.value = {
    name: user.name,
    email: user.email,
    password: '',
    roleName: user.role?.name || 'User',
    isActive: user.isActive !== false
  }
  showModal.value = true
}

const addUser = async () => {
  try {
    if (isEditMode.value) {
      await $api(`/users/${editUserId.value}`, { method: 'PUT', body: form.value })
    } else {
      await $api('/users', { method: 'POST', body: form.value })
    }
    showModal.value = false
    isEditMode.value = false
    form.value = { name: '', email: '', password: '', roleName: 'User', isActive: true }
    fetchUsers()
  } catch (err) {
    alert(err.data?.message || 'Error saving user')
  }
}

onMounted(() => fetchUsers())
</script>
