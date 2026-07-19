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
        <NuxtLink to="/" class="flex items-center hover:opacity-80 transition-opacity">
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
      name: 'ess.title',
      visible: true,
      children: [
        { name: 'ess.my_profile', path: '/ess/profile', visible: true, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { name: 'ess.my_attendance', path: '/ess/attendance', visible: true, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'ess.my_leaves', path: '/ess/leaves', visible: true, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { name: 'ess.manager_approvals', path: '/ess/approvals', visible: true, icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' }
      ]
    },
    {
      name: 'ess.switch_dashboard',
      path: '/dashboard',
      visible: hasPermission('*') || hasPermission('hr:read') || hasPermission('pos:create'),
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
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
