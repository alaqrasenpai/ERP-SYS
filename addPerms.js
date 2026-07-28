const fs = require('fs');
const path = require('path');

const applyPerms = (file, readPermStr, managePermStr) => {
    const fullPath = path.join(__dirname, 'backend', 'routes', file);
    if (!fs.existsSync(fullPath)) return;
    
    let code = fs.readFileSync(fullPath, 'utf8');
    if (code.includes('requirePermission')) return; // already applied
    
    code = code.replace(/const express = require\('express'\);/g, `const express = require('express');\nconst { requirePermission } = require('../middlewares/rbacGuard');\nconst readPerm = requirePermission('${readPermStr}');\nconst managePerm = requirePermission('${managePermStr}');`);
    
    code = code.replace(/router\.get\('([^']+)', /g, 'router.get(\'$1\', readPerm, ');
    code = code.replace(/router\.post\('([^']+)', /g, 'router.post(\'$1\', managePerm, ');
    code = code.replace(/router\.put\('([^']+)', /g, 'router.put(\'$1\', managePerm, ');
    code = code.replace(/router\.delete\('([^']+)', /g, 'router.delete(\'$1\', managePerm, ');
    
    fs.writeFileSync(fullPath, code);
    console.log(`Updated ${file}`);
};

applyPerms('inventory.js', 'inventory:read', 'inventory:manage');
applyPerms('finance.js', 'finance:read', 'finance:manage');
applyPerms('pos.js', 'pos:use', 'pos:manage');
applyPerms('restaurant.js', 'pos:use', 'pos:manage');
applyPerms('customers.js', 'crm:read', 'crm:manage');
applyPerms('settings.js', 'settings:manage', 'settings:manage');
