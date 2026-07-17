import { useAuth } from './useAuth'

export const usePermissions = () => {
  const { user } = useAuth()

  const hasPermission = (permissionName: string) => {
    // If no user or no role, deny
    if (!user.value || !user.value.role) return false
    
    const userPermissions = user.value.role.permissions || []

    // Check for super wildcard permission or the exact permission
    if (userPermissions.includes('*')) return true
    if (userPermissions.includes(permissionName)) return true
    
    return false
  }

  return { hasPermission }
}
