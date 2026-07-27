<template>
  <div class="min-h-[100dvh] bg-gray-50 dark:bg-gray-900 font-sans flex flex-col md:flex-row">
    
    <!-- Mobile Header (Hidden on Desktop) -->
    <header class="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 z-40 sticky top-0">
      <div class="flex items-center gap-2">
        <button @click="mobileMenuOpen = true" class="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        <span class="font-bold text-gray-900 dark:text-white">{{ appTitle }}</span>
      </div>
      <div class="flex items-center gap-3">
        <button @click="setLocale($i18n.locale === 'en' ? 'ar' : 'en')" class="text-sm font-bold text-gray-600 dark:text-gray-400">
          {{ $i18n.locale === 'en' ? 'عربي' : 'EN' }}
        </button>
        <NuxtLink to="/hub" class="p-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
        </NuxtLink>
      </div>
    </header>

    <!-- Mobile Overlay -->
    <div v-if="mobileMenuOpen" class="fixed inset-0 bg-gray-900/50 z-40 md:hidden backdrop-blur-sm" @click="mobileMenuOpen = false"></div>

    <!-- Slim Sidebar Navigation (App Specific) -->
    <aside :class="[
      mobileMenuOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full md:translate-x-0 md:rtl:translate-x-0',
      'w-64 md:w-20 lg:w-64 fixed inset-y-0 start-0 z-50 bg-white dark:bg-gray-800 border-e border-gray-200 dark:border-gray-700 transition-transform duration-300 md:static flex flex-col h-[100dvh]'
    ]">
      <!-- App Header & Hub Button -->
      <div class="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 justify-between md:justify-center lg:justify-between">
        <NuxtLink to="/hub" class="flex items-center gap-2 group" title="Back to Hub">
          <div class="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          </div>
          <span class="font-black text-gray-900 dark:text-white md:hidden lg:block">Hub</span>
        </NuxtLink>
        <button @click="mobileMenuOpen = false" class="md:hidden p-2 text-gray-400 hover:text-gray-900">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- App Specific Links -->
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div class="px-2 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider md:hidden lg:block">{{ appTitle }}</div>
        
        <NuxtLink v-for="link in appLinks" :key="link.path" :to="link.path" class="flex items-center py-2.5 rounded-xl text-sm font-bold transition-all group" :class="[
          $route.path.startsWith(link.path) && link.path !== appBase || $route.path === link.path 
            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white',
          'md:justify-center lg:justify-start px-3 md:px-0 lg:px-3'
        ]" :title="link.name">
          <svg class="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" :class="[
            $route.path.startsWith(link.path) && link.path !== appBase || $route.path === link.path ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500',
            'md:mx-auto lg:me-3 lg:mx-0'
          ]" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="link.icon"></svg>
          <span class="md:hidden lg:block whitespace-nowrap">{{ $t(link.name) }}</span>
        </NuxtLink>
      </nav>

      <!-- Profile -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center md:justify-center lg:justify-start gap-3">
        <div class="flex flex-col gap-2 md:hidden lg:flex w-full items-center">
          <button @click="setLocale($i18n.locale === 'en' ? 'ar' : 'en')" class="text-xs font-bold text-gray-500 hover:text-indigo-600 w-full text-center py-1">
            {{ $i18n.locale === 'en' ? 'عربي' : 'English' }}
          </button>
          <button @click="$colorMode.preference = $colorMode.value === 'dark' ? 'light' : 'dark'" class="text-xs text-gray-500 hover:text-indigo-600 w-full text-center py-1 flex justify-center">
            <svg v-if="$colorMode.value === 'dark'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
          </button>
        </div>
        
        <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold flex-shrink-0 mt-2 lg:mt-0">
          {{ user?.name?.charAt(0) || 'U' }}
        </div>
        <div class="flex-1 truncate md:hidden lg:block">
          <div class="text-xs font-bold text-gray-900 dark:text-white truncate">{{ user?.name }}</div>
          <div class="text-[10px] text-gray-500 truncate">{{ user?.role?.name || 'Staff' }}</div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div class="flex-1 overflow-y-auto">
        <slot />
      </div>
    </main>
    
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { navConfig } from '~/utils/navConfig'

const route = useRoute()
const { user } = useAuth()
const { setLocale } = useI18n()
const mobileMenuOpen = ref(false)

// Determine which app we are in based on route
const appBase = computed(() => {
  const parts = route.path.split('/')
  if (parts.length >= 3 && parts[1] === 'apps') {
    return `/apps/${parts[2]}`
  }
  return ''
})

const appTitle = computed(() => {
  const base = appBase.value
  if (base.includes('/hr')) return 'HR & Payroll'
  if (base.includes('/inventory')) return 'Inventory'
  if (base.includes('/finance')) return 'Finance'
  if (base.includes('/crm')) return 'CRM & Sales'
  if (base.includes('/settings')) return 'Settings'
  if (base.includes('/pos')) return 'Restaurant & POS'
  return 'App'
})

const appLinks = computed(() => {
  const base = appBase.value
  return navConfig.filter(link => link.path.startsWith(base))
})
</script>
