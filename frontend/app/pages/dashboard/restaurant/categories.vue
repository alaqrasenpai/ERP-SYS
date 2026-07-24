<template>
  <div class="p-4 sm:p-8">
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black text-gray-900">{{ $t('restaurant.menu_categories') }}</h2>
          <p class="text-sm text-gray-500">{{ $t('restaurant.categories_description') }}</p>
        </div>
        <button @click="openModal()" class="px-4 py-2 bg-primary-600 text-white rounded-xl shadow-sm hover:bg-primary-700 transition font-bold flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          {{ $t('restaurant.add_category') }}
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase tracking-wider">{{ $t('restaurant.category_en') }}</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase tracking-wider">{{ $t('restaurant.category_ar') }}</th>
                <th scope="col" class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase tracking-wider">{{ $t('restaurant.status') }}</th>
                <th scope="col" class="px-6 py-4 text-end text-xs font-black text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="cat in categories" :key="cat._id" class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{{ cat.nameEn }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600" dir="rtl">{{ cat.nameAr }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-bold rounded-full" :class="cat.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ cat.isActive ? $t('restaurant.active') : $t('restaurant.inactive') }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                  <button @click="editCategory(cat)" class="text-primary-600 hover:text-primary-900 transition flex items-center justify-end w-full">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="!categories.length && !loading" class="p-8 text-center text-gray-500 text-sm">
            {{ $t('restaurant.no_recent_activity') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Category Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 print:hidden">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-900">{{ form._id ? $t('restaurant.add_category') : $t('restaurant.add_category') }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="p-6">
          <form @submit.prevent="saveCategory" class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('restaurant.category_ar') }}</label>
              <input v-model="form.nameAr" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500" dir="rtl">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('restaurant.category_en') }}</label>
              <input v-model="form.nameEn" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500">
            </div>
            <div class="flex items-center gap-2 mt-2">
              <input type="checkbox" v-model="form.isActive" id="isActive" class="rounded text-primary-600 focus:ring-primary-500 h-4 w-4">
              <label for="isActive" class="text-sm font-bold text-gray-700">{{ $t('restaurant.active') }}</label>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t mt-6">
              <button type="button" @click="showModal = false" class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50">{{ $t('restaurant.cancel') }}</button>
              <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700" :disabled="saving">
                {{ saving ? '...' : $t('restaurant.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

definePageMeta({
  layout: 'dashboard'
})

const { t, locale } = useI18n()
const { $api } = useNuxtApp()
const categories = ref([])
const loading = ref(true)

const showModal = ref(false)
const saving = ref(false)
const form = ref({
  nameAr: '',
  nameEn: '',
  isActive: true
})

const fetchCategories = async () => {
  loading.value = true
  try {
    const data = await $api('/restaurant/categories')
    categories.value = data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const openModal = () => {
  form.value = { nameAr: '', nameEn: '', isActive: true }
  showModal.value = true
}

const editCategory = (cat) => {
  form.value = { ...cat }
  showModal.value = true
}

const saveCategory = async () => {
  saving.value = true
  try {
    if (form.value._id) {
      await $api(`/restaurant/categories/${form.value._id}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      await $api('/restaurant/categories', {
        method: 'POST',
        body: form.value
      })
    }
    showModal.value = false
    fetchCategories()
  } catch (error) {
    alert(error.data?.message || 'Error saving category')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchCategories()
})
</script>
