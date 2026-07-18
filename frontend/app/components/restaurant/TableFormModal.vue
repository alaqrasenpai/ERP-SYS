<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
      <!-- Header -->
      <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 class="text-xl font-black text-gray-900">{{ isEditing ? $t('restaurant.edit_table') : $t('restaurant.add_table') }}</h3>
        <button @click="close" class="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-full">
          <svg class="w-6 h-6 block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="submit" class="p-6 space-y-5">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">{{ $t('restaurant.table_number') }}</label>
          <input v-model="form.tableNumber" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all placeholder-gray-400 font-medium" />
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">{{ $t('restaurant.capacity') }}</label>
          <input type="number" v-model="form.capacity" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all placeholder-gray-400 font-medium" />
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">{{ $t('restaurant.section') }}</label>
          <select v-model="form.section" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all font-medium">
            <option disabled value="">{{ $t('restaurant.select_section') }}</option>
            <option v-for="sec in sections" :key="sec._id" :value="sec.name">{{ sec.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">{{ $t('restaurant.status') }}</label>
          <select v-model="form.status" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all font-medium">
            <option value="Available">{{ $t('restaurant.available') }}</option>
            <option value="Occupied">{{ $t('restaurant.occupied') }}</option>
            <option value="Reserved">{{ $t('restaurant.reserved') }}</option>
          </select>
        </div>

        <!-- Footer -->
        <div class="pt-4 flex justify-end space-x-3 rtl:space-x-reverse">
          <button type="button" @click="close" class="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition">
            {{ $t('restaurant.cancel') }}
          </button>
          <button type="submit" :disabled="loading" class="px-5 py-2.5 rounded-xl font-bold text-white bg-gray-900 hover:bg-gray-800 transition disabled:opacity-50 flex items-center">
            <svg v-if="!loading && !isEditing" class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <svg v-if="!loading && isEditing" class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <svg v-if="loading" class="w-5 h-5 me-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            {{ loading ? $t('restaurant.saving') : $t('restaurant.save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  editingTable: Object
})

const emit = defineEmits(['close', 'saved'])
const { $api } = useNuxtApp()

const loading = ref(false)
const isEditing = ref(false)
const sections = ref([])

const form = ref({
  tableNumber: '',
  capacity: 4,
  section: '',
  status: 'Available'
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    fetchSections()
    if (props.editingTable) {
      isEditing.value = true
      form.value = { ...props.editingTable }
    } else {
      isEditing.value = false
      form.value = { tableNumber: '', capacity: 4, section: sections.value.length ? sections.value[0].name : '', status: 'Available' }
    }
  }
})

const fetchSections = async () => {
  try {
    const data = await $api('/restaurant/sections')
    sections.value = data
  } catch (error) {
    console.error('Error fetching sections:', error)
  }
}

const close = () => {
  emit('close')
}

const submit = async () => {
  loading.value = true
  try {
    if (isEditing.value) {
      await $api(`/restaurant/tables/${form.value._id}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      await $api('/restaurant/tables', {
        method: 'POST',
        body: form.value
      })
    }
    emit('saved')
    close()
  } catch (error) {
    console.error('Error saving table:', error)
    alert('Error saving table')
  } finally {
    loading.value = false
  }
}
</script>
