const fs = require('fs');

const arPath = './frontend/i18n/locales/ar.json';
const enPath = './frontend/i18n/locales/en.json';

const newKeysAr = {
  "price": "السعر"
};

const newKeysEn = {
  "price": "Price"
};

try {
  let arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
  let enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  arData.restaurant = { ...arData.restaurant, ...newKeysAr };
  enData.restaurant = { ...enData.restaurant, ...newKeysEn };

  fs.writeFileSync(arPath, JSON.stringify(arData, null, 2));
  fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
  
  console.log("Price translation added successfully.");
} catch (error) {
  console.error("Error updating translations:", error);
}
