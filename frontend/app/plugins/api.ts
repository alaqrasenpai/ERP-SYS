export default defineNuxtPlugin((nuxtApp) => {
  const auth = useAuth()

  // Create a custom fetch instance with pre-configured interceptors
  const api = $fetch.create({
    baseURL: 'https://erp-sys-71b6.onrender.com/api',
    onRequest({ request, options }) {
      const headers = new Headers(options.headers || {})
      
      // Dynamically inject the tenant ID
      if (auth.tenantId.value) {
        headers.set('x-tenant-id', auth.tenantId.value)
      }
      
      // Dynamically inject the JWT token
      if (auth.token.value) {
        headers.set('Authorization', `Bearer ${auth.token.value}`)
      }
      
      options.headers = headers
    },
    onResponseError({ request, response }) {
      const isLoginRequest = request.toString().includes('/login')
      if (!isLoginRequest && (response.status === 401 || response.status === 403)) {
        console.warn('API returned 401/403 Unauthorized. Logging out...')
        if (process.client) {
           auth.logout()
        }
      }
    }
  })

  // Provide it globally so it can be used as $api in components
  return {
    provide: {
      api
    }
  }
})
