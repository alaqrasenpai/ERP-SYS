const fs = require('fs');

const arPath = './frontend/i18n/locales/ar.json';
const enPath = './frontend/i18n/locales/en.json';

try {
  let arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
  let enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  arData.attendance_monitor.start_date = "تاريخ البداية";
  arData.attendance_monitor.end_date = "تاريخ النهاية";
  arData.attendance_monitor.search_employee = "بحث باسم الموظف";
  arData.attendance_monitor.date = "التاريخ";
  
  enData.attendance_monitor.start_date = "Start Date";
  enData.attendance_monitor.end_date = "End Date";
  enData.attendance_monitor.search_employee = "Search Employee";
  enData.attendance_monitor.date = "Date";

  fs.writeFileSync(arPath, JSON.stringify(arData, null, 2));
  fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
  
  console.log("Translations updated successfully.");
} catch (error) {
  console.error("Error updating translations:", error);
}
