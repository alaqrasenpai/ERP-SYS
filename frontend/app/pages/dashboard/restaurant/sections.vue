<template>
  <div class="p-4 sm:p-8">
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black text-gray-900">{{ $t('restaurant.sections_management') }}</h2>
          <p class="text-sm text-gray-500">{{ $t('restaurant.sections_desc') }}</p>
        </div>
        <button @click="openAddModal" class="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-gray-800 transition flex items-center">
          <svg class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          {{ $t('restaurant.add_section') }}
        </button>
      </div>

      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div v-if="loading" class="p-8 text-center text-gray-400">Loading...</div>
        
        <table v-else class="w-full text-left text-sm whitespace-nowrap">
          <thead class="bg-gray-50/50 text-gray-500 font-bold">
            <tr>
              <th class="px-6 py-4">{{ $t('restaurant.section_name') }}</th>
              <th class="px-6 py-4">{{ $t('restaurant.section_description') }}</th>
              <th class="px-6 py-4 text-end">{{ $t('general.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="section in sections" :key="section._id" class="hover:bg-gray-50/50 transition">
              <td class="px-6 py-4 font-bold text-gray-900">{{ section.name }}</td>
              <td class="px-6 py-4 text-gray-500 truncate max-w-xs">{{ section.description || '--' }}</td>
              <td class="px-6 py-4 text-end">
                <button @click="openEditModal(section)" class="text-gray-400 hover:text-primary-600 transition p-2">
                  <svg class="w-5 h-5 block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button @click="deleteSection(section._id)" class="text-gray-400 hover:text-red-600 transition p-2">
                  <svg class="w-5 h-5 block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </td>
            </tr>
            <tr v-if="!sections.length">
              <td colspan="3" class="px-6 py-12 text-center text-gray-400">
                {{ $t('restaurant.no_sections') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <RestaurantSectionFormModal 
      :is-open="isModalOpen"
      :editing-section="editingSection"
      @close="isModalOpen = false"
      @saved="fetchSections"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'dashboard'
})

const { $api } = useNuxtApp()
const sections = ref([])
const loading = ref(true)

const isModalOpen = ref(false)
const editingSection = ref(null)

const fetchSections = async () => {
  loading.value = true
  try {
    const data = await $api('/restaurant/sections')
    sections.value = data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  editingSection.value = null
  isModalOpen.value = true
}

const openEditModal = (section) => {
  editingSection.value = section
  isModalOpen.value = true
}

const deleteSection = async (id) => {
  if (!confirm('Are you sure you want to delete this section?')) return
  try {
    await $api(`/restaurant/sections/${id}`, { method: 'DELETE' })
    fetchSections()
  } catch (error) {
    alert('Error deleting section')
  }
}

onMounted(() => {
  fetchSections()
})
</script>
