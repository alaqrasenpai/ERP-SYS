<template>
  <div class="min-h-[100dvh] bg-gray-50 flex">
    
    <!-- Mobile Sidebar Overlay -->
    <div v-if="mobileMenuOpen" class="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" @click="mobileMenuOpen = false"></div>

    <!-- Sidebar (Desktop Fixed, Mobile Absolute) -->
    <aside :class="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'" class="fixed inset-y-0 start-0 z-50 w-64 bg-indigo-900 text-white transition-transform duration-300 lg:static lg:translate-x-0 flex flex-col h-[100dvh] shadow-2xl lg:shadow-none">
      
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-indigo-800 bg-indigo-950/50 flex-shrink-0">
        <NuxtLink to="/" class="flex items-center hover:opacity-80 transition-opacity">
          <div class="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center me-3 shadow-sm">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <h1 class="text-xl font-black tracking-tight">ERP <span class="font-normal opacity-70 ms-1 text-sm">v1.0</span></h1>
        </NuxtLink>
        <!-- Mobile close button -->
        <button @click="mobileMenuOpen = false" class="ms-auto lg:hidden p-2 text-indigo-300 hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-thin">
        <template v-for="group in navGroups" :key="group.name">
          
          <div v-if="group.visible && group.children" class="mb-6">
             <div class="px-2 mb-2 text-xs font-bold text-indigo-300/70 uppercase tracking-wider">{{ $t(group.name) }}</div>
             <div class="space-y-1">
                <template v-for="child in group.children" :key="child.path">
                  <NuxtLink v-if="child.visible" :to="child.path" class="block px-3 py-2 rounded-xl text-sm font-bold transition-all" active-class="bg-indigo-800 text-white shadow-sm" :class="$route.path === child.path ? 'bg-indigo-800 text-white shadow-sm' : 'text-indigo-100 hover:bg-indigo-800 hover:text-white hover:translate-x-1 rtl:hover:-translate-x-1'">
                    {{ $t(child.name) }}
                  </NuxtLink>
                </template>
             </div>
          </div>

          <div v-else-if="group.visible && !group.children" class="mb-6">
            <NuxtLink :to="group.path" class="block px-3 py-2 rounded-xl text-sm font-bold transition-all" active-class="bg-indigo-800 text-white shadow-sm" :class="$route.path === group.path ? 'bg-indigo-800 text-white shadow-sm' : 'text-indigo-100 hover:bg-indigo-800 hover:text-white hover:translate-x-1 rtl:hover:-translate-x-1'">
              {{ $t(group.name) }}
            </NuxtLink>
          </div>
        </template>
      </div>

      <!-- User Profile (Bottom) -->
      <div class="p-4 border-t border-indigo-800 bg-indigo-950/30 flex-shrink-0">
        <div class="flex items-center justify-between">
           <div class="flex flex-col truncate pe-2">
             <span class="text-sm font-bold leading-none truncate">{{ user?.name || 'User' }}</span>
             <span class="text-xs text-indigo-300 mt-1 truncate">{{ user?.role?.name || user?.role || 'Staff' }}</span>
             <span class="text-[10px] text-indigo-400 mt-1 font-mono uppercase truncate">T: {{ tenantId }}</span>
           </div>
           <button @click="logout" class="p-2 text-indigo-200 hover:text-white hover:bg-rose-500 rounded-lg transition-colors" title="Logout">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
           </button>
         </div>
      </div>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden bg-gray-50">
      
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-30">
        <div class="flex items-center">
          <button @click="mobileMenuOpen = true" class="p-2 -ms-2 me-2 text-gray-600 hover:text-gray-900 focus:outline-none rounded-lg hover:bg-gray-100 transition-colors lg:hidden">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <div class="font-black text-gray-900 tracking-tight text-lg lg:hidden">ERP SYSTEM</div>
        </div>
        
        <div class="flex items-center space-x-4 space-x-reverse ms-auto rtl:space-x-reverse">
          <select v-if="allowedLanguages.length > 1" v-model="currentLanguage" @change="handleLanguageChange" class="text-sm font-bold border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-1.5 ps-3 pe-8">
            <option v-for="lang in allowedLanguages" :key="lang" :value="lang">
              {{ lang === 'ar' ? 'العربية' : 'English' }}
            </option>
          </select>
        </div>
      </header>

      <!-- Page Content (Scrollable) -->
      <main class="flex-1 overflow-y-auto">
        <div class="w-full h-full relative">
           <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '#imports'
