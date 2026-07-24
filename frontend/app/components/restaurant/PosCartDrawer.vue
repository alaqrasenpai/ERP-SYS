<template>
  <div class="w-[420px] bg-white border-s border-gray-100 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] flex flex-col z-10 shrink-0">
    
    <!-- Cart Header -->
    <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
      <h2 class="font-black text-gray-900 flex items-center text-lg">
        <svg class="w-5 h-5 me-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        {{ t('pos.cart') }}
      </h2>
      <button class="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-emerald-500/20">
        {{ t('pos.add_customer') }}
      </button>
    </div>

    <!-- Order Details Setup -->
    <div class="p-4 border-b border-gray-100 space-y-4">
      <div v-if="orderType === 'Delivery'" class="space-y-3">
        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">{{ t('restaurant.delivery_provider') }}</label>
          <select :value="deliveryDetails.providerId" @input="$emit('update:provider', $event.target.value)" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 focus:ring-emerald-500 focus:border-emerald-500">
            <option value="">{{ t('restaurant.select_provider') }}</option>
            <option v-for="p in providers" :key="p._id" :value="p._id">
              {{ locale === 'ar' ? p.nameAr : p.nameEn }} ({{ p.commissionRate }}%)
            </option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">{{ t('restaurant.external_order_id') }}</label>
          <input :value="deliveryDetails.externalOrderId" @input="$emit('update:externalId', $event.target.value)" :placeholder="t('restaurant.external_id_placeholder')" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 focus:ring-emerald-500 focus:border-emerald-500">
        </div>
      </div>

      <div v-if="orderType === 'Dine-In'" class="space-y-3">
        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">{{ t('restaurant.table_number') }}</label>
          <select :value="tableId" @input="$emit('update:table', $event.target.value)" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 focus:ring-emerald-500 focus:border-emerald-500">
            <option value="">{{ t('restaurant.select_table') }}</option>
            <option v-for="t in tables" :key="t._id" :value="t._id">
              {{ t('restaurant.table') }} {{ t.tableNumber }} ({{ t.section }})
            </option>
          </select>
        </div>
      </div>
      <div v-if="orderType !== 'Delivery'" class="space-y-3">
        <div>
          <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">{{ t('restaurant.customer_name_optional') }}</label>
          <input :value="customerName" @input="$emit('update:customerName', $event.target.value)" :placeholder="t('restaurant.customer_name_placeholder')" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 focus:ring-emerald-500 focus:border-emerald-500">
        </div>
      </div>
      <div v-if="orderType === 'Takeaway'" class="text-xs text-center text-gray-500 font-bold py-2 bg-gray-50 rounded-lg">
        {{ t('restaurant.takeaway_order') }}
      </div>
    </div>

    <div class="px-4 py-2 bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 text-center">
      {{ t('restaurant.items_list') }} ({{ cart.length }})
    </div>

    <!-- Cart Items list -->
    <div class="flex-1 overflow-y-auto p-4 bg-gray-50/30">
      <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-gray-300">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border border-gray-200 border-dashed">
          <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
        <p class="font-bold text-sm">{{ t('pos.cart_empty') }}</p>
      </div>
      
      <ul v-else class="space-y-3">
        <li v-for="(item, index) in cart" :key="index" class="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div class="flex justify-between items-start mb-2">
            <div>
              <h4 class="text-sm font-bold text-gray-900 leading-tight">{{ locale === 'ar' ? item.nameAr : item.nameEn }}</h4>
              <div class="text-xs text-gray-400 mt-0.5">{{ item.price.toFixed(2) }} {{ useCookie('erp_currency').value || 'SAR' }}</div>
            </div>
            <button @click="$emit('update:qty', index, -1000)" class="text-gray-300 hover:text-rose-500 transition-colors p-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <input v-model="item.notes" type="text" :placeholder="t('restaurant.add_notes')" class="w-full text-xs px-3 py-1.5 bg-gray-50/50 border border-gray-100 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 mb-2 text-gray-600">

          <div class="flex justify-between items-center mt-auto pt-2 border-t border-gray-50">
            <div class="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-100">
              <button @click="$emit('update:qty', index, -1)" class="w-7 h-7 flex items-center justify-center bg-white rounded-md text-gray-500 font-bold shadow-sm hover:text-emerald-600">-</button>
              <span class="w-10 text-center text-xs font-black">{{ item.quantity }}</span>
              <button @click="$emit('update:qty', index, 1)" class="w-7 h-7 flex items-center justify-center bg-white rounded-md text-gray-500 font-bold shadow-sm hover:text-emerald-600">+</button>
            </div>
            <div class="font-black text-emerald-600 text-sm">
              {{ (item.price * item.quantity).toFixed(2) }} {{ useCookie('erp_currency').value || 'SAR' }}
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Totals & Checkout -->
    <div class="bg-white p-5 border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] shrink-0">
      <div class="space-y-3 mb-6">
        <div class="flex justify-between items-center text-sm">
          <span class="text-gray-500 font-bold">{{ t('pos.subtotal') }}:</span>
          <span class="font-bold text-gray-900">{{ subTotal.toFixed(2) }} {{ useCookie('erp_currency').value || 'SAR' }}</span>
        </div>
        
        <div class="flex justify-between items-center text-sm">
          <span class="text-gray-500 font-bold flex items-center">
            {{ t('pos.discount') }}:
          </span>
          <div class="w-24 relative">
            <input type="number" :value="discount" @input="$emit('update:discount', Number($event.target.value))" min="0" class="w-full text-end px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-900">
            <span class="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">{{ useCookie('erp_currency').value || 'SAR' }}</span>
          </div>
        </div>

        <div class="flex justify-between items-center text-sm">
          <span class="text-gray-500 font-bold text-xs">{{ t('pos.tax') }} ({{ taxRate }}%):</span>
          <span class="font-bold text-gray-500 text-xs">{{ tax.toFixed(2) }} {{ useCookie('erp_currency').value || 'SAR' }}</span>
        </div>
        
        <div class="pt-4 border-t border-gray-100 flex justify-between items-end">
          <span class="text-base font-black text-gray-900">{{ t('pos.total') }}</span>
          <span class="text-2xl font-black text-emerald-500">{{ grandTotal.toFixed(2) }} <span class="text-sm text-emerald-600/60">{{ useCookie('erp_currency').value || 'SAR' }}</span></span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-3" v-if="orderType !== 'Delivery'">
        <button @click="$emit('checkout', 'Cash')" :disabled="cart.length === 0" class="py-3.5 bg-emerald-500 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-black shadow-sm hover:bg-emerald-600 transition flex items-center justify-center gap-2">
          {{ t('pos.cash') }}
        </button>
        <button @click="$emit('checkout', 'Card')" :disabled="cart.length === 0" class="py-3.5 bg-indigo-500 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-black shadow-sm hover:bg-indigo-600 transition flex items-center justify-center gap-2">
          {{ t('pos.card') }}
        </button>
      </div>
      <button v-if="orderType === 'Delivery'" @click="$emit('checkout', 'Aggregator Credit')" :disabled="cart.length === 0" class="w-full py-3.5 bg-[#81C7A1] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-black shadow-lg hover:bg-emerald-400 transition flex items-center justify-center">
        {{ t('restaurant.confirm_delivery') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()

defineProps({
  cart: Array,
  orderType: String,
  tableId: String,
  customerName: String,
  deliveryDetails: Object,
  tables: Array,
  providers: Array,
  subTotal: Number,
  discount: Number,
  tax: Number,
  taxRate: Number,
  grandTotal: Number
})

defineEmits(['checkout', 'update:qty', 'update:table', 'update:customerName', 'update:provider', 'update:externalId', 'update:discount'])
</script>
