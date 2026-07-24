export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('erp_token')
  
  // Allow access to the root landing page without authentication
  if (to.path === '/') return

  // If not authenticated and not accessing a login page or super-admin, redirect to landing page
  if (!token.value && !to.path.endsWith('/login') && !to.path.startsWith('/super-admin')) {
    return navigateTo('/')
  }

  // If authenticated and trying to access a login page, redirect to dashboard
  if (token.value && to.path.endsWith('/login')) {
    return navigateTo('/dashboard')
  }
})
