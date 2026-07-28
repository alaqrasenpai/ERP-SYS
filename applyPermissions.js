const fs = require('fs');

const hrFile = './backend/routes/hr.js';
let content = fs.readFileSync(hrFile, 'utf8');

// Add requirePermission import
if (!content.includes('requirePermission')) {
  content = content.replace(
    "const router = express.Router();",
    "const { requirePermission } = require('../middlewares/rbacGuard');\nconst router = express.Router();"
  );
}

// Granular permissions mapping for HR
const permMap = {
  '/dashboard': 'hr:dashboard:read',
  '/employees': { GET: 'hr:employees:read', default: 'hr:employees:manage' },
  '/departments': { GET: 'hr:departments:read', default: 'hr:departments:manage' },
  '/shifts': { GET: 'hr:shifts:read', default: 'hr:shifts:manage' },
  '/holidays': { GET: 'hr:shifts:read', default: 'hr:shifts:manage' }, // group with shifts or separate? Let's use hr:shifts:manage
  '/attendance': { GET: 'hr:attendance:read', default: 'hr:attendance:manage' },
  '/devices': { GET: 'hr:devices:read', default: 'hr:devices:manage' },
  '/leaves': { GET: 'hr:leaves:read', default: 'hr:leaves:manage' },
  '/payroll': { GET: 'hr:payroll:read', default: 'hr:payroll:manage' },
  '/allowances': { GET: 'hr:allowances:read', default: 'hr:allowances:manage' },
};

// Regex to find all router.METHOD('/path', handler)
content = content.replace(/router\.(get|post|put|delete)\('([^']+)',\s*(.+?)\);/g, (match, method, path, handler) => {
  // Find which base path it matches
  let perm = null;
  for (const [basePath, config] of Object.entries(permMap)) {
    if (path === basePath || path.startsWith(basePath + '/')) {
      if (typeof config === 'string') {
        perm = config;
      } else {
        perm = method.toUpperCase() === 'GET' ? config.GET : config.default;
      }
      break;
    }
  }
  
  if (perm) {
    return `router.${method}('${path}', requirePermission('${perm}'), ${handler});`;
  }
  return match;
});

fs.writeFileSync(hrFile, content);
console.log('Updated hr.js');

// Now for inventory.js, finance.js, customers.js, settings.js (the standard ones)
const standardFiles = [
  { file: './backend/routes/inventory.js', read: 'inventory:read', manage: 'inventory:manage' },
  { file: './backend/routes/finance.js', read: 'finance:read', manage: 'finance:manage' },
  { file: './backend/routes/customers.js', read: 'crm:read', manage: 'crm:manage' },
  { file: './backend/routes/settings.js', read: 'settings:manage', manage: 'settings:manage' }
];

for (const sf of standardFiles) {
  let sc = fs.readFileSync(sf.file, 'utf8');
  if (!sc.includes('requirePermission')) {
    sc = sc.replace(
      "const router = express.Router();",
      "const { requirePermission } = require('../middlewares/rbacGuard');\nconst router = express.Router();"
    );
  }
  
  sc = sc.replace(/router\.(get|post|put|delete)\('([^']+)',\s*(.+?)\);/g, (match, method, path, handler) => {
    let perm = method.toUpperCase() === 'GET' ? sf.read : sf.manage;
    return `router.${method}('${path}', requirePermission('${perm}'), ${handler});`;
  });
  
  fs.writeFileSync(sf.file, sc);
  console.log(`Updated ${sf.file}`);
}

// Now for POS and Restaurant
const posFile = './backend/routes/pos.js';
let posC = fs.readFileSync(posFile, 'utf8');
if (!posC.includes('requirePermission')) {
  posC = posC.replace(
    "const router = express.Router();",
    "const { requirePermission } = require('../middlewares/rbacGuard');\nconst router = express.Router();"
  );
}
posC = posC.replace(/router\.(get|post|put|delete)\('([^']+)',\s*(.+?)\);/g, (match, method, path, handler) => {
  let perm = method.toUpperCase() === 'GET' ? 'store_pos:use' : 'store_pos:manage';
  return `router.${method}('${path}', requirePermission('${perm}'), ${handler});`;
});
fs.writeFileSync(posFile, posC);
console.log('Updated pos.js');

const restFile = './backend/routes/restaurant.js';
let restC = fs.readFileSync(restFile, 'utf8');
if (!restC.includes('requirePermission')) {
  restC = restC.replace(
    "const router = express.Router();",
    "const { requirePermission } = require('../middlewares/rbacGuard');\nconst router = express.Router();"
  );
}
restC = restC.replace(/router\.(get|post|put|delete)\('([^']+)',\s*(.+?)\);/g, (match, method, path, handler) => {
  let perm = method.toUpperCase() === 'GET' ? 'restaurant:use' : 'restaurant:manage';
  return `router.${method}('${path}', requirePermission('${perm}'), ${handler});`;
});
fs.writeFileSync(restFile, restC);
console.log('Updated restaurant.js');
