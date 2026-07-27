<template>
  <div class="min-h-[100dvh] bg-gray-50 dark:bg-gray-900 font-sans flex flex-col">
    <!-- Hub Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6 z-30 sticky top-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        </div>
        <h1 class="text-xl font-black text-gray-900 dark:text-white tracking-tight">Alaqra ERP <span class="font-normal opacity-70 text-sm">Hub</span></h1>
      </div>
      
      <div class="flex items-center gap-4">
        <!-- Theme Toggle & Language Toggle can go here later -->
        
        <!-- Profile / Logout -->
        <div class="flex items-center gap-3 border-s border-gray-200 dark:border-gray-700 ps-4">
          <div class="text-end hidden sm:block">
            <div class="text-sm font-bold text-gray-900 dark:text-white">{{ user?.name || 'User' }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ user?.role?.name || 'Staff' }}</div>
          </div>
          <button @click="handleLogout" class="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 bg-gray-50 hover:bg-rose-50 dark:bg-gray-700 dark:hover:bg-rose-900/30 rounded-xl transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 p-6 lg:p-10 w-full max-w-7xl mx-auto">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

const { user, tenantId, logout } = useAuth()
const router = useRouter()

const handleLogout = async () => {
  await logout()
  router.push('/login')
}
</script>
