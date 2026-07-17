const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    let token = req.headers.authorization;

    if (token && token.startsWith('Bearer')) {
        try {
            token = token.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Strict Multi-Tenant Check
            // Super Admins (role: '*') bypass this check. Others must strictly match.
            const reqTenantId = req.headers['x-tenant-id'] || (req.tenantConfig && req.tenantConfig.tenantId);
            
            if (decoded.tenantId !== reqTenantId && !(decoded.permissions && decoded.permissions.includes('*'))) {
                return res.status(403).json({ message: 'Forbidden: Security Breach - Tenant ID mismatch' });
            }

            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Unauthorized: Token expired or invalid' });
        }
    } else {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
};

// Role-Based Access Control (RBAC) middleware
const rbacMiddleware = (requiredPermissions) => {
    return (req, res, next) => {
        // Assume req.user contains permissions (could also be fetched from the database using req.tenantDbConnection)
        if (!req.user || !req.user.permissions) {
            return res.status(403).json({ message: 'Forbidden: No permissions found' });
        }

        const hasPermission = requiredPermissions.every(perm => req.user.permissions.includes(perm));
        
        if (!hasPermission) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};

module.exports = { authMiddleware: verifyToken, verifyToken, rbacMiddleware };
