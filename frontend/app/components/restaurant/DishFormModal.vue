<template>
  <div v-if="show" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 print:hidden">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 class="text-lg font-bold text-gray-900">{{ form._id ? $t('restaurant.add_dish') : $t('restaurant.add_dish') }}</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <div class="p-6">
        <form @submit.prevent="saveDish" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('restaurant.dish_name_ar') }}</label>
              <input v-model="form.nameAr" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500" dir="rtl">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('restaurant.dish_name_en') }}</label>
              <input v-model="form.nameEn" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('restaurant.price') }}</label>
              <input v-model="form.price" type="number" min="0" step="0.01" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('restaurant.category_en') }}</label>
              <select v-if="categories && categories.length > 0" v-model="form.categoryEn" @change="syncCategory" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
                <option value="" disabled>{{ $t('restaurant.category_en') }}</option>
                <option v-for="cat in categories" :key="cat._id" :value="cat.nameEn">{{ cat.nameEn }}</option>
              </select>
              <div v-else class="w-full px-3 py-2 border border-red-300 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center">
                <svg class="w-4 h-4 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                يرجى إنشاء (فئات) للمنيو أولاً
              </div>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('restaurant.category_ar') }}</label>
              <input v-model="form.categoryAr" type="text" readonly required class="w-full px-3 py-2 border border-gray-300 rounded-xl bg-gray-50 text-gray-500" dir="rtl">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('restaurant.dish_desc_ar') }}</label>
              <textarea v-model="form.descriptionAr" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500" dir="rtl"></textarea>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('restaurant.dish_desc_en') }}</label>
              <textarea v-model="form.descriptionEn" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">صورة الوجبة / Image</label>
            <div class="flex items-center gap-3">
              <img v-if="form.imageUrl" :src="form.imageUrl" class="w-12 h-12 rounded-lg object-cover border border-gray-200">
              <input type="file" accept="image/*" @change="handleImageUpload" class="w-full text-sm border border-gray-200 rounded-lg px-2 py-1">
            </div>
          </div>
          <div class="flex items-center gap-2 mt-2">
            <input type="checkbox" v-model="form.isAvailable" id="isAvailable" class="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4">
            <label for="isAvailable" class="text-sm font-bold text-gray-700">{{ $t('restaurant.available') }}</label>
          </div>
          <div class="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50">{{ $t('restaurant.cancel') }}</button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700" :disabled="saving">
              {{ saving ? '...' : $t('restaurant.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  initialData: Object,
  categories: Array,
  saving: Boolean
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  nameAr: '',
  nameEn: '',
  descriptionAr: '',
  descriptionEn: '',
  price: 0,
  categoryAr: '',
  categoryEn: '',
  imageUrl: '',
  isAvailable: true
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.initialData && props.initialData._id) {
      form.value = { ...props.initialData }
    } else {
      form.value = {
        nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '',
        price: 0, categoryAr: '', categoryEn: '', imageUrl: '', isAvailable: true
      }
    }
  }
})

const syncCategory = () => {
  const selectedCat = props.categories.find(c => c.nameEn === form.value.categoryEn)
  if (selectedCat) {
    form.value.categoryAr = selectedCat.nameAr
  }
}

const handleImageUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.imageUrl = e.target.result
  }
  reader.readAsDataURL(file)
}

const saveDish = () => {
  emit('save', form.value)
}
</script>
