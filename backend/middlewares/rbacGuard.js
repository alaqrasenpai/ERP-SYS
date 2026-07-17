const requirePermission = (requiredPermission) => {
    return (req, res, next) => {
        // req.user is set by authMiddleware
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Not authenticated or no role assigned' });
        }

        const userPermissions = req.user.role.permissions || [];

        // Check if user has the global wildcard permission OR the specific required permission
        if (userPermissions.includes('*') || userPermissions.includes(requiredPermission)) {
            next();
        } else {
            res.status(403).json({ 
                message: `Forbidden: You do not have permission to perform this action. Required: ${requiredPermission}` 
            });
        }
    };
};

module.exports = { requirePermission };
