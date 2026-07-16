const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    let token = req.headers.authorization;

    if (token && token.startsWith('Bearer')) {
        try {
            token = token.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
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

module.exports = { authMiddleware, rbacMiddleware };
