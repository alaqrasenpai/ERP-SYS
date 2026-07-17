const jwt = require('jsonwebtoken');

const superAdminAuth = (req, res, next) => {
    // Read token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Access denied: Super Admin only' });
        }
        
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is invalid or expired' });
    }
};

module.exports = { superAdminAuth };
