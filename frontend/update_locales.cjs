const fs = require('fs');
const path = require('path');

const arPath = path.join(__dirname, 'i18n', 'locales', 'ar.json');
const enPath = path.join(__dirname, 'i18n', 'locales', 'en.json');

let ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));
let en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

if (!ar.pos) ar.pos = {};
ar.pos.cart = "سلة البيع";
ar.pos.add_customer = "إضافة عميل جديد";
ar.pos.cart_empty = "السلة فارغة";
ar.pos.subtotal = "المجموع الفرعي";
ar.pos.discount = "الخصم";
ar.pos.tax = "الضريبة";
ar.pos.total = "الإجمالي";
ar.pos.cash = "نقدي";
ar.pos.card = "بطاقة";

if (!en.pos) en.pos = {};
en.pos.cart = "Cart";
en.pos.add_customer = "Add Customer";
en.pos.cart_empty = "Cart is empty";
en.pos.subtotal = "Subtotal";
en.pos.discount = "Discount";
en.pos.tax = "Tax";
en.pos.total = "Total";
en.pos.cash = "Cash";
en.pos.card = "Card";

ar.restaurant.select_provider = "اختر تطبيق التوصيل...";
en.restaurant.select_provider = "Select Provider...";

ar.restaurant.external_id_placeholder = "مثال: #12345";
en.restaurant.external_id_placeholder = "e.g., #12345";

ar.restaurant.select_table = "اختر الطاولة...";
en.restaurant.select_table = "Select Table...";

ar.restaurant.customer_name_optional = "اسم الزبون (اختياري)";
en.restaurant.customer_name_optional = "Customer Name (Optional)";

ar.restaurant.customer_name_placeholder = "اسم الزبون...";
en.restaurant.customer_name_placeholder = "Customer Name...";

ar.restaurant.takeaway_order = "طلب سفري (Takeaway)";
en.restaurant.takeaway_order = "Takeaway Order";

ar.restaurant.items_list = "قائمة الأصناف";
en.restaurant.items_list = "Items List";

ar.restaurant.confirm_delivery = "تثبيت وعرض الفاتورة";
en.restaurant.confirm_delivery = "Confirm & View Invoice";

fs.writeFileSync(arPath, JSON.stringify(ar, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');

console.log("Locales updated successfully.");
