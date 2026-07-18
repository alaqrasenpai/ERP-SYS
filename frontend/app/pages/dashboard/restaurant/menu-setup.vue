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
          <button @click="openModal()" class="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 transition font-bold flex items-center gap-2">
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
              <button @click.stop="editDish(item)" class="bg-white text-indigo-600 hover:text-indigo-800 p-1.5 rounded-full shadow-sm flex items-center justify-center">
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
              <span class="font-black text-lg text-indigo-600">{{ item.price }}</span>
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
    </div>

    <!-- Add Dish Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 print:hidden">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-900">{{ $t('restaurant.add_dish') }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="p-6">
          <form @submit.prevent="saveDish" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('restaurant.dish_name_ar') }}</label>
                <input v-model="dishForm.nameAr" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500" dir="rtl">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('restaurant.dish_name_en') }}</label>
                <input v-model="dishForm.nameEn" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('restaurant.price') }}</label>
                <input v-model="dishForm.price" type="number" min="0" step="0.01" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('restaurant.category_en') }}</label>
                <select v-model="dishForm.categoryEn" @change="syncCategory" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="" disabled>{{ $t('restaurant.category_en') }}</option>
                  <option v-for="cat in categories" :key="cat._id" :value="cat.nameEn">{{ cat.nameEn }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('restaurant.category_ar') }}</label>
                <input v-model="dishForm.categoryAr" type="text" readonly required class="w-full px-3 py-2 border border-gray-300 rounded-xl bg-gray-50 text-gray-500" dir="rtl">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('restaurant.dish_desc_ar') }}</label>
                <textarea v-model="dishForm.descriptionAr" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500" dir="rtl"></textarea>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('restaurant.dish_desc_en') }}</label>
                <textarea v-model="dishForm.descriptionEn" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"></textarea>
              </div>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">صورة الوجبة / Image</label>
              <div class="flex items-center gap-3">
                <img v-if="dishForm.imageUrl" :src="dishForm.imageUrl" class="w-12 h-12 rounded-lg object-cover border border-gray-200">
                <input type="file" accept="image/*" @change="handleImageUpload" class="w-full text-sm border border-gray-200 rounded-lg px-2 py-1">
              </div>
            </div>
            <div class="flex items-center gap-2 mt-2">
              <input type="checkbox" v-model="dishForm.isAvailable" id="isAvailable" class="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4">
              <label for="isAvailable" class="text-sm font-bold text-gray-700">{{ $t('restaurant.available') }}</label>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t mt-6">
              <button type="button" @click="showModal = false" class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50">{{ $t('restaurant.cancel') }}</button>
              <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700" :disabled="saving">
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
  dishForm.value = { nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', categoryAr: '', categoryEn: '', price: 0, isAvailable: true }
  showModal.value = true
}

const syncCategory = () => {
  const selectedCat = categories.value.find(c => c.nameEn === dishForm.value.categoryEn)
  if (selectedCat) {
    dishForm.value.categoryAr = selectedCat.nameAr
  }
}

const handleImageUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    dishForm.value.imageUrl = event.target.result
  }
  reader.readAsDataURL(file)
}

const editDish = (item) => {
  dishForm.value = { ...item }
  showModal.value = true
}

const saveDish = async () => {
  saving.value = true
  try {
    if (dishForm.value._id) {
      await $api(`/restaurant/menu/${dishForm.value._id}`, {
        method: 'PUT',
        body: dishForm.value
      })
    } else {
      await $api('/restaurant/menu', {
        method: 'POST',
        body: dishForm.value
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
