const requireModule = (moduleName) => {
    return (req, res, next) => {
        const tenantConfig = req.tenantConfig;

        // Ensure tenant configuration and enabledModules array exist
        if (!tenantConfig || !tenantConfig.enabledModules) {
            return res.status(500).json({ message: 'Internal Server Error: Tenant configuration missing' });
        }

        // Check if the specific module is enabled for this tenant
        if (!tenantConfig.enabledModules.includes(moduleName)) {
            return res.status(403).json({ 
                message: `403 Forbidden: This store has not purchased or licensed the [${moduleName}] module.` 
            });
        }

        // Module is enabled, proceed
        next();
    };
};

module.exports = { requireModule };
