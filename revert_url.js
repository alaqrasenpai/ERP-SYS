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
            if (content.includes('https://erp-sys-71b6.onrender.com')) {
                content = content.replace(/https:\/\/erp-sys-71b6\.onrender\.com/g, 'http://localhost:5000');
                fs.writeFileSync(fullPath, content);
                console.log(`Reverted ${fullPath}`);
            }
        }
    }
}

replaceInDir('d:/Projects/ERP SYS/frontend/app');
