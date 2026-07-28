<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{{ $t('allowances.title') }}</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ $t('allowances.description') }}</p>
      </div>
      <button @click="openAddModal" class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center">
        <svg class="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        {{ $t('allowances.add') }}
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('allowances.name') }}</th>
              <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('allowances.desc') }}</th>
              <th class="px-6 py-4 text-end text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-if="allowances.length === 0">
              <td colspan="3" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                No allowance types found.
              </td>
            </tr>
            <tr v-for="type in allowances" :key="type._id" class="hover:bg-gray-50 dark:bg-gray-900 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-bold text-gray-900 dark:text-white">{{ type.name }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{{ type.description || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                <button @click="openEditModal(type)" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 me-3 font-bold">{{ $t('allowances.edit') }}</button>
                <button @click="deleteAllowance(type._id)" class="text-rose-600 dark:text-rose-400 hover:text-rose-900 font-bold">{{ $t('allowances.delete') }}</button>
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
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-start overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100 dark:border-gray-700">
          <form @submit.prevent="saveAllowance">
            <div class="bg-white dark:bg-gray-800 px-6 py-6">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {{ isEditing ? $t('allowances.edit') : $t('allowances.add') }}
              </h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('allowances.name') }}</label>
                  <input v-model="form.name" type="text" required class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('allowances.desc') }}</label>
                  <textarea v-model="form.description" rows="3" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                </div>
              </div>

            </div>
            <div class="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex flex-row-reverse border-t border-gray-100 dark:border-gray-700">
              <button type="submit" class="inline-flex justify-center rounded-lg px-6 py-2.5 bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 shadow-sm ms-3">
                {{ $t('allowances.save') }}
              </button>
              <button type="button" @click="showModal = false" class="inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2.5 bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900 shadow-sm">
                {{ $t('allowances.cancel') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
useHead({ title: 'Allowances Settings' })

import { ref, onMounted } from 'vue'

definePageMeta({ 
  layout: 'app-layout',
  middleware: ['auth', 'module-guard'],
  requiredModule: 'hr'
})

const { $api } = useNuxtApp()
const allowances = ref([])

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  name: '',
  description: ''
})

const fetchData = async () => {
  try {
    allowances.value = await $api('/hr/allowances')
  } catch (error) {
    console.error('Failed to fetch allowances', error)
  }
}

const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = { name: '', description: '' }
  showModal.value = true
}

const openEditModal = (type) => {
  isEditing.value = true
  editingId.value = type._id
  form.value = { name: type.name, description: type.description || '' }
  showModal.value = true
}

const saveAllowance = async () => {
  try {
    if (isEditing.value) {
      await $api(`/hr/allowances/${editingId.value}`, { method: 'PUT', body: form.value })
    } else {
      await $api('/hr/allowances', { method: 'POST', body: form.value })
    }
    showModal.value = false
    fetchData()
  } catch (error) {
    console.error('Failed to save allowance', error)
    alert(error.data?.message || 'Error saving allowance')
  }
}

const deleteAllowance = async (id) => {
  if (!confirm('Are you sure you want to delete this allowance type?')) return
  try {
    await $api(`/hr/allowances/${id}`, { method: 'DELETE' })
    fetchData()
  } catch (error) {
    console.error('Failed to delete', error)
    alert('Failed to delete allowance')
  }
}

onMounted(() => {
  fetchData()
})
</script>
