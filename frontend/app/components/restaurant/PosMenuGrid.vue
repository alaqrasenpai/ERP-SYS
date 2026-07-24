<template>
  <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 pb-10">
    <div v-for="item in menu" :key="item._id" @click="$emit('add-to-cart', item)"
            class="bg-white rounded-2xl border border-gray-200 p-4 cursor-pointer hover:border-emerald-300 hover:shadow-lg transition-all text-start flex flex-col group relative h-[200px]"
            :class="{ 'opacity-50 pointer-events-none grayscale': item.isAvailable === false }">
      
      <div class="h-20 w-20 mx-auto rounded-full bg-gray-50 overflow-hidden border-2 border-white shadow-sm mb-3 shrink-0 relative">
        <img v-if="item.imageUrl" :src="item.imageUrl" class="w-full h-full object-cover transition transform group-hover:scale-110" />
        <div v-else class="w-full h-full flex items-center justify-center text-emerald-500 bg-emerald-50">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
        </div>
      </div>
      
      <div class="text-center flex-1 flex flex-col justify-end">
        <h3 class="font-black text-gray-900 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">{{ locale === 'ar' ? item.nameAr : item.nameEn }}</h3>
        
        <div class="mt-auto pt-2">
          <span class="text-base font-black text-emerald-600 block">{{ item.price.toFixed(2) }} {{ useCookie('erp_currency').value || 'SAR' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()

defineProps({
  menu: Array
})

defineEmits(['add-to-cart'])
</script>
