export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('erp_token')
  
  // Allow access to the root landing page without authentication
  if (to.path === '/') return

  const isLoginPage = to.path.match(/\/login\/?$/)
  
  // If not authenticated and not accessing a login page or super-admin, redirect to landing page
  if (!token.value && !isLoginPage && !to.path.startsWith('/super-admin')) {
    return navigateTo('/')
  }

    // If user has token and is trying to access login page, redirect to app
    if (token.value && to.path.endsWith('/login')) {
        return navigateTo('/hub')
    }
})
