const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.nuxt' && file !== '.output') {
                replaceInDir(fullPath);
            }
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.vue') || fullPath.endsWith('.js') || fullPath.endsWith('.cjs')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('http://localhost:5000')) {
                content = content.replace(/http:\/\/localhost:5000/g, 'https://erp-sys-71b6.onrender.com');
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

replaceInDir('d:/Projects/ERP SYS/frontend/app');
replaceInDir('d:/Projects/ERP SYS/frontend/server'); // if exists
