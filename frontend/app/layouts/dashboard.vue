<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Top Navigation -->
    <nav class="bg-indigo-900 shadow-lg text-white border-b border-indigo-800 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity">
              <div class="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <h1 class="text-xl font-black tracking-tight hidden lg:block">ERP <span class="font-normal opacity-70 ml-1">v1.0</span></h1>
            </NuxtLink>
            
            <!-- Desktop Navigation -->
            <div class="hidden md:flex items-center ml-4 lg:ml-8 space-x-1">
              <template v-for="group in navGroups" :key="group.name">
                <!-- Single Link -->
                <NuxtLink v-if="group.visible && !group.children" :to="group.path" class="px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors" active-class="bg-indigo-800 text-white" :class="$route.path === group.path ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'">
                  {{ group.name }}
                </NuxtLink>

                <!-- Dropdown -->
                <div v-else-if="group.visible && group.children && group.children.some(c => c.visible)" class="relative group">
                  <button class="px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors text-indigo-200 hover:bg-indigo-800 hover:text-white flex items-center">
                    {{ group.name }}
                    <svg class="w-4 h-4 ml-1 opacity-70 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  <div class="absolute left-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 transform origin-top scale-95 group-hover:scale-100">
                    <div class="py-2">
                      <template v-for="child in group.children" :key="child.path">
                        <NuxtLink v-if="child.visible" :to="child.path" class="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium transition-colors">
                          {{ child.name }}
                        </NuxtLink>
                      </template>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
          <div class="flex items-center space-x-4">
             <div class="hidden sm:flex items-center mr-2">
               <span class="px-2 py-1 rounded text-xs font-bold bg-indigo-800 text-indigo-100 border border-indigo-700">
                 T: {{ tenantId }}
               </span>
             </div>
             <div class="flex flex-col text-right">
               <span class="text-sm font-bold leading-none">{{ user?.name || 'User' }}</span>
               <span class="text-xs text-indigo-300 mt-1">{{ user?.role?.name || user?.role || 'Staff' }}</span>
             </div>
             <button @click="logout" class="p-2 text-indigo-200 hover:text-white hover:bg-indigo-800 rounded-full transition-colors" title="Logout">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
             </button>
          </div>
        </div>
      </div>
      <!-- Mobile Navigation (scrollable) -->
      <div class="md:hidden border-t border-indigo-800 bg-indigo-800/50">
        <div class="flex overflow-x-auto no-scrollbar px-4 py-2 space-x-2">
          <template v-for="group in navGroups" :key="'mob-'+group.name">
            <NuxtLink v-if="group.visible && !group.children" :to="group.path" class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors" active-class="bg-indigo-700 text-white" :class="$route.path === group.path ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'">
              {{ group.name }}
            </NuxtLink>
            <template v-if="group.visible && group.children">
              <template v-for="child in group.children" :key="'mob-'+child.path">
                <NuxtLink v-if="child.visible" :to="child.path" class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors" active-class="bg-indigo-700 text-white" :class="$route.path === child.path ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'">
                  {{ child.name }}
                </NuxtLink>
              </template>
            </template>
          </template>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <main class="flex-1 w-full max-w-full">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useAuth } from '#imports'
import { usePermissions } from '../composables/usePermissions'

const { user, tenantId, enabledModules, logout } = useAuth()
const { hasPermission } = usePermissions()

const navGroups = computed(() => {
  return [
    {
      name: 'Dashboard',
      path: '/',
      visible: true
    },
    {
      name: 'Sales & CRM',
      visible: true, 
      children: [
        { name: 'POS Terminal', path: '/dashboard/pos', visible: enabledModules.value?.includes('pos') },
        { name: 'Customers', path: '/dashboard/customers', visible: true }
      ]
    },
    {
      name: 'Inventory',
      visible: enabledModules.value?.includes('inventory'),
      children: [
        { name: 'Products Overview', path: '/dashboard/inventory', visible: true },
        { name: 'Stock Audit', path: '/dashboard/stock-movements', visible: true },
        { name: 'Suppliers', path: '/dashboard/suppliers', visible: true }
      ]
    },
    {
      name: 'Finance',
      visible: true, 
      children: [
        { name: 'Accounting Ledger', path: '/dashboard/accounting', visible: enabledModules.value?.includes('accounting') },
        { name: 'Reports', path: '/dashboard/reports', visible: true }
      ]
    },
    {
      name: 'Operations',
      visible: true,
      children: [
        { name: 'HR & Payroll', path: '/dashboard/employees', visible: enabledModules.value?.includes('hr') },
        { name: 'Digital Archive', path: '/dashboard/archive', visible: enabledModules.value?.includes('archive') },
        { name: 'Settings', path: '/dashboard/settings', visible: true }
      ]
    },
    {
      name: 'Team Access',
      visible: hasPermission('team:manage'),
      children: [
        { name: 'Staff Members', path: '/dashboard/team/users', visible: true },
        { name: 'Access Roles', path: '/dashboard/team/roles', visible: true }
      ]
    }
  ]
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
