export default defineNuxtRouteMiddleware((to, from) => {
    const { enabledModules } = useAuth()
    
    // Check if the route has a required module specified in meta
    if (to.meta.requiredModule) {
        const module = to.meta.requiredModule as string
        
        // If the tenant does not have this module, redirect to home
        if (!enabledModules.value || !enabledModules.value.includes(module)) {
            // Nuxt doesn't have an alert out of the box in middleware, but we can redirect
            console.warn(`Access Denied: Store not licensed for module: ${module}`)
            if (process.client) {
                alert('Access Denied: Module not subscribed.')
            }
            return navigateTo('/')
        }
    }
})
