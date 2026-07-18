const fs = require('fs');

const arPath = './frontend/i18n/locales/ar.json';
const enPath = './frontend/i18n/locales/en.json';

try {
  let arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
  let enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  // Ensure restaurant object exists
  if (!arData.restaurant) arData.restaurant = {};
  if (!enData.restaurant) enData.restaurant = {};

  // Add order_type
  arData.restaurant.order_type = "نوع الطلب";
  enData.restaurant.order_type = "Order Type";

  // Ensure common object exists
  if (!arData.common) arData.common = {};
  if (!enData.common) enData.common = {};

  // Add currency
  arData.common.currency = "ر.س";
  enData.common.currency = "SAR";

  fs.writeFileSync(arPath, JSON.stringify(arData, null, 2));
  fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
  
  console.log("Translations updated successfully.");
} catch (error) {
  console.error("Error updating translations:", error);
}
