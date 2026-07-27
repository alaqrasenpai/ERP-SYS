import { computed } from 'vue'

export const useAuth = () => {
  // useCookie is Nuxt's native way to share state between SSR and CSR
  const token = useCookie<string | null>('erp_token', { path: '/', maxAge: 60 * 60 * 24 * 7, watch: true })
  const tenantId = useCookie<string | null>('erp_tenantId', { path: '/', maxAge: 60 * 60 * 24 * 7, watch: true })
  const user = useCookie<any | null>('erp_user', { path: '/', maxAge: 60 * 60 * 24 * 7, watch: true })
  const enabledModules = useCookie<string[]>('erp_modules', { path: '/', maxAge: 60 * 60 * 24 * 7, watch: true, default: () => [] })
  const currency = useCookie<string>('erp_currency', { path: '/', maxAge: 60 * 60 * 24 * 7, watch: true, default: () => 'SAR' })

  const setAuth = (newToken: string, newTenantId: string, newUser: any, newModules: string[], newCurrency: string) => {
    token.value = newToken
    tenantId.value = newTenantId
    user.value = newUser
    enabledModules.value = newModules || []
    if (newCurrency) currency.value = newCurrency
    if (process.client && newTenantId) {
      localStorage.setItem('erp_last_tenant', newTenantId)
    }
  }

  const login = async (email, password, tenant) => {
    const { $api } = useNuxtApp()
    // For login, we need to manually pass the tenant since it might not be in the cookie yet
    const data = await $api('/auth/login', {
      method: 'POST',
      headers: { 'x-tenant-id': tenant },
      body: { email, password }
    })
    setAuth(data.token, tenant, data.user, data.enabledModules, data.currency)
    
    // Redirect logic based on role
    if (data.user.role === 'admin' || data.user.role === 'manager' || data.user.role === 'cashier') {
      return navigateTo('/hub')
    } else {
      return navigateTo('/ess/profile')
    }
  }

  const fetchUser = async () => {
    if (!token.value) return
    try {
      const { $api } = useNuxtApp()
      const data = await $api('/auth/me')
      user.value = data.user
      enabledModules.value = data.enabledModules
      if (data.currency) currency.value = data.currency
      // data.employee holds the employee profile if needed
    } catch (error) {
      console.error('Failed to fetch user:', error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout()
      }
    }
  }

  const logout = () => {
    let currentTenant = tenantId.value
    if (process.client) {
      currentTenant = currentTenant || localStorage.getItem('erp_last_tenant')
      const route = useRoute()
      if (route.params.tenantId) {
        currentTenant = route.params.tenantId as string
      }
    }
    
    token.value = null
    // We intentionally do not clear tenantId.value so the system remembers which tenant login page to redirect to
    user.value = null
    enabledModules.value = []
    
    if (process.client) {
      if (currentTenant) {
        window.location.href = `/${currentTenant}/login`
      } else {
        window.location.href = '/'
      }
    } else {
      if (currentTenant) {
        return navigateTo(`/${currentTenant}/login`)
      }
      return navigateTo('/')
    }
  }

  const isLoggedIn = computed(() => {
    return !!token.value
  })

  return {
    token,
    tenantId,
    user,
    enabledModules,
    setAuth,
    login,
    logout,
    fetchUser,
    isLoggedIn,
    currency
  }
}
