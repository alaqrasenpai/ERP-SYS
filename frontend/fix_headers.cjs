const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'app', 'pages', 'dashboard');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Update main header flex container
  // From: flex flex-col sm:flex-row justify-between items-start sm:items-center ...
  // To: flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 ...
  content = content.replace(
    /class="flex flex-col (sm|md|xl):flex-row justify-between items-start \1:items-center([^"]*)"/,
    'class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4$2"'
  );
  
  // Also handle cases with space-y-4 sm:space-y-0
  content = content.replace(/space-y-4 (sm|md|xl):space-y-0/g, '');

  // 2. Add truncation to titles
  // h2 class="text-2xl font-black text-gray-900 tracking-tight"
  content = content.replace(
    /<h2 class="text-2xl font-black text-gray-900 tracking-tight">/g,
    '<h2 class="text-2xl font-black text-gray-900 tracking-tight truncate">'
  );

  // p class="text-sm font-bold text-gray-400"
  content = content.replace(
    /<p class="text-sm font-bold text-gray-400">/g,
    '<p class="text-sm font-bold text-gray-400 truncate hidden sm:block">'
  );

  // 3. Update the right-side actions wrapper
  // Common patterns for the right side:
  // class="flex gap-3 mt-4 sm:mt-0"
  // class="mt-4 sm:mt-0 flex gap-3"
  // class="flex flex-wrap gap-3 w-full xl:w-auto"
  content = content.replace(
    /class="(?:flex )?gap-3 mt-4 (?:sm|md|xl):mt-0(?: flex)?"/g,
    'class="flex flex-row flex-nowrap gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 shrink-0"'
  );
  content = content.replace(
    /class="mt-4 (?:sm|md|xl):mt-0 flex gap-3"/g,
    'class="flex flex-row flex-nowrap gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 shrink-0"'
  );
  
  // Fix specific buttons that might shrink incorrectly
  content = content.replace(
    /<button([^>]*)class="([^"]*) px-5 py-2\.5([^"]*)"/g,
    '<button$1class="$2 px-4 py-2 shrink-0 whitespace-nowrap$3"'
  );
  content = content.replace(
    /<NuxtLink([^>]*)class="([^"]*) px-5 py-2\.5([^"]*)"/g,
    '<NuxtLink$1class="$2 px-4 py-2 shrink-0 whitespace-nowrap$3"'
  );

  // If changed, write it back
  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${path.basename(filePath)}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.vue')) {
      processFile(fullPath);
    }
  }
}

walkDir(pagesDir);
console.log('Done.');
