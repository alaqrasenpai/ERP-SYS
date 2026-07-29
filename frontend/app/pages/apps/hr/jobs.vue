<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-700 p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{{ $t('jobs.title', 'Job Titles') }}</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ $t('jobs.description', 'Manage employee job positions and titles') }}</p>
        </div>
        <button @click="openAddModal" class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center">
          <svg class="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          {{ $t('jobs.add_job', 'Add Job Title') }}
        </button>
      </div>

      <!-- Jobs Table -->
      <div class="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('jobs.name', 'Job Title') }}</th>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('jobs.status', 'Status') }}</th>
                <th class="px-6 py-4 text-end text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('jobs.actions', 'Actions') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
              <tr v-for="job in jobs" :key="job._id" class="hover:bg-gray-50 dark:bg-gray-900 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900 dark:text-white">{{ job.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400" v-if="job.description">{{ job.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-if="job.isActive !== false" class="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{{ $t('jobs.active', 'Active') }}</span>
                  <span v-else class="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">{{ $t('jobs.inactive', 'Inactive') }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                  <button @click="openEditModal(job)" class="text-indigo-600 hover:text-indigo-900 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">{{ $t('jobs.edit', 'Edit') }}</button>
                  <button @click="deleteJob(job._id)" class="text-red-600 hover:text-red-900 ms-3 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">{{ $t('jobs.delete', 'Delete') }}</button>
                </td>
              </tr>
              <tr v-if="jobs.length === 0">
                <td colspan="3" class="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">{{ $t('jobs.no_data', 'No job titles found') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-2xl text-start overflow-hidden shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ isEditing ? $t('jobs.edit_job', 'Edit Job Title') : $t('jobs.new_job', 'New Job Title') }}</h3>
            <button @click="showModal = false" class="text-gray-400 hover:text-gray-500"><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <form @submit.prevent="saveJob">
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('jobs.name', 'Job Title') }}</label>
                <input v-model="form.name" type="text" required class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('jobs.desc_label', 'Description') }}</label>
                <textarea v-model="form.description" rows="3" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
              </div>
              <div class="flex items-center">
                <input type="checkbox" v-model="form.isActive" id="isActive" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                <label for="isActive" class="ms-2 block text-sm text-gray-900 dark:text-gray-300 font-bold">
                  {{ $t('jobs.active_status', 'Active') }}
                </label>
              </div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex flex-row-reverse border-t border-gray-100 dark:border-gray-700 gap-3">
              <button type="submit" class="inline-flex justify-center rounded-lg px-6 py-2 bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 shadow-sm ms-3">
                {{ $t('jobs.save', 'Save') }}
              </button>
              <button type="button" @click="showModal = false" class="inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2 bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50">
                {{ $t('jobs.cancel', 'Cancel') }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Job Titles' })
import { ref, onMounted } from 'vue'

definePageMeta({ 
  layout: 'app-layout',
  middleware: ['auth', 'module-guard'],
  requiredModule: 'hr'
})

const { $api } = useNuxtApp()
const jobs = ref([])

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  name: '',
  description: '',
  isActive: true
})

const fetchData = async () => {
  try {
    jobs.value = await $api('/hr/job-titles')
  } catch (error) {
    console.error('Failed to fetch job titles', error)
  }
}

const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = { name: '', description: '', isActive: true }
  showModal.value = true
}

const openEditModal = (job) => {
  isEditing.value = true
  editingId.value = job._id
  form.value = { 
    name: job.name, 
    description: job.description || '', 
    isActive: job.isActive !== false 
  }
  showModal.value = true
}

const saveJob = async () => {
  try {
    if (isEditing.value) {
      await $api(`/hr/job-titles/${editingId.value}`, { method: 'PUT', body: form.value })
    } else {
      await $api('/hr/job-titles', { method: 'POST', body: form.value })
    }
    showModal.value = false
    fetchData()
  } catch (error) {
    alert(error.data?.message || 'Failed to save job title')
  }
}

const deleteJob = async (id) => {
  if (!confirm('Are you sure you want to delete this job title?')) return
  try {
    await $api(`/hr/job-titles/${id}`, { method: 'DELETE' })
    fetchData()
  } catch (error) {
    alert(error.data?.message || 'Failed to delete job title')
  }
}

onMounted(() => {
  fetchData()
})
</script>
