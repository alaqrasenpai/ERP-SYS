<template>
  <div class="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{{ $t('sidebar.dashboard') }} - HR & Payroll</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Overview of your human resources and workforce.</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm font-bold px-3 py-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg">Today: {{ new Date().toLocaleDateString() }}</span>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-2xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-all"></div>
        <div class="flex justify-between items-start relative z-10">
          <div>
            <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Total Employees</p>
            <h3 class="text-3xl font-black text-gray-900 dark:text-white">124</h3>
          </div>
          <div class="p-3 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm font-bold text-emerald-600 relative z-10">
          <svg class="w-4 h-4 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
          +4 this month
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full blur-2xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-all"></div>
        <div class="flex justify-between items-start relative z-10">
          <div>
            <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Present Today</p>
            <h3 class="text-3xl font-black text-gray-900 dark:text-white">118</h3>
          </div>
          <div class="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm font-bold text-emerald-600 relative z-10">
          95% attendance rate
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full blur-2xl group-hover:bg-rose-100 dark:group-hover:bg-rose-900/30 transition-all"></div>
        <div class="flex justify-between items-start relative z-10">
          <div>
            <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">On Leave</p>
            <h3 class="text-3xl font-black text-gray-900 dark:text-white">6</h3>
          </div>
          <div class="p-3 bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm font-bold text-gray-500 dark:text-gray-400 relative z-10">
          2 Pending Requests
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-full blur-2xl group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-all"></div>
        <div class="flex justify-between items-start relative z-10">
          <div>
            <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Active Shifts</p>
            <h3 class="text-3xl font-black text-gray-900 dark:text-white">4</h3>
          </div>
          <div class="p-3 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm font-bold text-gray-500 dark:text-gray-400 relative z-10">
          Running today
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-black text-gray-900 dark:text-white tracking-tight">Recent Leave Requests</h2>
          <NuxtLink to="/apps/hr/leaves" class="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</NuxtLink>
        </div>
        <div class="space-y-4">
          <div v-for="i in 3" :key="i" class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                E{{ i }}
              </div>
              <div>
                <p class="font-bold text-gray-900 dark:text-white text-sm">Employee Name</p>
                <p class="text-xs text-gray-500 font-medium">Annual Leave • 2 Days</p>
              </div>
            </div>
            <span class="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 text-xs font-bold rounded-lg">Pending</span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-black text-gray-900 dark:text-white tracking-tight">Today's Attendance</h2>
          <NuxtLink to="/apps/hr/attendance" class="text-sm font-bold text-indigo-600 hover:text-indigo-700">Monitor</NuxtLink>
        </div>
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="flex-1">
              <div class="flex justify-between mb-1">
                <span class="text-sm font-bold text-gray-700 dark:text-gray-300">On Time</span>
                <span class="text-sm font-bold text-gray-900 dark:text-white">85%</span>
              </div>
              <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                <div class="bg-emerald-500 h-2 rounded-full" style="width: 85%"></div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex-1">
              <div class="flex justify-between mb-1">
                <span class="text-sm font-bold text-gray-700 dark:text-gray-300">Late</span>
                <span class="text-sm font-bold text-gray-900 dark:text-white">10%</span>
              </div>
              <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                <div class="bg-amber-500 h-2 rounded-full" style="width: 10%"></div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex-1">
              <div class="flex justify-between mb-1">
                <span class="text-sm font-bold text-gray-700 dark:text-gray-300">Absent</span>
                <span class="text-sm font-bold text-gray-900 dark:text-white">5%</span>
              </div>
              <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                <div class="bg-rose-500 h-2 rounded-full" style="width: 5%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'HR Dashboard' })

definePageMeta({ 
  layout: 'app-layout',
  middleware: ['auth', 'module-guard'],
  requiredModule: 'hr'
})
</script>
