const fs = require('fs');

const arPath = './frontend/i18n/locales/ar.json';
const enPath = './frontend/i18n/locales/en.json';

try {
  let arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
  let enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  arData.attendance_monitor.add_attendance = "إضافة دوام / حضور";
  arData.attendance_monitor.select_employee = "اختر الموظف";
  
  enData.attendance_monitor.add_attendance = "Add Attendance";
  enData.attendance_monitor.select_employee = "Select Employee";

  fs.writeFileSync(arPath, JSON.stringify(arData, null, 2));
  fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
  
  console.log("Translations updated successfully.");
} catch (error) {
  console.error("Error updating translations:", error);
}
