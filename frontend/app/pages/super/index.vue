<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-xl mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Super Admin - Create Tenant</h2>
      
      <form @submit.prevent="createTenant" class="space-y-6">
        
        <!-- Company Information -->
        <div>
          <h3 class="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Company Details</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Company Name</label>
              <input v-model="form.name" type="text" required placeholder="e.g. Acme Corp" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring-indigo-500">
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Tenant ID (Slug)</label>
                <input v-model="form.tenantId" type="text" required placeholder="e.g. acme" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring-indigo-500">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Database Name</label>
                <input v-model="form.dbName" type="text" required placeholder="e.g. erp_tenant_acme" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring-indigo-500">
              </div>
            </div>
          </div>
        </div>

        <!-- First Admin User -->
        <div>
          <h3 class="text-lg font-bold text-gray-900 border-b pb-2 mb-4">First Admin User</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Admin Name</label>
              <input v-model="form.adminName" type="text" required placeholder="e.g. John Doe" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring-indigo-500">
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Admin Email</label>
                <input v-model="form.adminEmail" type="email" required placeholder="admin@company.com" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring-indigo-500">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Password</label>
                <input v-model="form.adminPassword" type="password" required placeholder="Secure password" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring-indigo-500">
              </div>
            </div>
          </div>
        </div>

        <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm ring-1 ring-gray-900/5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
          Create Tenant & Admin
        </button>
      </form>

      <div v-if="message" class="mt-6 p-4 rounded-md" :class="isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'">
        {{ message }}
      </div>

      <div class="mt-6 text-center">
        <NuxtLink to="/login" class="text-sm text-indigo-600 hover:text-indigo-500 font-bold">Go to Login Page</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Super' })

import { ref } from 'vue'

const form = ref({
  name: '',
  tenantId: '',
  dbName: '',
  adminName: '',
  adminEmail: '',
  adminPassword: ''
})
const message = ref('')
const isError = ref(false)

const createTenant = async () => {
  try {
    message.value = 'Creating tenant and assigning admin...'
    isError.value = false
    
    await $fetch('http://localhost:5000/api/super/tenants', {
      method: 'POST',
      body: form.value
    })
    
    isError.value = false
    message.value = 'Tenant and First Admin created successfully! You can now log in.'
    form.value = { name: '', tenantId: '', dbName: '', adminName: '', adminEmail: '', adminPassword: '' }
  } catch (error) {
    isError.value = true
    message.value = error.data?.message || 'An error occurred connecting to the API'
  }
}
</script>
