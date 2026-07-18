const fs = require('fs');

const arPath = './frontend/i18n/locales/ar.json';
const enPath = './frontend/i18n/locales/en.json';

const restaurantAr = {
  "tables_grid": "طاولات المطعم",
  "description": "إدارة وترتيب طاولات المطعم",
  "add_table": "إضافة طاولة",
  "edit_table": "تعديل طاولة",
  "table_number": "رقم / اسم الطاولة",
  "capacity": "السعة (أشخاص)",
  "section": "القسم",
  "status": "الحالة",
  "available": "متاحة",
  "occupied": "مشغولة",
  "reserved": "محجوزة",
  "cancel": "إلغاء",
  "save": "حفظ",
  "saving": "جاري الحفظ...",
  "no_tables": "لا توجد طاولات. أضف بعضها للبدء.",
  "sections_management": "إدارة الأقسام",
  "sections_desc": "إدارة مناطق وأقسام المطعم",
  "add_section": "إضافة قسم",
  "edit_section": "تعديل قسم",
  "section_name": "اسم القسم",
  "section_description": "الوصف",
  "no_sections": "لا توجد أقسام. أضف بعضها للبدء.",
  "select_section": "اختر القسم",
  "main_dining": "الصالة الرئيسية",
  "terrace": "التراس",
  "vip": "كبار الشخصيات (VIP)"
};

const restaurantEn = {
  "tables_grid": "Tables Grid",
  "description": "Manage restaurant tables and layout",
  "add_table": "Add Table",
  "edit_table": "Edit Table",
  "table_number": "Table Number / Name",
  "capacity": "Capacity",
  "section": "Section",
  "status": "Status",
  "available": "Available",
  "occupied": "Occupied",
  "reserved": "Reserved",
  "cancel": "Cancel",
  "save": "Save",
  "saving": "Saving...",
  "no_tables": "No tables found. Add some to get started.",
  "sections_management": "Sections Management",
  "sections_desc": "Manage restaurant sections and areas",
  "add_section": "Add Section",
  "edit_section": "Edit Section",
  "section_name": "Section Name",
  "section_description": "Description",
  "no_sections": "No sections found. Add some to get started.",
  "select_section": "Select Section",
  "main_dining": "Main Dining",
  "terrace": "Terrace",
  "vip": "VIP"
};

try {
  let arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
  let enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  arData.restaurant = restaurantAr;
  enData.restaurant = restaurantEn;

  fs.writeFileSync(arPath, JSON.stringify(arData, null, 2));
  fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
  
  console.log("Translations updated successfully.");
} catch (error) {
  console.error("Error updating translations:", error);
}
