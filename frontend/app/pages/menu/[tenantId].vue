<template>
  <div class="min-h-screen bg-gray-50/50 font-sans pb-24 selection:bg-orange-500 selection:text-white" dir="auto">
    
    <!-- Hero Header -->
    <header class="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden shadow-xl">
      <!-- Decorative background blur -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
      </div>
      
      <div class="relative z-10 max-w-2xl mx-auto px-6 pt-16 pb-12 flex flex-col items-center justify-center text-center">
        <!-- Logo Placeholder -->
        <div class="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center mb-5 shadow-2xl transform hover:scale-105 transition-transform duration-300">
          <svg class="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        </div>
        
        <h1 class="text-3xl md:text-4xl font-black tracking-tight text-white mb-2 drop-shadow-md">
          {{ restaurantName || $t('restaurant.menu') }}
        </h1>
        <p class="text-gray-400 text-sm md:text-base font-medium max-w-sm">
          {{ $t('restaurant.explore_menu_desc', 'اكتشف أطباقنا المميزة والمختارة بعناية') }}
        </p>
      </div>
    </header>

    <!-- Sticky Category Tabs -->
    <div class="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm transition-all duration-300">
      <div class="max-w-2xl mx-auto">
        <div v-if="categories.length > 0" class="flex overflow-x-auto hide-scrollbar px-4 py-4 gap-3 items-center">
          <button 
            v-for="cat in categories" 
            :key="cat._id"
            @click="scrollToCategory(cat._id)"
            class="px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 transform active:scale-95"
            :class="activeCategory === cat._id 
              ? 'bg-gray-900 text-white shadow-md shadow-gray-900/20' 
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'"
          >
            {{ $i18n.locale === 'ar' ? cat.nameAr : cat.nameEn }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-2xl mx-auto px-4 pt-8 space-y-10">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-8">
        <div v-for="i in 3" :key="i" class="animate-pulse">
          <div class="h-8 bg-gray-200 rounded-lg w-1/3 mb-6"></div>
          <div class="grid gap-4">
            <div v-for="j in 2" :key="j" class="bg-white rounded-3xl p-4 flex gap-4 border border-gray-100">
              <div class="w-28 h-28 bg-gray-200 rounded-2xl"></div>
              <div class="flex-1 space-y-3 py-2">
                <div class="h-5 bg-gray-200 rounded w-3/4"></div>
                <div class="h-4 bg-gray-200 rounded w-full"></div>
                <div class="h-4 bg-gray-200 rounded w-5/6"></div>
                <div class="h-5 bg-gray-200 rounded w-1/4 mt-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!categories.length || !items.length" class="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
        <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ $t('restaurant.no_menu') }}</h3>
        <p class="text-gray-500 max-w-sm">{{ $t('restaurant.no_menu_desc', 'عذراً، لا توجد وجبات متاحة في قائمة الطعام في الوقت الحالي. يرجى التحقق لاحقاً.') }}</p>
      </div>

      <!-- Menu Sections -->
      <template v-else>
        <section v-for="cat in categories" :key="cat._id" :id="'category-' + cat._id" class="scroll-mt-36">
          <div class="flex items-center gap-4 mb-6">
            <h2 class="text-2xl font-black text-gray-900">{{ $i18n.locale === 'ar' ? cat.nameAr : cat.nameEn }}</h2>
            <div class="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="item in getItemsByCategory(cat)" 
              :key="item._id" 
              class="group bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl border border-gray-100/80 hover:border-orange-200 transition-all duration-300 flex gap-4 overflow-hidden relative cursor-pointer"
            >
              <!-- Image -->
              <div class="relative w-28 h-28 rounded-2xl bg-gray-50 flex-shrink-0 overflow-hidden shadow-inner">
                <img v-if="item.imageUrl" :src="item.imageUrl" alt="Dish image" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </div>
              
              <!-- Content -->
              <div class="flex-1 flex flex-col py-1 pr-1">
                <div class="flex justify-between items-start mb-1.5 gap-2">
                  <h3 class="font-bold text-gray-900 leading-tight group-hover:text-orange-600 transition-colors">{{ $i18n.locale === 'ar' ? item.nameAr : item.nameEn }}</h3>
                  <div class="bg-gray-900 text-white text-sm font-black px-2.5 py-1 rounded-lg whitespace-nowrap shadow-sm group-hover:bg-orange-500 transition-colors">
                    {{ item.price }} {{ useCookie('erp_currency').value || 'SAR' }}
                  </div>
                </div>
                
                <p v-if="item.descriptionAr || item.descriptionEn" class="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                  {{ $i18n.locale === 'ar' ? item.descriptionAr : item.descriptionEn }}
                </p>
                
                <!-- Badges -->
                <div class="mt-auto flex flex-wrap gap-1.5">
                  <span v-if="item.calories" class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100">
                    <svg class="w-3 h-3 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path></svg>
                    {{ item.calories }} Cal
                  </span>
                  <span v-if="item.preparationTimeMinutes" class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                    <svg class="w-3 h-3 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {{ item.preparationTimeMinutes }} {{ $t('restaurant.min', 'د') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>
    </main>

    <!-- Footer -->
    <footer class="mt-16 text-center px-4">
      <div class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white rounded-full border border-gray-200 shadow-sm text-sm text-gray-500 font-medium">
        <span>Powered by</span>
        <a href="https://alaqra.dev/" target="_blank" class="font-black text-gray-900 tracking-tight hover:text-orange-500 transition-colors">Alaqra ERP</a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

