<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">

    <!-- Main Content Area -->
    <div class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
      
      <!-- Left Column: Core Dashboard -->
      <div class="flex-1 flex flex-col space-y-8">
        
        <!-- Header -->
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ $t('general.dashboard') }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ $t('dashboard.subtitle', 'Real-time ecosystem metrics and unified controls.') }}</p>
        </div>

        <div v-if="loading" class="flex-1 flex items-center justify-center">
          <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>

        <template v-else>
          <!-- Quick Stat Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            <!-- Revenue -->
            <div class="group bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div class="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-emerald-100/40 to-emerald-50/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500 pointer-events-none"></div>
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm border border-emerald-100/50">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h4 class="text-sm font-bold text-gray-500">{{ $t('dashboard.todays_revenue') }}</h4>
              </div>
              <div class="mt-2 relative z-10">
                <h3 class="text-4xl font-black text-gray-900 tracking-tight">{{ metrics.todayRevenue.toFixed(2) }} <span class="text-xl ms-1 text-gray-400">{{ $t('common.currency') }}</span></h3>
              </div>
              <div class="mt-4 pt-4 border-t border-gray-100/80 flex items-center justify-between">
                <span class="text-xs font-bold text-gray-500">{{ $t('dashboard.month') }}</span>
                <span class="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{{ metrics.monthRevenue.toFixed(2) }} {{ $t('common.currency') }}</span>
              </div>
            </div>

            <!-- Low Stock -->
            <div class="group bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div class="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-red-100/40 to-red-50/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500 pointer-events-none"></div>
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2.5 bg-red-50 text-red-600 rounded-xl shadow-sm border border-red-100/50">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h4 class="text-sm font-bold text-gray-500">{{ $t('dashboard.low_stock') }}</h4>
              </div>
              <div class="mt-2 relative z-10">
                <h3 class="text-4xl font-black tracking-tight" :class="metrics.lowStockCount > 0 ? 'text-red-600' : 'text-gray-900'">{{ metrics.lowStockCount }}</h3>
              </div>
              <div class="mt-4 pt-4 border-t border-gray-100/80">
                <NuxtLink to="/dashboard/inventory" class="group/link text-xs font-bold text-gray-600 hover:text-red-600 transition-colors flex items-center justify-between">
                  {{ $t('dashboard.view_inventory') }} 
                  <svg class="w-4 h-4 transform group-hover/link:translate-x-1 rtl:group-hover/link:-translate-x-1 rtl:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </NuxtLink>
              </div>
            </div>

            <!-- HR Stats -->
            <div class="group bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div class="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-indigo-100/40 to-indigo-50/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500 pointer-events-none"></div>
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm border border-indigo-100/50">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <h4 class="text-sm font-bold text-gray-500">{{ $t('dashboard.active_staff') }}</h4>
              </div>
              <div class="mt-2 relative z-10">
                <h3 class="text-4xl font-black text-gray-900 tracking-tight">{{ metrics.totalEmployees }}</h3>
              </div>
              <div class="mt-4 pt-4 border-t border-gray-100/80 flex items-center justify-between">
                <span class="text-xs font-bold text-gray-500">{{ $t('dashboard.mth_payroll') }}</span>
                <span class="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{{ metrics.projectedPayroll.toFixed(2) }} {{ $t('common.currency') }}</span>
              </div>
            </div>

            <!-- Archive Storage -->
            <div class="group bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div class="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-blue-100/40 to-blue-50/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500 pointer-events-none"></div>
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-sm border border-blue-100/50">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                </div>
                <h4 class="text-sm font-bold text-gray-500">{{ $t('dashboard.archive') }}</h4>
              </div>
              <div class="mt-2 relative z-10">
                <h3 class="text-4xl font-black text-gray-900 tracking-tight">{{ activities.files.length }}</h3>
              </div>
              <div class="mt-4 pt-4 border-t border-gray-100/80">
                <NuxtLink to="/dashboard/archive" class="group/link text-xs font-bold text-gray-600 hover:text-blue-600 transition-colors flex items-center justify-between">
                  {{ $t('dashboard.open_drive') }} 
                  <svg class="w-4 h-4 transform group-hover/link:translate-x-1 rtl:group-hover/link:-translate-x-1 rtl:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </NuxtLink>
              </div>
            </div>
            
          </div>

          <!-- Modules Grid -->
          <div class="mt-8">
            <h3 class="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">{{ $t('dashboard.ecosystem_modules') }}</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <NuxtLink v-if="enabledModules?.includes('pos') && (hasPermission('pos:create') || hasPermission('pos:write'))" to="/dashboard/pos" class="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-orange-500 hover:shadow-md transition-all text-center">
                <div class="w-12 h-12 mx-auto bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <h4 class="font-bold text-gray-900">{{ $t('modules.pos') }}</h4>
              </NuxtLink>

              <NuxtLink v-if="enabledModules?.includes('inventory') && (hasPermission('inventory:read') || hasPermission('inventory:write'))" to="/dashboard/inventory" class="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all text-center">
                <div class="w-12 h-12 mx-auto bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                </div>
                <h4 class="font-bold text-gray-900">{{ $t('modules.inventory') }}</h4>
              </NuxtLink>

              <NuxtLink v-if="enabledModules?.includes('hr') && (hasPermission('hr:read') || hasPermission('hr:write'))" to="/dashboard/hr/employees" class="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-emerald-500 hover:shadow-md transition-all text-center">
                <div class="w-12 h-12 mx-auto bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <h4 class="font-bold text-gray-900">{{ $t('modules.hr') }}</h4>
              </NuxtLink>

              <NuxtLink v-if="enabledModules?.includes('archive') && (hasPermission('archive:read') || hasPermission('archive:write'))" to="/dashboard/archive" class="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-purple-500 hover:shadow-md transition-all text-center">
                <div class="w-12 h-12 mx-auto bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                </div>
                <h4 class="font-bold text-gray-900">{{ $t('modules.archive') }}</h4>
              </NuxtLink>

              <!-- Finance & CRM -->
              <NuxtLink v-if="hasPermission('pos:create') || hasPermission('pos:write')" to="/dashboard/customers" class="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-pink-500 hover:shadow-md transition-all text-center">
                <div class="w-12 h-12 mx-auto bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <h4 class="font-bold text-gray-900">{{ $t('modules.customers') }}</h4>
              </NuxtLink>

              <NuxtLink v-if="enabledModules?.includes('accounting') && (hasPermission('accounting:read') || hasPermission('accounting:write'))" to="/dashboard/accounting" class="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-yellow-500 hover:shadow-md transition-all text-center">
                <div class="w-12 h-12 mx-auto bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                </div>
                <h4 class="font-bold text-gray-900">{{ $t('modules.accounting') }}</h4>
              </NuxtLink>

              <NuxtLink v-if="enabledModules?.includes('accounting') && (hasPermission('accounting:read') || hasPermission('accounting:write'))" to="/dashboard/checks" class="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-teal-500 hover:shadow-md transition-all text-center">
                <div class="w-12 h-12 mx-auto bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                </div>
                <h4 class="font-bold text-gray-900">{{ $t('modules.checks') }}</h4>
              </NuxtLink>

              <NuxtLink v-if="hasPermission('pos:create') || hasPermission('pos:write')" to="/dashboard/installments" class="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-cyan-500 hover:shadow-md transition-all text-center">
                <div class="w-12 h-12 mx-auto bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <h4 class="font-bold text-gray-900">{{ $t('modules.installments') }}</h4>
              </NuxtLink>

              <!-- Supply Chain -->
              <NuxtLink v-if="enabledModules?.includes('inventory') && (hasPermission('inventory:read') || hasPermission('inventory:write'))" to="/dashboard/suppliers" class="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-fuchsia-500 hover:shadow-md transition-all text-center">
                <div class="w-12 h-12 mx-auto bg-fuchsia-100 text-fuchsia-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                </div>
                <h4 class="font-bold text-gray-900">{{ $t('modules.suppliers') }}</h4>
              </NuxtLink>

              <NuxtLink v-if="enabledModules?.includes('inventory') && (hasPermission('inventory:read') || hasPermission('inventory:write'))" to="/dashboard/stock-movements" class="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-lime-500 hover:shadow-md transition-all text-center">
                <div class="w-12 h-12 mx-auto bg-lime-100 text-lime-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                </div>
                <h4 class="font-bold text-gray-900">{{ $t('modules.stock_movements') }}</h4>
              </NuxtLink>
            </div>
          </div>
        </template>
      </div>

      <!-- Right Column: Live Feed & Notifications -->
      <div v-if="!loading" class="w-full lg:w-96 flex flex-col space-y-6">
        
        <!-- Alerts Panel -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="bg-gray-50 px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 class="font-bold text-gray-900 flex items-center">
              <svg class="w-5 h-5 text-red-500 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              {{ $t('dashboard.live_alerts') }}
            </h3>
            <span class="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">{{ alerts.length }}</span>
          </div>
          <div class="p-2 max-h-60 overflow-y-auto">
            <div v-if="alerts.length === 0" class="p-4 text-center text-sm text-gray-500">
              {{ $t('dashboard.no_alerts') }}
            </div>
            <div v-for="alert in alerts" :key="alert.id" class="p-3 mb-2 bg-red-50 border border-red-100 rounded-xl flex items-start">
              <svg class="w-5 h-5 text-red-500 me-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p class="text-sm font-medium text-red-800">
                <template v-if="alert.messageCode === 'low_stock'">
                  {{ $t('dashboard.low_stock_msg', { name: alert.productName, qty: alert.quantity }) }}
                </template>
                <template v-else>
                  {{ alert.message }}
                </template>
              </p>
            </div>
          </div>
        </div>

        <!-- Activity Feed -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
          <div class="bg-gray-50 px-5 py-4 border-b border-gray-100">
            <h3 class="font-bold text-gray-900 flex items-center">
              <svg class="w-5 h-5 text-indigo-500 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              {{ $t('dashboard.recent_activity') }}
            </h3>
          </div>
          <div class="p-5 flex-1 overflow-y-auto">
            <div class="relative border-s-2 border-gray-100 ms-3 space-y-6">
              
              <!-- Map combined activities (sorted by date ideally, but here we group them for simplicity) -->
              
              <div v-for="order in activities.orders" :key="order._id" class="relative ps-6">
                <span class="absolute -start-[11px] top-1 w-5 h-5 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center">
                  <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                </span>
                <p class="text-sm font-bold text-gray-900">{{ $t('dashboard.pos_sale') }}: {{ order.orderNumber }}</p>
                <p class="text-xs text-gray-500">{{ new Date(order.createdAt).toLocaleString() }} - {{ $t('dashboard.revenue') }}: {{ order.grandTotal.toFixed(2) }} {{ $t('common.currency') }}</p>
              </div>

              <div v-for="file in activities.files" :key="file._id" class="relative ps-6">
                <span class="absolute -start-[11px] top-1 w-5 h-5 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                  <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                </span>
                <p class="text-sm font-bold text-gray-900">{{ $t('dashboard.archived_doc') }}</p>
                <p class="text-xs text-gray-500">{{ new Date(file.createdAt).toLocaleString() }} - {{ $t('dashboard.file') }}: {{ file.filename }}</p>
              </div>

              <div v-for="movement in activities.movements" :key="movement._id" class="relative ps-6">
                <span class="absolute -start-[11px] top-1 w-5 h-5 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center">
                  <div class="w-2 h-2 rounded-full bg-orange-500"></div>
                </span>
                <p class="text-sm font-bold text-gray-900">{{ $t('dashboard.stock') }} {{ movement.type === 'in' ? $t('dashboard.added') : $t('dashboard.deducted') }}</p>
                <p class="text-xs text-gray-500">{{ new Date(movement.createdAt).toLocaleString() }} - {{ movement.quantity }}x {{ movement.productId?.name || 'Unknown' }} ({{ movement.reference }})</p>
              </div>

              <div v-if="!activities.orders?.length && !activities.files?.length && !activities.movements?.length" class="text-sm text-gray-500 ms-6">
                {{ $t('dashboard.no_recent_activity') }}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Dashboard' })

import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { user, tenantId, enabledModules, logout } = useAuth()
const { hasPermission } = usePermissions()
const { $api } = useNuxtApp()

const loading = ref(true)
const metrics = ref({
  todayRevenue: 0,
  monthRevenue: 0,
  lowStockCount: 0,
  totalEmployees: 0,
  projectedPayroll: 0
})
const alerts = ref([])
const activities = ref({
  files: [],
  movements: [],
  orders: []
})

const fetchDashboardData = async () => {
  try {
    const data = await $api('/dashboard/summary')
    metrics.value = data.metrics
    alerts.value = data.alerts
    activities.value = data.activities
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>
