import { computed } from 'vue'

export const useAuth = () => {
  // useCookie is Nuxt's native way to share state between SSR and CSR
  const token = useCookie<string | null>('erp_token', { path: '/', maxAge: 60 * 60 * 24 * 7, watch: true })
  const tenantId = useCookie<string | null>('erp_tenantId', { path: '/', maxAge: 60 * 60 * 24 * 7, watch: true })
  const user = useCookie<any | null>('erp_user', { path: '/', maxAge: 60 * 60 * 24 * 7, watch: true })
  const enabledModules = useCookie<string[]>('erp_modules', { path: '/', maxAge: 60 * 60 * 24 * 7, watch: true, default: () => [] })

  const setAuth = (newToken: string, newTenantId: string, newUser: any, newModules: string[]) => {
    token.value = newToken
    tenantId.value = newTenantId
    user.value = newUser
    enabledModules.value = newModules || []
  }

  const logout = () => {
    token.value = null
    tenantId.value = null
    user.value = null
    enabledModules.value = []
    return navigateTo('/login')
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
    logout,
    isLoggedIn
  }
}