definePageMeta({
  layout: false // No dashboard layout
})

const route = useRoute()
const tenantId = route.params.tenantId

const loading = ref(true)
const restaurantName = ref('')
const categories = ref([])
const items = ref([])
const activeCategory = ref(null)

const fetchMenu = async () => {
  try {
    // Using direct fetch to public API passing tenant ID header
    const response = await $fetch(`http://localhost:5000/api/public/menu`, {
      headers: {
        'x-tenant-id': tenantId
      }
    })
    
    restaurantName.value = response.restaurantName
    
    // Auto-generate categories if none exist in DB but items exist
    if (response.categories.length === 0 && response.items.length > 0) {
      const catMap = new Map()
      response.items.forEach(item => {
        const catAr = item.categoryAr || 'عام'
        const catEn = item.categoryEn || 'General'
        if (!catMap.has(catAr)) {
          catMap.set(catAr, catEn)
        }
        item.categoryAr = catAr
        item.categoryEn = catEn
      })
      categories.value = Array.from(catMap.entries()).map(([ar, en], i) => ({
        _id: 'auto_' + i,
        nameAr: ar,
        nameEn: en
      }))
    } else {
      categories.value = response.categories
      // Also handle uncategorized items when there are DB categories
      const hasUncategorized = response.items.some(item => !item.categoryAr && !item.categoryEn)
      if (hasUncategorized) {
        categories.value.push({ _id: 'auto_general', nameAr: 'عام', nameEn: 'General' })
        response.items.forEach(item => {
          if (!item.categoryAr && !item.categoryEn) {
            item.categoryAr = 'عام'
            item.categoryEn = 'General'
          }
        })
      }
    }
    
    items.value = response.items

    if (categories.value.length > 0) {
      activeCategory.value = categories.value[0]._id
    }
  } catch (error) {
    console.error('Error fetching public menu:', error)
  } finally {
    loading.value = false
  }
}

const getItemsByCategory = (cat) => {
  return items.value.filter(item => {
    return item.categoryAr === cat.nameAr || item.categoryEn === cat.nameEn
  })
}

const scrollToCategory = (categoryId) => {
  activeCategory.value = categoryId
  const el = document.getElementById('category-' + categoryId)
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 130
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

// Simple scroll spy functionality
onMounted(() => {
  fetchMenu()

  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY + 150
    for (const cat of categories.value) {
      const el = document.getElementById('category-' + cat._id)
      if (el) {
        if (el.offsetTop <= scrollPosition && (el.offsetTop + el.offsetHeight) > scrollPosition) {
          activeCategory.value = cat._id
        }
      }
    }
  })
})
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
