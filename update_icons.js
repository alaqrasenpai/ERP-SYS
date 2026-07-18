const fs = require('fs');

const path = './frontend/app/layouts/dashboard.vue';
let content = fs.readFileSync(path, 'utf8');

const newNavGroups = `const navGroups = computed(() => {
  return [
    {
      name: 'general.dashboard',
      path: '/',
      visible: true,
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    {
      name: 'nav.sales_crm',
      visible: hasPermission('pos:create') || hasPermission('pos:write'), 
      children: [
        { name: 'modules.pos', path: '/dashboard/pos', visible: enabledModules.value?.includes('pos') && (hasPermission('pos:create') || hasPermission('pos:write')), icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
        { name: 'nav.customers', path: '/dashboard/customers', visible: hasPermission('pos:create') || hasPermission('pos:write'), icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' }
      ]
    },
    {
      name: 'modules.inventory',
      visible: enabledModules.value?.includes('inventory') && (hasPermission('inventory:read') || hasPermission('inventory:write')),
      children: [
        { name: 'nav.products_overview', path: '/dashboard/inventory', visible: true, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { name: 'nav.stock_audit', path: '/dashboard/stock-movements', visible: true, icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
        { name: 'nav.suppliers', path: '/dashboard/suppliers', visible: true, icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h1m10 0h-1m-7-10V4a1 1 0 011-1h8a1 1 0 011 1v12h1' }
      ]
    },
    {
      name: 'modules.restaurant',
      visible: enabledModules.value?.includes('restaurant'),
      children: [
        { name: 'restaurant.tables_grid', path: '/dashboard/restaurant/tables-grid', visible: true, icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
        { name: 'restaurant.pos_terminal', path: '/dashboard/restaurant/pos-terminal', visible: true, icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
        { name: 'restaurant.kitchen_display', path: '/dashboard/restaurant/kitchen-display', visible: true, icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
        { name: 'restaurant.completed_orders', path: '/dashboard/restaurant/completed-orders', visible: true, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
        { name: 'restaurant.delivery_providers', path: '/dashboard/restaurant/providers', visible: true, icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
        { name: 'restaurant.menu_setup', path: '/dashboard/restaurant/menu-setup', visible: true, icon: 'M4 6h16M4 12h16M4 18h16' }
      ]
    },
    {
      name: 'modules.finance',
      visible: enabledModules.value?.includes('accounting') && (hasPermission('accounting:read') || hasPermission('accounting:write')), 
      children: [
        { name: 'nav.accounting_ledger', path: '/dashboard/accounting', visible: true, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'modules.cash_shifts', path: '/dashboard/shifts', visible: true, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'modules.reports', path: '/dashboard/reports', visible: true, icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
      ]
    },
    {
      name: 'modules.hr',
      visible: enabledModules.value?.includes('hr') && (hasPermission('hr:read') || hasPermission('hr:write')),
      children: [
        { name: 'hr.attendance_monitor', path: '/dashboard/hr/attendance-monitor', visible: hasPermission('hr:write') || hasPermission('hr:read'), icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'hr.devices', path: '/dashboard/hr/devices', visible: hasPermission('hr:write'), icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
        { name: 'hr.structure', path: '/dashboard/hr/structure', visible: true, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { name: 'hr.employees', path: '/dashboard/hr/employees', visible: true, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { name: 'hr.shifts', path: '/dashboard/hr/shifts', visible: true, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { name: 'hr.leaves', path: '/dashboard/hr/leaves', visible: true, icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
        { name: 'hr.payroll', path: '/dashboard/payroll', visible: true, icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' }
      ]
    },
    {
      name: 'ess.title',
      visible: enabledModules.value?.includes('ess') && (hasPermission('ess:read') || hasPermission('*')),
      children: [
        { name: 'ess.my_profile', path: '/dashboard/my/profile', visible: true, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { name: 'ess.my_attendance', path: '/dashboard/my/attendance', visible: true, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'ess.my_leaves', path: '/dashboard/my/leaves', visible: true, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }
      ]
    },
    {
      name: 'modules.operations',
      visible: hasPermission('archive:read') || hasPermission('archive:write') || hasPermission('*'),
      children: [
        { name: 'modules.archive', path: '/dashboard/archive', visible: enabledModules.value?.includes('archive') && (hasPermission('archive:read') || hasPermission('archive:write')), icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
        { name: 'general.settings', path: '/dashboard/settings', visible: hasPermission('*'), icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
      ]
    },
    {
      name: 'modules.team',
      visible: hasPermission('team:manage'),
      children: [
        { name: 'nav.staff_members', path: '/dashboard/team/users', visible: true, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { name: 'nav.access_roles', path: '/dashboard/team/roles', visible: true, icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' }
      ]
    }
  ]
})`;

content = content.replace(/const navGroups = computed\(\(\) => \{[\s\S]*\}\)/, newNavGroups);
fs.writeFileSync(path, content, 'utf8');
console.log('Done!');
