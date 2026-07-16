export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('erp_token')
  
  if (!token.value && to.path !== '/login' && to.path !== '/super') {
    return navigateTo('/login')
  }

  if (token.value && to.path === '/login') {
    return navigateTo('/')
  }
})
