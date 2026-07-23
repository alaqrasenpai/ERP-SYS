const fs = require('fs');
const path = require('path');

const arPath = path.join(__dirname, 'i18n', 'locales', 'ar.json');
const enPath = path.join(__dirname, 'i18n', 'locales', 'en.json');

let ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));
let en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

if (!ar.hr) ar.hr = {};
if (!en.hr) en.hr = {};

ar.hr.pending_attendance_title = "البصمات العالقة (Pending Attendance)";
en.hr.pending_attendance_title = "Pending Attendance";

ar.hr.pending_attendance_desc = "عرض بصمات الموظفين غير المرتبطة بموظف محدد وربطها يدوياً.";
en.hr.pending_attendance_desc = "View employee fingerprint logs not linked to a specific employee and link them manually.";

ar.hr.device = "الجهاز";
en.hr.device = "Device";

ar.hr.fingerprint_id = "رقم البصمة";
en.hr.fingerprint_id = "Fingerprint ID";

ar.hr.record_time = "وقت التسجيل";
en.hr.record_time = "Record Time";

ar.hr.link_employee = "ربط بموظف";
en.hr.link_employee = "Link Employee";

ar.hr.no_pending = "لا توجد بصمات عالقة.";
en.hr.no_pending = "No pending attendances available currently.";

ar.hr.link_title = "ربط البصمة بموظف";
en.hr.link_title = "Link Fingerprint to Employee";

ar.hr.link_desc = "أنت تقوم بربط البصمة رقم {id}. سيتم تعيين هذا الرقم للموظف المختار.";
en.hr.link_desc = "You are linking fingerprint #{id}. This ID will be assigned to the selected employee.";

ar.hr.select_employee_label = "اختر الموظف";
en.hr.select_employee_label = "Select Employee";

ar.hr.select_employee_default = "-- اختر موظف --";
en.hr.select_employee_default = "-- Select Employee --";

ar.hr.confirm_link = "تأكيد الربط";
en.hr.confirm_link = "Confirm Link";

ar.hr.linking = "جاري الربط...";
en.hr.linking = "Linking...";

ar.hr.no_shifts_available = "لا يوجد ورديات عمل متوفرة حالياً.";
en.hr.no_shifts_available = "No shifts available currently.";

fs.writeFileSync(arPath, JSON.stringify(ar, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');

console.log("HR Locales updated successfully.");
