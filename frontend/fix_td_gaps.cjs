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

let totalChanges = 0;

vueFiles.forEach(filepath => {
    let content = fs.readFileSync(filepath, 'utf8');
    const originalContent = content;

    // Fix: <td class="... gap-2"> button button </td>
    // To: <td class="..."><div class="flex items-center gap-2 justify-end"> button button </div></td>
    // It's safer to just replace `gap-2` in `td` classes and wrap the contents, but that's hard with regex.
    // Let's replace the td opening tag.
    
    // Pattern: <td class="px-6 py-4 whitespace-nowrap text-end text-sm font-medium gap-2">
    // To: <td class="px-6 py-4 whitespace-nowrap text-end text-sm font-medium"> <div class="flex items-center gap-2 justify-end">
    content = content.replace(/<td([^>]*) gap-2([^>]*)>/g, '<td$1$2>\n              <div class="flex items-center gap-2 justify-end">');
    // Also we need to close the </div> before </td> but only for those we opened. 
    // This is risky. 
    
    // Instead of regex wrapper, let's just find gap-2 inside td class and remove it, we will manually check later.
    // Actually, `flex items-center justify-end gap-2` on the <td> doesn't work because td is display: table-cell.
    // We must wrap it.
    
    // I'll leave the script to just report where ` gap-2` or ` gap-3` exists inside `<td`
    const tdMatches = content.match(/<td[^>]*gap-\d+[^>]*>/g);
    if (tdMatches) {
        console.log(`Needs manual fix in ${filepath}:`, tdMatches);
    }
});
