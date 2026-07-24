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

const replacements = {
  'bg-white': 'bg-white dark:bg-gray-800',
  'bg-gray-50': 'bg-gray-50 dark:bg-gray-900',
  'bg-gray-100': 'bg-gray-100 dark:bg-gray-700',
  'text-gray-900': 'text-gray-900 dark:text-white',
  'text-gray-800': 'text-gray-800 dark:text-gray-100',
  'text-gray-700': 'text-gray-700 dark:text-gray-300',
  'text-gray-600': 'text-gray-600 dark:text-gray-400',
  'text-gray-500': 'text-gray-500 dark:text-gray-400',
  'border-gray-100': 'border-gray-100 dark:border-gray-700',
  'border-gray-200': 'border-gray-200 dark:border-gray-700',
  'border-gray-300': 'border-gray-300 dark:border-gray-600',
  'divide-gray-100': 'divide-gray-100 dark:divide-gray-700',
  'divide-gray-200': 'divide-gray-200 dark:divide-gray-700',
  'ring-gray-200': 'ring-gray-200 dark:ring-gray-700',
  'ring-gray-300': 'ring-gray-300 dark:ring-gray-600'
};

vueFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  for (const [key, value] of Object.entries(replacements)) {
    // Only replace if it doesn't already contain the dark mode variant right next to it
    // We use a regex that matches the key but ensures it's not followed by the dark class
    const escapedValue = value.split(' ')[1].replace(/-/g, '\\-');
    const regex = new RegExp(`\\b${key}\\b(?!\\s+${escapedValue})`, 'g');
    content = content.replace(regex, value);
  }
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log('Added dark classes to:', file);
  }
});

console.log('Total files changed:', changedFiles);
