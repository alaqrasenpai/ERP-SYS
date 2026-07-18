const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'app', 'pages');
const layoutPath = path.join(__dirname, 'app', 'layouts');

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

const vueFiles = walkSync(directoryPath).concat(walkSync(layoutPath));

let totalChanges = 0;

vueFiles.forEach(filepath => {
    let content = fs.readFileSync(filepath, 'utf8');
    const originalContent = content;

    // 1. Replace space-x-[n] space-x-reverse with gap-[n]
    // Patterns can be separated or together
    content = content.replace(/space-x-(\d+)\s+space-x-reverse/g, 'gap-$1');
    content = content.replace(/space-x-reverse\s+space-x-(\d+)/g, 'gap-$1');
    
    // Some places might just have space-x-reverse somewhere else.
    // Clean up orphan space-x-reverse if gap is used
    // Let's do a more robust replacement:
    content = content.replace(/space-x-(\d+)/g, 'gap-$1');
    content = content.replace(/space-x-reverse/g, ''); // Remove all space-x-reverse since we switched to gap

    // 2. Replace text-right with text-end and text-left with text-start
    content = content.replace(/text-right/g, 'text-end');
    content = content.replace(/text-left/g, 'text-start');
    
    // Replace padding left/right with start/end (pl- -> ps-, pr- -> pe-, ml- -> ms-, mr- -> me-)
    // We have to be careful with borders (e.g. border-r -> border-e)
    content = content.replace(/\bml-(\d+|auto)\b/g, 'ms-$1');
    content = content.replace(/\bmr-(\d+|auto)\b/g, 'me-$1');
    content = content.replace(/\bpl-(\d+|auto)\b/g, 'ps-$1');
    content = content.replace(/\bpr-(\d+|auto)\b/g, 'pe-$1');
    content = content.replace(/\bborder-r\b/g, 'border-e');
    content = content.replace(/\bborder-l\b/g, 'border-s');
    content = content.replace(/\bborder-r-(\d+)\b/g, 'border-e-$1');
    content = content.replace(/\bborder-l-(\d+)\b/g, 'border-s-$1');
    
    // Remove extra spaces caused by removing space-x-reverse
    content = content.replace(/\s{2,}/g, (match) => {
        // Only replace inside classes, this is risky so let's just do it manually with a simpler regex
        return match; 
    });
    content = content.replace(/class="([^"]+)"/g, (match, p1) => {
        return `class="${p1.replace(/\s+/g, ' ').trim()}"`;
    });

    // 3. Improve Card UI
    // Upgrade basic rounded-lg shadow-sm to rounded-xl shadow-sm ring-1 ring-gray-900/5
    content = content.replace(/rounded-lg shadow-sm(?! ring-1)/g, 'rounded-xl shadow-sm ring-1 ring-gray-900/5');
    content = content.replace(/rounded-md shadow-sm(?! ring-1)/g, 'rounded-xl shadow-sm ring-1 ring-gray-900/5');
    
    // Soften borders
    content = content.replace(/border-gray-200/g, 'border-gray-100');
    content = content.replace(/divide-gray-200/g, 'divide-gray-100');

    // 4. Improve Button UI
    // Ensure standard buttons have modern transitions and focus rings
    // Primary Button (bg-indigo-600)
    content = content.replace(/bg-indigo-600 hover:bg-indigo-700/g, 'bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2');
    
    if (content !== originalContent) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Updated: ${filepath}`);
        totalChanges++;
    }
});

console.log(`\nRefactoring complete. Modified ${totalChanges} files.`);
