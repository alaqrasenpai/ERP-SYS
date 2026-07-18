const fs = require('fs');

const arPath = './frontend/i18n/locales/ar.json';
const enPath = './frontend/i18n/locales/en.json';

try {
  let arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
  let enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  arData.restaurant.completed_orders = "الطلبات المنجزة";
  enData.restaurant.completed_orders = "Completed Orders";

  arData.restaurant.order_number = "رقم الطلب";
  enData.restaurant.order_number = "Order No.";
  
  arData.restaurant.time = "الوقت";
  enData.restaurant.time = "Time";
  
  arData.restaurant.items = "الأصناف";
  enData.restaurant.items = "Items";
  
  arData.restaurant.total_amount = "المبلغ الإجمالي";
  enData.restaurant.total_amount = "Total Amount";

  fs.writeFileSync(arPath, JSON.stringify(arData, null, 2));
  fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
  
  console.log("Translations updated successfully.");
} catch (error) {
  console.error("Error updating translations:", error);
}
