<template>
  <div class="min-h-[100dvh] bg-gray-50 flex">
    
    <!-- Mobile Sidebar Overlay -->
    <div v-if="mobileMenuOpen" class="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" @click="mobileMenuOpen = false"></div>

    <!-- Sidebar (Desktop Fixed, Mobile Absolute) -->
    <aside :class="[
      mobileMenuOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full lg:translate-x-0 lg:rtl:translate-x-0',
      sidebarCollapsed ? 'lg:w-20' : 'lg:w-64',
      'w-64 fixed inset-y-0 start-0 z-50 bg-indigo-900 text-white transition-all duration-300 lg:static flex flex-col h-[100dvh] shadow-2xl lg:shadow-none'
    ]">
      
      <!-- Logo -->
      <div class="h-16 flex items-center px-4 border-b border-indigo-800 bg-indigo-950/50 flex-shrink-0" :class="sidebarCollapsed ? 'justify-center lg:px-0' : ''">
        <NuxtLink to="/dashboard" class="flex items-center hover:opacity-80 transition-opacity">
          <div class="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center shadow-sm" :class="sidebarCollapsed ? '' : 'me-3'">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <h1 v-if="!sidebarCollapsed" class="text-xl font-black tracking-tight whitespace-nowrap">Alaqra ERP <span class="font-normal opacity-70 ms-1 text-sm">v1.0</span></h1>
        </NuxtLink>
        <!-- Mobile close button -->
        <button @click="mobileMenuOpen = false" class="ms-auto lg:hidden p-2 text-indigo-300 hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-thin">
        <template v-for="group in navGroups" :key="group.name">
          
          <div v-if="group.visible && group.children" class="mb-6">
             <div v-if="!sidebarCollapsed" @click="toggleGroup(group.name)" class="px-2 mb-2 text-xs font-bold text-indigo-300/70 uppercase tracking-wider whitespace-nowrap cursor-pointer flex items-center justify-between hover:text-indigo-200 transition-colors">
               {{ $t(group.name) }}
               <svg class="w-3.5 h-3.5 transition-transform" :class="openGroups.includes(group.name) ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
             </div>
             <div v-else class="h-px bg-indigo-800/50 my-4 mx-2"></div>
             
             <!-- Children -->
             <div v-show="openGroups.includes(group.name) || sidebarCollapsed" class="space-y-1">
                <template v-for="child in group.children" :key="child.path">
                  <NuxtLink v-if="child.visible" :to="child.path" :title="sidebarCollapsed ? $t(child.name) : ''" class="flex items-center py-2 rounded-xl text-sm font-bold transition-all" :class="[
                    $route.path === child.path ? 'bg-indigo-800 text-white shadow-sm' : 'text-indigo-100 hover:bg-indigo-800 hover:text-white lg:hover:translate-x-1 lg:rtl:hover:-translate-x-1',
                    sidebarCollapsed ? 'justify-center px-0' : 'px-3'
                  ]">
                    <svg v-if="child.icon" class="w-5 h-5 opacity-75 flex-shrink-0" :class="sidebarCollapsed ? '' : 'me-2.5'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="child.icon"></path></svg>
                    <span v-if="!sidebarCollapsed" class="whitespace-nowrap">{{ $t(child.name) }}</span>
                  </NuxtLink>
                </template>
             </div>
          </div>

          <div v-else-if="group.visible && !group.children" class="mb-6">
            <div v-if="sidebarCollapsed" class="h-px bg-indigo-800/50 my-4 mx-2"></div>
            <NuxtLink :to="group.path" :title="sidebarCollapsed ? $t(group.name) : ''" class="flex items-center py-2 rounded-xl text-sm font-bold transition-all" :class="[
              $route.path === group.path ? 'bg-indigo-800 text-white shadow-sm' : 'text-indigo-100 hover:bg-indigo-800 hover:text-white lg:hover:translate-x-1 lg:rtl:hover:-translate-x-1',
              sidebarCollapsed ? 'justify-center px-0' : 'px-3'
            ]">
              <svg v-if="group.icon" class="w-5 h-5 opacity-75 flex-shrink-0" :class="sidebarCollapsed ? '' : 'me-2.5'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="group.icon"></path></svg>
              <span v-if="!sidebarCollapsed" class="whitespace-nowrap">{{ $t(group.name) }}</span>
            </NuxtLink>
          </div>
        </template>
      </div>

      <!-- User Profile (Bottom) -->
      <div class="p-4 border-t border-indigo-800 bg-indigo-950/30 flex-shrink-0" :class="sidebarCollapsed ? 'flex justify-center' : ''">
        <div class="flex items-center justify-between" :class="sidebarCollapsed ? 'justify-center' : ''">
           <div v-if="!sidebarCollapsed" class="flex flex-col truncate pe-2">
             <span class="text-sm font-bold leading-none truncate">{{ user?.name || 'User' }}</span>
             <span class="text-xs text-indigo-300 mt-1 truncate">{{ user?.role?.name || user?.role || 'Staff' }}</span>
             <span class="text-[10px] text-indigo-400 mt-1 font-mono uppercase truncate">T: {{ tenantId }}</span>
           </div>
           <button @click="handleLogout" :title="sidebarCollapsed ? 'Logout' : ''" class="p-2 text-indigo-200 hover:text-white hover:bg-rose-500 rounded-lg transition-colors flex-shrink-0" :class="sidebarCollapsed ? 'bg-rose-500/20 text-rose-300' : ''">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
           </button>
         </div>
      </div>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden bg-gray-50 transition-all duration-300">
      
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-100 h-16 flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-30">
        <div class="flex items-center">
          <button @click="mobileMenuOpen = true" class="p-2 -ms-2 me-2 text-gray-600 hover:text-gray-900 focus:outline-none rounded-lg hover:bg-gray-100 transition-colors lg:hidden">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          
          <button @click="sidebarCollapsed = !sidebarCollapsed" class="hidden lg:block p-2 -ms-2 me-4 text-gray-600 hover:text-gray-900 focus:outline-none rounded-lg hover:bg-gray-100 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
          </button>

          <div class="font-black text-gray-900 tracking-tight text-lg lg:hidden">Alaqra ERP</div>
        </div>
        
        <div class="flex items-center gap-4 ms-auto">
          <NuxtLink v-if="enabledModules?.includes('ess') && (hasPermission('ess:read') || hasPermission('*'))" to="/ess/profile" class="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            <span class="hidden sm:inline">{{ $t('ess.title') }}</span>
          </NuxtLink>
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
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const { user, tenantId, enabledModules, logout } = useAuth()
const { t } = useI18n()
const { hasPermission } = usePermissions()
const { allowedLanguages, setLanguage, currentLanguage } = useLanguage()

