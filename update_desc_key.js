const fs = require('fs');

const arPath = './frontend/i18n/locales/ar.json';
const enPath = './frontend/i18n/locales/en.json';

try {
  let arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
  let enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  arData.restaurant.completed_orders_desc = "قائمة بجميع الطلبات التي تم إنهاؤها ودفعها";
  enData.restaurant.completed_orders_desc = "A list of all successfully completed and paid orders";

  fs.writeFileSync(arPath, JSON.stringify(arData, null, 2));
  fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
  
  console.log("Translations updated successfully.");
} catch (error) {
  console.error("Error updating translations:", error);
}
