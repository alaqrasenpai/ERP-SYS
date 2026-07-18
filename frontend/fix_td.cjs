const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'app', 'pages');

const walkSync = (dir, filelist = []) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            walkSync(filepath, filelist);
        } else if (file.endsWith('.vue')) {
            filelist.push(filepath);
        }
    }
    return filelist;
};

const vueFiles = walkSync(directoryPath);

vueFiles.forEach(filepath => {
    let content = fs.readFileSync(filepath, 'utf8');
    const originalContent = content;

    // Pattern for the td
    const tdPattern = /<td([^>]*) text-end text-sm font-medium gap-2([^>]*)>([\s\S]*?)<\/td>/g;
    content = content.replace(tdPattern, (match, p1, p2, innerHTML) => {
        return `<td${p1} text-end text-sm font-medium${p2}>\n              <div class="flex items-center justify-end gap-2">${innerHTML}</div>\n            </td>`;
    });
    
    // Pattern for attendance-monitor (doesn't have text-sm font-medium)
    const tdPattern2 = /<td([^>]*) text-end gap-2([^>]*)>([\s\S]*?)<\/td>/g;
    content = content.replace(tdPattern2, (match, p1, p2, innerHTML) => {
        return `<td${p1} text-end${p2}>\n              <div class="flex items-center justify-end gap-2">${innerHTML}</div>\n            </td>`;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Fixed TD gaps in: ${filepath}`);
    }
});
