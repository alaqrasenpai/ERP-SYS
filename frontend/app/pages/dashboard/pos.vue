<template>
  <div class="h-[calc(100vh-2rem)] flex flex-col bg-gray-50 font-sans" dir="rtl">
    
    <!-- Top Header -->
    <div class="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center shadow-sm z-10 shrink-0">
      <!-- Title Area (Right in RTL) -->
      <div class="flex items-center gap-4">
        <div>
          <h1 class="text-2xl font-black text-gray-900 tracking-tight">{{ $t('pos.terminal') }}</h1>
          <p class="text-xs font-bold text-gray-400 mt-0.5">{{ $t('pos.open_shift_prompt', 'فتح شاشة البيع') }}</p>
        </div>
        <div v-if="shiftOpen" class="px-3 py-1 bg-secondary-50 border border-secondary-100 text-secondary-600 rounded-full text-xs font-black">
          {{ $t('pos.shift_active', 'وردية نشطة') }}
        </div>
      </div>
      
      <!-- Actions Area (Left in RTL) -->
      <div class="flex items-center gap-4">
        <!-- Search -->
        <div class="relative w-80">
          <div class="absolute inset-y-0 right-0 pe-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input v-model="searchQuery" type="text" :placeholder="$t('pos.search_placeholder', 'البحث في المخزن...')" class="block w-full pe-10 ps-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-shadow bg-gray-50 focus:bg-white text-gray-700">
        </div>
        
        <!-- Shift Actions -->
        <button v-if="!shiftOpen" @click="openShift" class="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors shadow-sm text-sm">
          {{ $t('pos.open_shift') }}
        </button>
        <button v-if="shiftOpen" @click="closeShift" class="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold rounded-xl transition-colors text-sm">
          {{ $t('pos.close_shift') }}
        </button>
      </div>
    </div>

    <!-- Filter / Sub header -->
    <div class="bg-gray-50/80 border-b border-gray-100 px-6 py-2 flex justify-between items-center shrink-0">
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-gray-500">{{ $t('pos.filter', 'تصفية:') }}</span>
          <select class="text-sm font-bold bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-0 focus:border-secondary-500 text-gray-700">
            <option>{{ $t('pos.all', 'الكل') }}</option>
          </select>
        </div>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked class="rounded border-gray-300 text-secondary-500 focus:ring-secondary-500 w-4 h-4">
          <span class="text-xs font-bold text-gray-600">{{ $t('pos.active', 'نشط') }}</span>
        </label>
      </div>
      <div class="text-xs font-bold text-gray-500">
        {{ $t('pos.total_count', 'الإجمالي:') }} <span class="text-gray-900">{{ filteredProducts.length }}</span>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden relative">
      
      <!-- Cart Sidebar (Right side in RTL) -->
      <div class="w-[420px] bg-white border-e border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col z-10 shrink-0">
        
        <!-- Cart Header -->
        <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 class="font-black text-gray-900 flex items-center text-lg">
            <svg class="w-5 h-5 me-2 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            {{ $t('pos.cart', 'سلة البيع') }}
          </h2>
          <button @click="showAddCustomerModal = true" class="px-4 py-1.5 bg-secondary-500 hover:bg-secondary-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-secondary-500/20">
            {{ $t('pos.add_customer', 'إضافة عميل جديد') }}
          </button>
        </div>

        <!-- Customer & Payment Setup -->
        <div class="p-4 border-b border-gray-100 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">{{ $t('pos.customer', 'العميل') }}</label>
              <select v-model="selectedCustomer" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 focus:ring-secondary-500 focus:border-secondary-500">
                <option :value="null">{{ $t('pos.search_customer', 'بحث عن عميل...') }}</option>
                <option v-for="c in customers" :key="c._id" :value="c._id">{{ c.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">{{ $t('pos.payment_method', 'وسيلة الدفع') }}</label>
              <select v-model="paymentMethod" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 focus:ring-secondary-500 focus:border-secondary-500">
                <option value="Cash">{{ $t('pos.cash', 'دفع نقدي') }}</option>
                <option value="Card">{{ $t('pos.card', 'دفع إلكتروني') }}</option>
                <option value="Debt">{{ $t('pos.debt', 'آجل / ذمم') }}</option>
                <option value="Installment">{{ $t('pos.installment', 'أقساط') }}</option>
                <option value="Check">{{ $t('pos.check', 'شيك') }}</option>
              </select>
            </div>
          </div>
          
          <!-- Conditional Details -->
          <div v-if="paymentMethod === 'Check'" class="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2">
            <input v-model="checkDetails.checkNumber" type="text" :placeholder="$t('pos.check_number', 'رقم الشيك')" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            <input v-model="checkDetails.bankName" type="text" :placeholder="$t('pos.bank_name', 'اسم البنك')" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            <input v-model="checkDetails.dueDate" type="date" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
          </div>
          <div v-if="paymentMethod === 'Installment'" class="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-[10px] font-bold text-gray-400">{{ $t('pos.down_payment') }}</label>
                <input v-model="installmentDetails.downPayment" type="number" min="0" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              </div>
              <div>
                <label class="text-[10px] font-bold text-gray-400">{{ $t('pos.number_of_months') }}</label>
                <input v-model="installmentDetails.months" type="number" min="1" max="60" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              </div>
            </div>
            <div class="pt-2 border-t border-gray-100">
              <label class="flex items-center gap-2 cursor-pointer mb-2">
                <input type="checkbox" v-model="installmentDetails.backedByChecks" class="rounded border-gray-300 text-secondary-500 focus:ring-secondary-500 w-4 h-4">
                <span class="text-xs font-bold text-gray-600">{{ $t('pos.backed_by_checks', 'تسجيل شيكات للأقساط') }}</span>
              </label>
              <div v-if="installmentDetails.backedByChecks" class="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label class="text-[10px] font-bold text-gray-400">{{ $t('pos.bank_name') }}</label>
                  <input v-model="installmentDetails.bankName" type="text" :placeholder="$t('pos.bank_name_placeholder', 'مثال: الراجحي')" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                </div>
                <div>
                  <label class="text-[10px] font-bold text-gray-400">{{ $t('pos.first_check_number', 'رقم أول شيك') }}</label>
                  <input v-model="installmentDetails.firstCheckNumber" type="text" placeholder="10001" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="px-4 py-2 bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 text-center">
          {{ $t('pos.items_list', 'قائمة الأصناف') }} ({{ cart.length }})
        </div>

        <!-- Cart Items list -->
        <div class="flex-1 overflow-y-auto p-4 bg-gray-50/30">
          <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-gray-300">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border border-gray-200 border-dashed">
              <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <p class="font-bold text-sm">{{ $t('pos.cart_empty', 'لم يتم إضافة أصناف بعد') }}</p>
          </div>
          
          <ul v-else class="space-y-3">
            <li v-for="(item, index) in cart" :key="item.productId" class="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h4 class="text-sm font-bold text-gray-900 leading-tight">{{ item.name }}</h4>
                  <div class="text-xs text-gray-400 mt-0.5">{{ item.unitPrice.toFixed(2) }} {{ currency }}</div>
                </div>
                <button @click="removeFromCart(index)" class="text-gray-300 hover:text-rose-500 transition-colors p-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div class="flex justify-between items-center mt-auto pt-2 border-t border-gray-50">
                <div class="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                  <button @click="updateQuantity(index, -1)" class="w-7 h-7 flex items-center justify-center bg-white rounded-md text-gray-500 font-bold shadow-sm hover:text-secondary-600">-</button>
                  <input type="number" v-model.number="item.quantity" @change="recalculateCart" class="w-10 text-center text-xs font-black bg-transparent border-none focus:ring-0 p-0">
                  <button @click="updateQuantity(index, 1)" class="w-7 h-7 flex items-center justify-center bg-white rounded-md text-gray-500 font-bold shadow-sm hover:text-secondary-600">+</button>
                </div>
                <div class="font-black text-secondary-600 text-sm">
                  {{ item.totalPrice.toFixed(2) }} {{ currency }}
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Totals & Checkout -->
        <div class="bg-white p-5 border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] shrink-0">
          <div class="space-y-3 mb-6">
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500 font-bold">{{ $t('pos.subtotal', 'المجموع:') }}</span>
              <span class="font-bold text-gray-900">{{ subTotal.toFixed(2) }} {{ currency }}</span>
            </div>
            
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500 font-bold flex items-center">
                {{ $t('pos.discount', 'الخصم:') }}
              </span>
              <div class="w-24 relative">
                <input type="number" v-model.number="discount" @input="recalculateCart" min="0" class="w-full text-end pe-8 ps-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500 text-gray-900">
                <span class="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">{{ currency }}</span>
              </div>
            </div>

            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500 font-bold text-xs">{{ $t('pos.tax', 'الضريبة') }} ({{ taxRate }}%):</span>
              <span class="font-bold text-gray-500 text-xs">{{ taxAmount.toFixed(2) }} {{ currency }}</span>
            </div>
            
            <div class="pt-4 border-t border-gray-100 flex justify-between items-end">
              <span class="text-base font-black text-gray-900">{{ $t('pos.total', 'الإجمالي النهائي') }}</span>
              <span class="text-2xl font-black text-secondary-500">{{ grandTotal.toFixed(2) }} <span class="text-sm text-secondary-600/60">{{ currency }}</span></span>
            </div>
          </div>

          <button @click="checkout" :disabled="cart.length === 0 || !shiftOpen || loading" 
                  class="w-full py-4 bg-[#81C7A1] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl text-base font-black tracking-wide shadow-lg hover:bg-secondary-400 transition-colors flex justify-center items-center">
            <svg v-if="!loading" class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <svg v-else class="animate-spin -ms-1 me-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ $t('pos.confirm_delivery', 'تثبيت وعرض الفاتورة') }}
          </button>
        </div>
      </div>

      <!-- Products Grid (Left side in RTL) -->
      <div class="flex-1 overflow-y-auto p-6 relative">
        <div v-if="!shiftOpen" class="absolute inset-0 z-20 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center text-gray-500">
          <svg class="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          <p class="text-xl font-black text-gray-400">{{ $t('pos.shift_closed_msg', 'الرجاء فتح وردية للبدء بالبيع') }}</p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          <div v-for="product in filteredProducts" :key="product._id" @click="addToCart(product)" 
               class="bg-white rounded-2xl border border-gray-200 p-5 cursor-pointer hover:border-secondary-300 hover:shadow-lg transition-all group flex flex-col relative h-[180px]" 
               :class="{ 'opacity-50 pointer-events-none grayscale': product.stockQuantity <= 0 }">
            
            <!-- Top star icon -->
            <div class="absolute top-3 left-3">
              <svg class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            </div>
            
            <!-- 3D Box Icon -->
            <div class="w-12 h-12 mx-auto mb-3 text-secondary-500 group-hover:scale-110 transition-transform">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
            
            <div class="text-center flex-1 flex flex-col justify-end">
              <h3 class="text-sm font-black text-gray-900 leading-tight mb-1">{{ product.name }}</h3>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{{ product.category?.nameEn || product.category?.nameAr || 'General' }}</p>
              
              <div class="text-base font-black text-secondary-600 mb-2">{{ product.unitPrice.toFixed(2) }} {{ currency }}</div>
              
              <div class="mt-auto flex justify-center">
                <span class="text-[10px] font-black px-3 py-1 rounded-full border" 
                      :class="product.stockQuantity > 5 ? 'bg-secondary-50 text-secondary-600 border-secondary-100' : (product.stockQuantity > 0 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100')">
                  {{ product.stockQuantity > 0 ? product.stockQuantity + ' ' + $t('pos.in_stock', 'في المخزن') : $t('pos.out_of_stock', 'نفذت الكمية') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Hidden Receipt for Printing -->
    <div id="receipt-area" class="hidden print:block w-80 mx-auto font-mono text-sm text-black relative bg-white">
      <div class="text-center mb-4">
        <h2 class="text-xl font-bold">{{ storeName }}</h2>
        <p v-if="address">{{ address }}</p>
        <p v-if="phone">Tel: {{ phone }}</p>
        <p v-if="receiptHeader" class="mt-2 whitespace-pre-line">{{ receiptHeader }}</p>
      </div>
      
      <div v-if="lastOrder" class="border-t border-b border-dashed border-black py-2 mb-2">
        <div class="flex justify-between"><span>Order:</span> <span>{{ lastOrder.orderNumber }}</span></div>
        <div class="flex justify-between"><span>Date:</span> <span>{{ new Date(lastOrder.createdAt).toLocaleString() }}</span></div>
        <div class="flex justify-between"><span>Method:</span> <span>{{ lastOrder.paymentMethod }}</span></div>
      </div>

      <table v-if="lastOrder" class="w-full mb-2">
        <thead>
          <tr class="border-b border-dashed border-black">
            <th class="text-start py-1">Item</th>
            <th class="text-end py-1">Qty</th>
            <th class="text-end py-1">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in lastOrder.items" :key="item.productId">
            <td class="py-1">{{ item.name }}</td>
            <td class="text-end py-1">{{ item.quantity }}</td>
            <td class="text-end py-1">{{ item.totalPrice.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="lastOrder" class="border-t border-dashed border-black pt-2 space-y-1">
        <div class="flex justify-between"><span>Subtotal:</span> <span>{{ currency }}{{ lastOrder.subTotal.toFixed(2) }}</span></div>
        <div v-if="lastOrder.discount > 0" class="flex justify-between"><span>Discount:</span> <span>-{{ currency }}{{ lastOrder.discount.toFixed(2) }}</span></div>
        <div class="flex justify-between"><span>Tax ({{ taxRate }}%):</span> <span>{{ currency }}{{ lastOrder.tax.toFixed(2) }}</span></div>
        <div class="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-dashed border-black">
          <span>TOTAL:</span> <span>{{ currency }}{{ lastOrder.grandTotal.toFixed(2) }}</span>
        </div>
      </div>
      
      <div class="text-center mt-6 text-xs whitespace-pre-line">
        <p>{{ receiptFooter }}</p>
      </div>
    </div>

    <!-- Add Customer Modal -->
    <div v-if="showAddCustomerModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden dir-rtl">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-lg font-black text-gray-900">{{ $t('pos.add_customer_title', 'إضافة عميل جديد') }}</h3>
          <a href="/" class="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-secondary-600 hover:border-secondary-200 transition">
            <svg class="w-6 h-6 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </a>
        </div>
        <div class="p-6">
          <form @submit.prevent="quickAddCustomer" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">{{ $t('crm.full_name', 'الاسم الكامل') }}</label>
              <input v-model="customerForm.name" type="text" required class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 font-bold bg-gray-50 focus:bg-white transition-colors">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">{{ $t('crm.phone', 'رقم الهاتف') }}</label>
                <input v-model="customerForm.phone" type="text" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 font-bold bg-gray-50 focus:bg-white transition-colors">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">{{ $t('crm.email', 'البريد الإلكتروني') }}</label>
                <input v-model="customerForm.email" type="email" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 font-bold bg-gray-50 focus:bg-white transition-colors">
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-6">
              <button type="button" @click="showAddCustomerModal = false" class="px-5 py-3 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-colors">{{ $t('crm.cancel', 'إلغاء') }}</button>
              <button type="submit" class="px-5 py-3 bg-secondary-500 text-white rounded-xl font-black hover:bg-secondary-600 shadow-lg shadow-secondary-500/20 transition-all">{{ $t('crm.save_customer', 'حفظ العميل') }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// REMOVED layout: false so it embeds in dashboard
definePageMeta({ 
  middleware: ['auth', 'module-guard'],
  requiredModule: 'pos'
})

const { $api } = useNuxtApp()
const products = ref([])
const searchQuery = ref('')
const loading = ref(false)

const shiftOpen = ref(false)
const currentShiftId = ref(null)

const cart = ref([])
const taxRate = ref(15)
const currency = ref('ريال') // Match UI
const storeName = ref('STORE NAME')
const address = ref('')
const phone = ref('')
const receiptHeader = ref('')
const receiptFooter = ref('Thank you for your purchase!')
const paymentMethod = ref('Cash')

const subTotal = ref(0)
const discount = ref(0)
const taxAmount = ref(0)
const grandTotal = ref(0)

const lastOrder = ref(null)
const customers = ref([])
const selectedCustomer = ref(null)
const checkDetails = ref({ checkNumber: '', bankName: '', dueDate: '' })
const installmentDetails = ref({ downPayment: 0, months: 3 })

const showAddCustomerModal = ref(false)
const customerForm = ref({ name: '', phone: '', email: '' })

const filteredProducts = computed(() => {
  let list = products.value.filter(p => p.isForSale !== false)
  if (!searchQuery.value) return list
  const q = searchQuery.value.toLowerCase()
  return list.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.sku.toLowerCase().includes(q) || 
    (p.barcode && p.barcode.toLowerCase().includes(q))
  )
})

const fetchProducts = async () => {
  try {
    const settings = await $api('/settings')
    if (settings) {
      taxRate.value = settings.taxRate !== undefined ? settings.taxRate : 15
      currency.value = settings.currency || 'ريال'
      storeName.value = settings.storeName || 'STORE NAME'
      address.value = settings.address || ''
      phone.value = settings.phone || ''
      receiptHeader.value = settings.receiptHeader || ''
      receiptFooter.value = settings.receiptFooter || 'Thank you for your purchase!'
    }
    products.value = await $api('/inventory/products')
    customers.value = await $api('/customers')
  } catch (error) {
    console.error('Failed to fetch data', error)
  }
}

const quickAddCustomer = async () => {
  try {
    const newCustomer = await $api('/customers', {
      method: 'POST',
      body: customerForm.value
    })
    customers.value = await $api('/customers')
    selectedCustomer.value = newCustomer._id
    customerForm.value = { name: '', phone: '', email: '' }
    showAddCustomerModal.value = false
  } catch (error) {
    alert('Failed to add customer')
  }
}

const checkShiftStatus = async () => {
  try {
    const shift = await $api('/pos/shifts/current');
    if (shift) {
      shiftOpen.value = true;
      currentShiftId.value = shift._id;
    } else {
      shiftOpen.value = false;
      currentShiftId.value = null;
    }
  } catch (error) {
    console.error('Failed to check shift status', error);
  }
}

const openShift = async () => {
  const amount = prompt("Enter opening cash balance:", "0")
  if (amount === null) return
  
  try {
    const shift = await $api('/pos/shifts/open', {
      method: 'POST',
      body: { openingBalance: Number(amount) }
    })
    currentShiftId.value = shift._id
    shiftOpen.value = true
  } catch (error) {
    alert(error.data?.message || 'Failed to open shift')
  }
}

const closeShift = async () => {
  const amount = prompt("Enter closing cash balance:", "0")
  if (amount === null) return
  
  if(!currentShiftId.value) {
    alert("No shift ID found.")
    return
  }
  
  try {
    await $api(`/pos/shifts/close/${currentShiftId.value}`, {
      method: 'POST',
      body: { closingBalance: Number(amount) }
    })
    shiftOpen.value = false
    currentShiftId.value = null
  } catch (error) {
    alert(error.data?.message || 'Failed to close shift')
  }
}

const addToCart = (product) => {
  if (product.stockQuantity <= 0) return
  
  const existing = cart.value.find(item => item.productId === product._id)
  if (existing) {
    if (existing.quantity >= product.stockQuantity) {
      return
    }
    existing.quantity++
    existing.totalPrice = existing.quantity * existing.unitPrice
  } else {
    cart.value.push({
      productId: product._id,
      name: product.name,
      unitPrice: product.unitPrice,
      quantity: 1,
      totalPrice: product.unitPrice,
      stockLimit: product.stockQuantity // For validation
    })
  }
  recalculateCart()
}

const updateQuantity = (index, delta) => {
  const item = cart.value[index]
  const newQty = item.quantity + delta
  
  if (newQty <= 0) {
    removeFromCart(index)
    return
  }
  
  if (newQty > item.stockLimit) {
    return
  }
  
  item.quantity = newQty
  item.totalPrice = item.quantity * item.unitPrice
  recalculateCart()
}

const removeFromCart = (index) => {
  cart.value.splice(index, 1)
  recalculateCart()
}

const recalculateCart = () => {
  cart.value.forEach(item => {
    if (item.quantity < 1) item.quantity = 1
    if (item.quantity > item.stockLimit) item.quantity = item.stockLimit
    item.totalPrice = item.quantity * item.unitPrice
  })
  
  subTotal.value = cart.value.reduce((sum, item) => sum + item.totalPrice, 0)
  const discounted = Math.max(0, subTotal.value - (discount.value || 0))
  taxAmount.value = discounted * (taxRate.value / 100)
  grandTotal.value = discounted + taxAmount.value
}

const checkout = async () => {
  if (cart.value.length === 0) return
  
  if (['Debt', 'Installment', 'Check'].includes(paymentMethod.value) && !selectedCustomer.value) {
    alert(`الرجاء تحديد عميل لطريقة الدفع هذه.`)
    return
  }
  
  loading.value = true
  try {
    const payload = {
      items: cart.value.map(i => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice
      })),
      subTotal: subTotal.value,
      discount: discount.value || 0,
      tax: taxAmount.value,
      grandTotal: grandTotal.value,
      paymentMethod: paymentMethod.value,
      customerId: selectedCustomer.value
    }
    
    if (paymentMethod.value === 'Check') payload.checkDetails = checkDetails.value
    if (paymentMethod.value === 'Installment') payload.installmentDetails = installmentDetails.value

    lastOrder.value = await $api('/pos/orders', {
      method: 'POST',
      body: payload
    })
    
    // Clear Cart
    cart.value = []
    discount.value = 0
    recalculateCart()
    
    // Refresh products to get updated stock
    await fetchProducts()
    
    // Print Receipt
    setTimeout(() => {
      window.print()
    }, 500)
    
  } catch (error) {
    alert(error.data?.message || 'Checkout failed')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProducts()
  checkShiftStatus()
})
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #receipt-area, #receipt-area * {
    visibility: visible;
  }
  #receipt-area {
    position: absolute;
    left: 0;
    top: 0;
  }
}
</style>
