<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Top Navigation -->
    <nav class="bg-gray-900 shadow-lg text-white border-b border-gray-800 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity">
              <div class="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center me-3 shadow-sm">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h1 class="text-xl font-black tracking-tight hidden lg:block text-red-500">SUPER <span class="font-normal opacity-70 ms-1 text-white">ADMIN</span></h1>
            </div>
          </div>
          <div class="flex items-center gap-4">
             <div class="flex flex-col text-end">
               <span class="text-sm font-bold leading-none">System Admin</span>
             </div>
             <button @click="logout" class="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors" title="Logout">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
             </button>
          </div>
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
const router = useRouter()

const logout = () => {
  localStorage.removeItem('super_token')
  router.push('/super-admin/login')
}
</script>
