const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'i18n', 'locales', 'en.json');
const arPath = path.join(__dirname, 'i18n', 'locales', 'ar.json');

const en = JSON.parse(fs.readFileSync(enPath));
en.landing = {
  title: "The Ultimate",
  title_highlight: "Enterprise",
  title_suffix: "Management System",
  subtitle: "Unify your HR, Accounting, Inventory, POS, and Restaurant operations in one powerful, cloud-based platform designed for scale.",
  access_workspace: "Access Your Workspace",
  features_title: "Everything you need to grow",
  features_subtitle: "Modular architecture means you only use what you need.",
  feat1_title: "Smart Accounting",
  feat1_desc: "Automated general ledgers, trial balances, and financial reporting with multi-currency support.",
  feat2_title: "Modern HRMS",
  feat2_desc: "Manage payroll, attendance, leave requests, and employee structures seamlessly.",
  feat3_title: "Retail & POS",
  feat3_desc: "Lightning-fast point of sale with offline capabilities, shift management, and barcode scanning.",
  copyright: "© {year} ERPSYS. All rights reserved.",
  developed_by: "Developed by",
  client_login: "Client Login",
  features_link: "Features",
  modules_link: "Modules",
  contact_link: "Contact",
  prompt_msg: "Enter your Store ID / Workspace Name:"
};

const ar = JSON.parse(fs.readFileSync(arPath));
ar.landing = {
  title: "نظام إدارة",
  title_highlight: "المؤسسات",
  title_suffix: "الأقوى والأشمل",
  subtitle: "قم بتوحيد عمليات الموارد البشرية، المحاسبة، المخزون، نقاط البيع، والمطاعم في منصة سحابية واحدة قوية ومصممة للتوسع.",
  access_workspace: "الدخول لمساحة العمل",
  features_title: "كل ما تحتاجه لنمو أعمالك",
  features_subtitle: "بنية برمجية ذكية تتيح لك استخدام الوحدات التي تحتاجها فقط.",
  feat1_title: "محاسبة ذكية",
  feat1_desc: "قيود يومية مؤتمتة، موازين مراجعة، وتقارير مالية مع دعم تعدد العملات.",
  feat2_title: "نظام موارد بشرية حديث",
  feat2_desc: "إدارة الرواتب، الحضور والانصراف، الإجازات، وهيكلة الموظفين بكل سلاسة.",
  feat3_title: "نقاط البيع والتجزئة",
  feat3_desc: "نقاط بيع فائقة السرعة مع إمكانية العمل أوفلاين، إدارة الورديات، ومسح الباركود.",
  copyright: "© {year} ERPSYS. جميع الحقوق محفوظة.",
  developed_by: "تم التطوير بواسطة",
  client_login: "دخول العملاء",
  features_link: "المميزات",
  modules_link: "الوحدات",
  contact_link: "اتصل بنا",
  prompt_msg: "أدخل معرف المتجر / اسم مساحة العمل:"
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(arPath, JSON.stringify(ar, null, 2));

console.log('Translations added successfully.');
