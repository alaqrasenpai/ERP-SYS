<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
      <!-- Header -->
      <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 class="text-xl font-black text-gray-900">{{ isEditing ? $t('restaurant.edit_section') : $t('restaurant.add_section') }}</h3>
        <button @click="close" class="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-full">
          <svg class="w-6 h-6 block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="submit" class="p-6 space-y-5">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">{{ $t('restaurant.section_name') }}</label>
          <input v-model="form.name" required placeholder="e.g. Terrace, Family Room..." class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all placeholder-gray-400 font-medium" />
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">{{ $t('restaurant.section_description') }}</label>
          <textarea v-model="form.description" rows="3" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all placeholder-gray-400 font-medium"></textarea>
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
  editingSection: Object
})

const emit = defineEmits(['close', 'saved'])
const { $api } = useNuxtApp()

const loading = ref(false)
const isEditing = ref(false)

const form = ref({
  name: '',
  description: ''
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.editingSection) {
      isEditing.value = true
      form.value = { ...props.editingSection }
    } else {
      isEditing.value = false
      form.value = { name: '', description: '' }
    }
  }
})

const close = () => {
  emit('close')
}

const submit = async () => {
  loading.value = true
  try {
    if (isEditing.value) {
      await $api(`/restaurant/sections/${form.value._id}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      await $api('/restaurant/sections', {
        method: 'POST',
        body: form.value
      })
    }
    emit('saved')
    close()
  } catch (error) {
    console.error('Error saving section:', error)
    alert('Error saving section')
  } finally {
    loading.value = false
  }
}
</script>
