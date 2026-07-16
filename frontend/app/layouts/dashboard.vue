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
            <div class="hidden md:flex items-center ml-4 lg:ml-8 space-x-1 overflow-x-auto no-scrollbar">
              <NuxtLink v-for="link in links" :key="link.path" :to="link.path" class="px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors" active-class="bg-indigo-800 text-white" :class="$route.path === link.path ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'">
                {{ link.name }}
              </NuxtLink>
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
               <span class="text-xs text-indigo-300 mt-1">{{ user?.role || 'Staff' }}</span>
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
          <NuxtLink v-for="link in links" :key="link.path" :to="link.path" class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors" active-class="bg-indigo-700 text-white" :class="$route.path === link.path ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'">
            {{ link.name }}
          </NuxtLink>
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
const { user, tenantId, logout } = useAuth()

const links = [
  { name: 'Dashboard', path: '/' },
  { name: 'POS', path: '/dashboard/pos' },
  { name: 'Inventory', path: '/dashboard/inventory' },
  { name: 'Stock Audit', path: '/dashboard/stock-movements' },
  { name: 'Suppliers', path: '/dashboard/suppliers' },
  { name: 'Customers', path: '/dashboard/customers' },
  { name: 'Accounting', path: '/dashboard/accounting' },
  { name: 'HR', path: '/dashboard/employees' },
  { name: 'Archive', path: '/dashboard/archive' }
]
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
