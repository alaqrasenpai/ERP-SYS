<template>
  <div class="h-[100dvh] w-full overflow-hidden bg-gray-100 dark:bg-gray-950 flex flex-col font-sans select-none">
    
    <!-- POS Minimal Header -->
    <header class="bg-gray-900 text-white h-14 flex items-center justify-between px-4 z-50 shadow-md shrink-0">
      <div class="flex items-center gap-4">
        <!-- Hub Return Button -->
        <NuxtLink to="/hub" class="p-2 -ms-2 hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center text-gray-300 hover:text-white" title="Back to Hub">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
        </NuxtLink>
        <h1 class="text-lg font-black tracking-wider uppercase">{{ $t('pos.terminal') }}</h1>
      </div>
      
      <!-- POS Header Actions -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
          <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span class="text-xs font-mono font-bold text-gray-300">{{ user?.name || 'Cashier' }}</span>
        </div>
      </div>
    </header>

    <!-- Main POS Interface Area -->
    <main class="flex-1 w-full flex overflow-hidden">
      <slot />
    </main>

  </div>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth'

const { user } = useAuth()
</script>

<style>
/* Disable zooming on POS for touch devices */
html, body {
  touch-action: pan-x pan-y;
  overscroll-behavior: none;
}
</style>
