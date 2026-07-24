<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans" :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
    <!-- Navbar -->
    <nav class="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20 items-center">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            </div>
            <span class="text-2xl font-black text-gray-900 tracking-tight">ERP<span class="text-indigo-600">SYS</span></span>
          </div>
          <div class="hidden md:flex space-x-8 rtl:space-x-reverse">
            <a href="#features" class="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors">{{ $t('landing.features_link') }}</a>
            <a href="#modules" class="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors">{{ $t('landing.modules_link') }}</a>
            <a href="#contact" class="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors">{{ $t('landing.contact_link') }}</a>
          </div>
          <div class="flex items-center gap-4">
            <button @click="setLocale($i18n.locale === 'en' ? 'ar' : 'en')" class="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors border border-gray-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
              {{ $i18n.locale === 'en' ? 'العربية' : 'English' }}
            </button>
            <button @click="promptStoreLogin" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5">
              {{ $t('landing.client_login') }}
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="relative overflow-hidden bg-white">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%234f46e5\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-20 pb-24 lg:pt-32 lg:pb-40">
        <div class="text-center max-w-4xl mx-auto">
          <h1 class="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-tight mb-8">
            {{ $t('landing.title') }} <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{{ $t('landing.title_highlight') }}</span> {{ $t('landing.title_suffix') }}
          </h1>
          <p class="text-lg md:text-xl text-gray-500 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
            {{ $t('landing.subtitle') }}
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <button @click="promptStoreLogin" class="px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold text-lg shadow-xl shadow-gray-200 transition-all flex items-center justify-center group">
              {{ $t('landing.access_workspace') }}
              <svg class="w-5 h-5 ms-2 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Feature Highlights -->
    <div id="features" class="py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-black text-gray-900 tracking-tight">{{ $t('landing.features_title') }}</h2>
          <p class="text-gray-500 mt-4 font-medium">{{ $t('landing.features_subtitle') }}</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">{{ $t('landing.feat1_title') }}</h3>
            <p class="text-gray-500 leading-relaxed text-sm">{{ $t('landing.feat1_desc') }}</p>
          </div>
          
          <!-- Feature 2 -->
          <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">{{ $t('landing.feat2_title') }}</h3>
            <p class="text-gray-500 leading-relaxed text-sm">{{ $t('landing.feat2_desc') }}</p>
          </div>

          <!-- Feature 3 -->
          <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">{{ $t('landing.feat3_title') }}</h3>
            <p class="text-gray-500 leading-relaxed text-sm">{{ $t('landing.feat3_desc') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-100 py-8 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-start">
        <p class="text-gray-400 font-medium text-sm">{{ $t('landing.copyright').replace('{year}', new Date().getFullYear()) }}</p>
        <p class="text-sm font-medium text-gray-400">
          {{ $t('landing.developed_by') }} <a href="https://alaqra.dev" target="_blank" class="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">alaqra.dev</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useHead } from '#app'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t, locale, setLocale } = useI18n()
const router = useRouter()

useHead({
  title: 'ERPSYS - The Ultimate Enterprise Management System'
})

const promptStoreLogin = () => {
  const storeId = prompt(t('landing.prompt_msg'))
  if (storeId && storeId.trim()) {
    router.push(`/${storeId.trim().toLowerCase()}/login`)
  }
}
</script>
