<template>
  <div class="p-4 sm:p-8">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center mb-8">
        <NuxtLink to="/super-admin" class="mr-4 p-2 bg-white rounded-lg border border-gray-200 text-gray-500 hover:text-gray-900 shadow-sm transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </NuxtLink>
        <div>
          <h2 class="text-3xl font-black text-gray-900 tracking-tight">Onboard New Store</h2>
          <p class="text-sm text-gray-500 mt-1">Provision a new tenant database and admin account instantly.</p>
        </div>
      </div>

      <form @submit.prevent="submitOnboarding" class="space-y-8">
        <!-- Section 1: Store Info -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-black text-gray-900">1. Store Information</h3>
          </div>
          <div class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Store / Company Name</label>
                <input v-model="form.storeName" type="text" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500 bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. Acme Corp">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Tenant ID (Slug)</label>
                <input v-model="form.tenantId" type="text" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500 bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. acme-corp">
              </div>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Database Name</label>
              <input v-model="form.dbName" type="text" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500 bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. tenant_acme">
            </div>
            
            <div class="pt-4">
              <label class="block text-sm font-bold text-gray-700 mb-3">Enabled Modules</label>
              <div class="flex flex-wrap gap-3">
                <label v-for="mod in availableModules" :key="mod.id" class="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input type="checkbox" :value="mod.id" v-model="form.enabledModules" class="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500">
                  <span class="ml-2 text-sm font-bold text-gray-700">{{ mod.label }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: Primary Admin Account -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-black text-gray-900">2. Primary Admin Account</h3>
          </div>
          <div class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Owner Name</label>
                <input v-model="form.adminName" type="text" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500 bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. John Doe">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Owner Email (Login ID)</label>
                <input v-model="form.adminEmail" type="email" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500 bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. john@acme.com">
              </div>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Initial Password</label>
              <input v-model="form.adminPassword" type="text" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500 bg-gray-50 focus:bg-white transition-colors" placeholder="Temporary password">
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button type="submit" :disabled="loading" class="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-lg shadow-xl shadow-red-200 transition-all focus:outline-none focus:ring-4 focus:ring-red-500/50 disabled:bg-gray-400 flex items-center">
             <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ loading ? 'Provisioning Environment...' : 'Provision Store' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Onboard' })

import { ref } from 'vue'

definePageMeta({
  layout: 'super-admin'
})

const router = useRouter()
const loading = ref(false)

const availableModules = [
  { id: 'inventory', label: 'Inventory & WMS' },
  { id: 'pos', label: 'Point of Sale (POS)' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'payroll', label: 'HR & Payroll' },
  { id: 'archive', label: 'Archive' }
]

const form = ref({
  storeName: '',
  tenantId: '',
  dbName: '',
  enabledModules: ['inventory', 'pos'], // Default selected
  adminName: '',
  adminEmail: '',
  adminPassword: ''
})

const submitOnboarding = async () => {
  const token = localStorage.getItem('super_token')
  if (!token) {
    router.push('/super-admin/login')
    return
  }

  loading.value = true
  try {
    const res = await $fetch(`http://localhost:5000/api/super/tenants/onboard`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form.value
    })
    
    alert(`Success! Store provisioned.\nTenant ID: ${res.tenant.tenantId}\nAdmin: ${res.adminEmail}`)
    router.push('/super-admin')
  } catch (error) {
    alert(error.data?.message || 'Failed to onboard store')
  } finally {
    loading.value = false
  }
}
</script>
