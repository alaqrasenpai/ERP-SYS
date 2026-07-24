<template>
  <div class="p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black text-gray-900">{{ $t('restaurant.menu_setup') }}</h2>
          <p class="text-sm text-gray-500">{{ $t('restaurant.description') }}</p>
        </div>
        <div class="flex items-center gap-3">
          <NuxtLink to="/dashboard/restaurant/categories" class="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition font-bold flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            {{ $t('restaurant.menu_categories') }}
          </NuxtLink>
          <button @click="openModal()" class="px-4 py-2 bg-primary-600 text-white rounded-xl shadow-sm hover:bg-primary-700 transition font-bold flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            {{ $t('restaurant.add_dish') }}
          </button>
        </div>
      </div>

      <!-- Menu Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div v-for="item in menu" :key="item._id" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
          <div class="h-40 bg-gray-50 relative group">
            <img v-if="item.imageUrl" :src="item.imageUrl" class="w-full h-full object-cover transition transform group-hover:scale-105" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
              <span class="icon-[heroicons--photo] w-12 h-12"></span>
            </div>
            <div class="absolute top-2 end-2 flex gap-1">
              <button @click.stop="editDish(item)" class="bg-white text-primary-600 hover:text-primary-800 p-1.5 rounded-full shadow-sm flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </button>
              <span class="text-xs px-2 py-1 font-bold rounded-full shadow-sm" :class="item.isAvailable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'">
                {{ item.isAvailable ? $t('restaurant.available') : $t('restaurant.inactive') }}
              </span>
            </div>
          </div>
          <div class="p-4">
            <h3 class="font-bold text-gray-900 truncate">{{ locale === 'ar' ? item.nameAr : item.nameEn }}</h3>
            <p class="text-xs text-gray-500 mb-2 truncate">{{ locale === 'ar' ? item.categoryAr : item.categoryEn }}</p>
            <p class="text-[10px] text-gray-400 mb-3 line-clamp-2 h-7" :title="locale === 'ar' ? item.descriptionAr : item.descriptionEn">
              {{ locale === 'ar' ? item.descriptionAr : item.descriptionEn }}
            </p>
            <div class="flex justify-between items-center border-t border-gray-50 pt-3">
              <span class="font-black text-lg text-primary-600">{{ item.price }}</span>
              <div class="flex items-center text-xs text-gray-400 font-medium">
                <span class="icon-[heroicons--clock] w-4 h-4 me-1"></span>
                {{ item.preparationTimeMinutes }}m
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="!menu.length && !loading" class="col-span-full p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100 border-dashed">
          <span class="icon-[heroicons--squares-2x2] w-12 h-12 text-gray-300 mb-3 mx-auto block"></span>
          {{ $t('restaurant.no_menu') }}
        </div>
      </div>

      <!-- Dish Form Modal Component -->
      <RestaurantDishFormModal
        :show="showModal"
        :initial-data="dishForm"
        :categories="categories"
        :saving="saving"
        @close="showModal = false"
        @save="saveDish"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'

definePageMeta({
  layout: 'dashboard'
})

const { t, locale } = useI18n()
const { $api } = useNuxtApp()
const menu = ref([])
const categories = ref([])
const loading = ref(true)

const showModal = ref(false)
const saving = ref(false)
const dishForm = ref({
  nameAr: '',
  nameEn: '',
  descriptionAr: '',
  descriptionEn: '',
  categoryAr: '',
  categoryEn: '',
  price: 0,
  isAvailable: true
})

const fetchMenu = async () => {
  loading.value = true
  try {
    menu.value = await $api('/restaurant/menu')
    categories.value = await $api('/restaurant/categories')
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const openModal = () => {
  dishForm.value = {
    nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '',
    price: 0, categoryAr: '', categoryEn: '', imageUrl: '', isAvailable: true
  }
  showModal.value = true
}

const editDish = (item) => {
  dishForm.value = { ...item }
  showModal.value = true
}

const saveDish = async (formData) => {
  saving.value = true
  try {
    if (formData._id) {
      await $api(`/restaurant/menu/${formData._id}`, {
        method: 'PUT',
        body: formData
      })
    } else {
      await $api('/restaurant/menu', {
        method: 'POST',
        body: formData
      })
    }
    showModal.value = false
    fetchMenu()
  } catch (error) {
    alert(error.data?.message || 'Error saving dish')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchMenu()
})
</script>
