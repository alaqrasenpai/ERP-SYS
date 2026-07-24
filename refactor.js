const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.output') && !file.includes('.nuxt')) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.vue')) {
      results.push(file);
    }
  });
  return results;
}

const vueFiles = walk(path.join(__dirname, 'frontend/app'));
vueFiles.push(path.join(__dirname, 'frontend/app.vue'));
vueFiles.push(path.join(__dirname, 'frontend/error.vue'));

let changedFiles = 0;

vueFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace indigo variants with primary variants
  content = content.replace(/\bindigo-50\b/g, 'primary-50');
  content = content.replace(/\bindigo-100\b/g, 'primary-100');
  content = content.replace(/\bindigo-200\b/g, 'primary-200');
  content = content.replace(/\bindigo-300\b/g, 'primary-300');
  content = content.replace(/\bindigo-400\b/g, 'primary-400');
  content = content.replace(/\bindigo-500\b/g, 'primary-500');
  content = content.replace(/\bindigo-600\b/g, 'primary-600');
  content = content.replace(/\bindigo-700\b/g, 'primary-700');
  content = content.replace(/\bindigo-800\b/g, 'primary-800');
  content = content.replace(/\bindigo-900\b/g, 'primary-900');
  content = content.replace(/\bindigo-950\b/g, 'primary-950');

  // Replace emerald variants with secondary variants
  content = content.replace(/\bemerald-50\b/g, 'secondary-50');
  content = content.replace(/\bemerald-100\b/g, 'secondary-100');
  content = content.replace(/\bemerald-200\b/g, 'secondary-200');
  content = content.replace(/\bemerald-300\b/g, 'secondary-300');
  content = content.replace(/\bemerald-400\b/g, 'secondary-400');
  content = content.replace(/\bemerald-500\b/g, 'secondary-500');
  content = content.replace(/\bemerald-600\b/g, 'secondary-600');
  content = content.replace(/\bemerald-700\b/g, 'secondary-700');
  content = content.replace(/\bemerald-800\b/g, 'secondary-800');
  content = content.replace(/\bemerald-900\b/g, 'secondary-900');
  content = content.replace(/\bemerald-950\b/g, 'secondary-950');
  
  // Replace teal as well just in case they used it
  content = content.replace(/\bteal-500\b/g, 'secondary-500');
  content = content.replace(/\bteal-600\b/g, 'secondary-600');

  // Apply basic dark mode classes for layout containers
  // Since we are not doing AST parsing, let's just make sure some key classes are replaced with dark mode variants.
  // Actually, a simple text replace for `bg-white` to `bg-white dark:bg-gray-800` where appropriate is very hard using simple regex.
  // We'll stick to primary/secondary for now as that's safe.
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log('Refactored:', file);
  }
});

console.log('Total files changed:', changedFiles);
