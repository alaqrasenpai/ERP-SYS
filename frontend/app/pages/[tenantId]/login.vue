<template>
  <div class="min-h-[100dvh] bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
      <img v-if="tenantInfo?.logoUrl" :src="tenantInfo.logoUrl" alt="Store Logo" class="h-20 w-auto object-contain mb-4" />
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
        <template v-if="pending">...</template>
        <template v-else-if="tenantInfo">{{ tenantInfo.name }}</template>
        <template v-else>{{ $t('login.tenant_portal') }}</template>
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        <template v-if="tenantInfo">{{ $t('login.welcome_store', { store: tenantInfo.name }) }}</template>
        <template v-else>{{ $t('login.sign_in_message') }}</template>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-xl sm:px-10 border border-gray-100">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Workspace ID removed, inferred from URL -->

          <div>
            <label class="block text-sm font-medium text-gray-700">{{ $t('login.email') }}</label>
            <input v-model="form.email" type="email" required :placeholder="$t('login.email_placeholder')" class="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm ring-1 ring-gray-900/5 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">{{ $t('login.password') }}</label>
            <input v-model="form.password" type="password" required placeholder="••••••••" class="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm ring-1 ring-gray-900/5 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors">
          </div>

          <button type="submit" :disabled="loading" class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm ring-1 ring-gray-900/5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            <svg v-if="loading" class="animate-spin -ms-1 me-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? $t('login.signing_in') : $t('login.sign_in') }}
          </button>
        </form>

        <div v-if="error" class="mt-5 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm flex items-center">
          <svg class="w-5 h-5 me-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
          {{ error }}
        </div>
      </div>
    </div>
    
    <!-- Developer Footer -->
    <div class="mt-auto py-6 text-center text-xs text-gray-400">
      Developed by <a href="https://alaqra.dev" target="_blank" class="text-indigo-500 hover:text-indigo-600 font-medium">alaqra.dev</a>
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Login' })

const { setAuth } = useAuth()
const { t } = useI18n()
const loading = ref(false)
const error = ref('')

const { $api } = useNuxtApp()
const route = useRoute()
const tenantId = route.params.tenantId

const { data: tenantInfo, pending } = await useAsyncData(`tenant-${tenantId}`, () => {
  return $api(`/public/tenant/${tenantId}`)
})

const form = ref({
  email: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const { login } = useAuth()
    await login(form.value.email, form.value.password, tenantId)
  } catch (err) {
    const backendMsg = err.data?.message || err.message
    if (backendMsg === 'Tenant not found') {
      error.value = t('login.tenant_not_found')
    } else if (backendMsg === 'Invalid email or password') {
      error.value = t('login.invalid_credentials')
    } else if (backendMsg === 'Your account has been deactivated') {
      error.value = t('login.account_deactivated')
    } else {
      error.value = err.data?.message || err.message || t('login.default_error', 'Invalid credentials or connection error')
    }
  } finally {
    loading.value = false
  }
}
</script>