const mobileMenuOpen = ref(false)
const sidebarCollapsed = useCookie('sidebar_collapsed', { default: () => false })
const openGroups = useCookie('sidebar_open_groups', { default: () => [] })
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

const toggleGroup = (name) => {
  if (openGroups.value.includes(name)) {
    openGroups.value = openGroups.value.filter(n => n !== name)
  } else {
    openGroups.value.push(name)
  }
}

const navGroups = computed(() => {
  return [
    {
      name: 'general.dashboard',
      path: '/',
      visible: true,
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    {
      name: 'nav.sales_crm',
      visible: hasPermission('pos:create') || hasPermission('pos:write'), 
      children: [
        { name: 'modules.pos', path: '/dashboard/pos', visible: enabledModules.value?.includes('pos') && (hasPermission('pos:create') || hasPermission('pos:write')), icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
        { name: 'nav.customers', path: '/dashboard/customers', visible: hasPermission('pos:create') || hasPermission('pos:write'), icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' }
      ]
    },
    {
      name: 'modules.inventory',
      visible: enabledModules.value?.includes('inventory') && (hasPermission('inventory:read') || hasPermission('inventory:write')),
      children: [
        { name: 'nav.products_overview', path: '/dashboard/inventory', visible: true, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { name: 'nav.stock_audit', path: '/dashboard/stock-movements', visible: true, icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
        { name: 'nav.suppliers', path: '/dashboard/suppliers', visible: true, icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h1m10 0h-1m-7-10V4a1 1 0 011-1h8a1 1 0 011 1v12h1' }
      ]
    },
    {
      name: 'modules.restaurant',
      visible: enabledModules.value?.includes('restaurant'),
      children: [
        { name: 'restaurant.tables_grid', path: '/dashboard/restaurant/tables-grid', visible: true, icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
        { name: 'restaurant.pos_terminal', path: '/dashboard/restaurant/pos-terminal', visible: true, icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
        { name: 'restaurant.kitchen_display', path: '/dashboard/restaurant/kitchen-display', visible: true, icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
        { name: 'restaurant.completed_orders', path: '/dashboard/restaurant/completed-orders', visible: true, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
        { name: 'restaurant.delivery_providers', path: '/dashboard/restaurant/providers', visible: true, icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
        { name: 'restaurant.menu_setup', path: '/dashboard/restaurant/menu-setup', visible: true, icon: 'M4 6h16M4 12h16M4 18h16' }
      ]
    },
    {
      name: 'modules.finance',
      visible: enabledModules.value?.includes('accounting') && (hasPermission('accounting:read') || hasPermission('accounting:write')), 
      children: [
        { name: 'nav.accounting_ledger', path: '/dashboard/accounting', visible: true, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'nav.debts', path: '/dashboard/debts', visible: true, icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
        { name: 'modules.cash_shifts', path: '/dashboard/shifts', visible: true, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'installments.title', path: '/dashboard/installments', visible: true, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { name: 'checks.title', path: '/dashboard/checks', visible: true, icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
        { name: 'modules.reports', path: '/dashboard/reports', visible: true, icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
      ]
    },
    {
      name: 'modules.hr',
      visible: enabledModules.value?.includes('hr') && (hasPermission('hr:read') || hasPermission('hr:write')),
      children: [
        { name: 'hr.attendance_monitor', path: '/dashboard/hr/attendance-monitor', visible: hasPermission('hr:write') || hasPermission('hr:read'), icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'hr.devices', path: '/dashboard/hr/devices', visible: hasPermission('hr:write'), icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
        { name: 'البصمات العالقة', path: '/dashboard/hr/pending-attendance', visible: hasPermission('hr:write'), icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
        { name: 'hr.structure', path: '/dashboard/hr/structure', visible: true, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { name: 'hr.employees', path: '/dashboard/hr/employees', visible: true, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { name: 'hr.shifts', path: '/dashboard/hr/shifts', visible: true, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { name: 'hr.leaves', path: '/dashboard/hr/leaves', visible: true, icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
        { name: 'hr.payroll', path: '/dashboard/payroll', visible: true, icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' }
      ]
    },

    {
      name: 'modules.operations',
      visible: hasPermission('archive:read') || hasPermission('archive:write') || hasPermission('*'),
      children: [
        { name: 'modules.archive', path: '/dashboard/archive', visible: enabledModules.value?.includes('archive') && (hasPermission('archive:read') || hasPermission('archive:write')), icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
        { name: 'general.settings', path: '/dashboard/settings', visible: hasPermission('*'), icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
      ]
    },
    {
      name: 'modules.team',
      visible: hasPermission('team:manage'),
      children: [
        { name: 'nav.staff_members', path: '/dashboard/team/users', visible: true, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { name: 'nav.access_roles', path: '/dashboard/team/roles', visible: true, icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' }
      ]
    }
  ]
})

onMounted(() => {
  // By default open all visible groups if cookie is fresh
  if (openGroups.value.length === 0) {
    openGroups.value = navGroups.value.filter(g => g.visible && g.children).map(g => g.name)
  }
})
const handleLogout = () => {
  if (confirm(t('common.logout_confirm'))) {
    logout()
  }
}
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
