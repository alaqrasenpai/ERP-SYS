const fs = require('fs');

const arPath = './frontend/i18n/locales/ar.json';
const enPath = './frontend/i18n/locales/en.json';

try {
  let arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
  let enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  arData.restaurant.category_en = "الفئة (إنجليزي)";
  arData.restaurant.category_ar = "الفئة (عربي)";
  
  enData.restaurant.category_en = "Category (English)";
  enData.restaurant.category_ar = "Category (Arabic)";

  fs.writeFileSync(arPath, JSON.stringify(arData, null, 2));
  fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
  
  console.log("Category translations updated successfully.");
} catch (error) {
  console.error("Error updating translations:", error);
}
