<template>
  <div class="h-full flex flex-col justify-center">
    <div class="mb-10 text-center">
      <h2 class="text-3xl font-black tracking-tight text-gray-900 dark:text-white">{{ $t('hub.welcome') }}</h2>
      <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm">{{ $t('hub.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
      
      <!-- App Card Component (Inline for simplicity) -->
      <NuxtLink v-for="app in availableApps" :key="app.id" :to="app.disabled ? '' : app.path" 
                class="relative flex flex-col items-center justify-center p-8 rounded-3xl border transition-all duration-300"
                :class="[
                  app.disabled 
                    ? 'bg-gray-100 dark:bg-gray-800/50 border-transparent cursor-not-allowed opacity-60 grayscale' 
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20 hover:-translate-y-1 cursor-pointer'
                ]">
        
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
             :class="app.disabled ? 'bg-gray-200 dark:bg-gray-700 text-gray-400' : `${app.color} text-white shadow-lg shadow-${app.color.split('-')[1]}-200 dark:shadow-none`">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="app.icon"></svg>
        </div>
        
        <h3 class="font-bold text-gray-900 dark:text-white text-center">{{ $t(app.name) }}</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 text-center mt-1 opacity-80">{{ $t(app.desc) }}</p>

        <!-- Lock overlay if disabled -->
        <div v-if="app.disabled" class="absolute top-4 end-4 text-gray-400 dark:text-gray-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>
      </NuxtLink>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { usePermissions } from '~/composables/usePermissions'

definePageMeta({
  layout: 'hub',
  middleware: ['auth']
})

const { enabledModules } = useAuth()
const { hasPermission } = usePermissions()

// App Definitions
const allApps = [
  {
    id: 'pos',
    name: 'apps.pos',
    desc: 'apps.pos_desc',
    path: '/apps/pos/retail-pos',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>',
    color: 'bg-emerald-500',
    moduleReq: 'pos',
    permReq: 'pos:read'
  },
  {
    id: 'restaurant',
    name: 'apps.restaurant',
    desc: 'apps.restaurant_desc',
    path: '/apps/restaurant',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>',
    color: 'bg-orange-500',
    moduleReq: 'restaurant',
    permReq: 'restaurant:use'
  },
  {
    id: 'hr',
    name: 'apps.hr',
    desc: 'apps.hr_desc',
    path: '/apps/hr',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>',
    color: 'bg-indigo-500',
    moduleReq: 'hr',
    permReq: 'hr:read'
  },
  {
    id: 'inventory',
    name: 'apps.inventory',
    desc: 'apps.inventory_desc',
    path: '/apps/inventory',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>',
    color: 'bg-amber-500',
    moduleReq: 'inventory',
    permReq: 'inventory:read'
  },
  {
    id: 'finance',
    name: 'apps.finance',
    desc: 'apps.finance_desc',
    path: '/apps/finance',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
    color: 'bg-blue-600',
    moduleReq: 'accounting',
    permReq: 'accounting:read'
  },
  {
    id: 'crm',
    name: 'apps.crm',
    desc: 'apps.crm_desc',
    path: '/apps/crm',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>',
    color: 'bg-rose-500',
    moduleReq: null,
    permReq: 'customers:read'
  },
  {
    id: 'ess',
    name: 'apps.ess',
    desc: 'apps.ess_desc',
    path: '/ess/profile',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>',
    color: 'bg-teal-500',
    moduleReq: 'ess',
    permReq: 'ess:read'
  },
  {
    id: 'settings',
    name: 'apps.settings',
    desc: 'apps.settings_desc',
    path: '/apps/settings',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>',
    color: 'bg-gray-700',
    moduleReq: null,
    permReq: 'settings:manage' // or admin
  }
]

const availableApps = computed(() => {
  return allApps.map(app => {
    // Check Tenant Module Access
    let disabled = false
    if (app.moduleReq && (!enabledModules.value || !enabledModules.value.includes(app.moduleReq))) {
      disabled = true
    }
    // Check User Role Permission
    if (!hasPermission(app.permReq) && !hasPermission('*')) {
      disabled = true
    }
    return { ...app, disabled }
  })
})
</script>
