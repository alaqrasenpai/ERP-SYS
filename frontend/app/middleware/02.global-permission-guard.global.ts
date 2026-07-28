import { navConfig } from '../utils/navConfig'

export default defineNuxtRouteMiddleware((to, from) => {
    // Only check permissions for /apps/* routes
    if (!to.path.startsWith('/apps/')) return
    
    // We only want this to run on client side to access composables easily,
    // or we can use the composable if it's SSR safe. usePermissions uses useAuth which relies on cookies.
    const { hasPermission } = usePermissions()
    
    let requiredPermission = null
    
    // Find the longest matching path in navConfig
    let longestMatch = null
    for (const item of navConfig) {
        if (to.path === item.path || to.path.startsWith(item.path + '/')) {
            if (!longestMatch || item.path.length > longestMatch.path.length) {
                longestMatch = item
            }
        }
    }
    
    if (longestMatch) {
        requiredPermission = longestMatch.requiredPermission
    }
    
    // Fallback module-level checks if not found in navConfig (e.g. for dynamic nested routes not under a specific sub-menu)
    if (!requiredPermission) {
        if (to.path.startsWith('/apps/hr')) requiredPermission = 'hr:dashboard:read'
        else if (to.path.startsWith('/apps/inventory')) requiredPermission = 'inventory:read'
        else if (to.path.startsWith('/apps/finance')) requiredPermission = 'finance:read'
        else if (to.path.startsWith('/apps/crm')) requiredPermission = 'crm:read'
        else if (to.path.startsWith('/apps/pos')) requiredPermission = 'store_pos:use'
        else if (to.path.startsWith('/apps/restaurant')) requiredPermission = 'restaurant:use'
        else if (to.path.startsWith('/apps/settings/users') || to.path.startsWith('/apps/settings/roles')) requiredPermission = 'team:manage'
        else if (to.path.startsWith('/apps/settings')) requiredPermission = 'settings:manage'
    }
    
    // If the route explicitly defined one, it overrides the global one
    if (to.meta.requiredPermission) {
        requiredPermission = to.meta.requiredPermission as string
    }
    
    if (requiredPermission && !hasPermission(requiredPermission)) {
        console.warn(`Access Denied: Missing permission ${requiredPermission} for ${to.path}`)
        
        if (process.client) {
            alert(`Access Denied: You do not have the required permission (${requiredPermission}) to view this page.`)
        }
        
        // Prevent redirect loop if hub is somehow protected (it shouldn't be)
        if (to.path !== '/hub') {
            return navigateTo('/hub')
        }
    }
})
