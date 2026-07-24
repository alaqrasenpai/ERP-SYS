<template>
  <div class="flex space-x-2 rtl:space-x-reverse mb-6 overflow-x-auto pb-2 hide-scrollbar">
    <button @click="$emit('select', 'All')"
            class="whitespace-nowrap py-2.5 px-5 rounded-xl font-bold text-sm transition-all border"
            :class="selectedCategory === 'All' ? 'bg-secondary-500 text-white border-secondary-500 shadow-md shadow-secondary-500/20' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-secondary-600 hover:border-secondary-200'">
      {{ $t('restaurant.all_categories') }}
    </button>
    <button v-for="cat in categories" :key="cat._id"
            @click="$emit('select', cat.nameEn)"
            class="whitespace-nowrap py-2.5 px-5 rounded-xl font-bold text-sm transition-all border"
            :class="selectedCategory === cat.nameEn ? 'bg-secondary-500 text-white border-secondary-500 shadow-md shadow-secondary-500/20' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-secondary-600 hover:border-secondary-200'">
      {{ locale === 'ar' ? cat.nameAr : cat.nameEn }}
    </button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()

defineProps({
  categories: Array,
  selectedCategory: String
})
defineEmits(['select'])
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