import { usePermissions } from '../composables/usePermissions'
import { useLanguage } from '../composables/useLanguage'
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const { user, tenantId, enabledModules, logout } = useAuth()
const { hasPermission } = usePermissions()
const { allowedLanguages, setLanguage, currentLanguage } = useLanguage()

const mobileMenuOpen = ref(false)
const route = useRoute()

// Close mobile menu on route change automatically
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})

const handleLanguageChange = () => {
  setLanguage(currentLanguage.value)
  setTimeout(() => {
    window.location.reload()
  }, 100)
}

const navGroups = computed(() => {
  return [
    {
      name: 'general.dashboard',
      path: '/',
      visible: true
    },
    {
      name: 'nav.sales_crm',
      visible: hasPermission('pos:create') || hasPermission('pos:write'), 
      children: [
        { name: 'modules.pos', path: '/dashboard/pos', visible: enabledModules.value?.includes('pos') && (hasPermission('pos:create') || hasPermission('pos:write')) },
        { name: 'nav.customers', path: '/dashboard/customers', visible: hasPermission('pos:create') || hasPermission('pos:write') }
      ]
    },
    {
      name: 'modules.inventory',
      visible: enabledModules.value?.includes('inventory') && (hasPermission('inventory:read') || hasPermission('inventory:write')),
      children: [
        { name: 'nav.products_overview', path: '/dashboard/inventory', visible: true },
        { name: 'nav.stock_audit', path: '/dashboard/stock-movements', visible: true },
        { name: 'nav.suppliers', path: '/dashboard/suppliers', visible: true }
      ]
    },
    {
      name: 'modules.finance',
      visible: enabledModules.value?.includes('accounting') && (hasPermission('accounting:read') || hasPermission('accounting:write')), 
      children: [
        { name: 'nav.accounting_ledger', path: '/dashboard/accounting', visible: true },
        { name: 'modules.reports', path: '/dashboard/reports', visible: true }
      ]
    },
    {
      name: 'modules.hr',
      visible: enabledModules.value?.includes('hr') && (hasPermission('hr:read') || hasPermission('hr:write')),
      children: [
        { name: 'hr.attendance_monitor', path: '/dashboard/hr/attendance-monitor', visible: hasPermission('hr:write') || hasPermission('hr:read') },
        { name: 'hr.devices', path: '/dashboard/hr/devices', visible: hasPermission('hr:write') },
        { name: 'hr.structure', path: '/dashboard/hr/structure', visible: true },
        { name: 'hr.employees', path: '/dashboard/hr/employees', visible: true },
        { name: 'hr.shifts', path: '/dashboard/hr/shifts', visible: true },
        { name: 'hr.leaves', path: '/dashboard/hr/leaves', visible: true },
        { name: 'hr.payroll', path: '/dashboard/payroll', visible: true }
      ]
    },
    {
      name: 'ess.title',
      visible: hasPermission('ess:read') || hasPermission('*'),
      children: [
        { name: 'ess.my_profile', path: '/dashboard/my/profile', visible: true },
        { name: 'ess.my_attendance', path: '/dashboard/my/attendance', visible: true },
        { name: 'ess.my_leaves', path: '/dashboard/my/leaves', visible: true }
      ]
    },
    {
      name: 'modules.operations',
      visible: hasPermission('archive:read') || hasPermission('archive:write') || hasPermission('*'),
      children: [
        { name: 'modules.archive', path: '/dashboard/archive', visible: enabledModules.value?.includes('archive') && (hasPermission('archive:read') || hasPermission('archive:write')) },
        { name: 'general.settings', path: '/dashboard/settings', visible: hasPermission('*') }
      ]
    },
    {
      name: 'modules.team',
      visible: hasPermission('team:manage'),
      children: [
        { name: 'nav.staff_members', path: '/dashboard/team/users', visible: true },
        { name: 'nav.access_roles', path: '/dashboard/team/roles', visible: true }
      ]
    }
  ]
})
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}
</style>
