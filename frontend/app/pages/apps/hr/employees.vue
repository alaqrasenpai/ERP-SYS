<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-700 p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{{ $t('employees.title') }}</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ $t('employees.description') }}</p>
        </div>
        <div class="flex flex-row flex-nowrap gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 shrink-0">
          <div class="flex rounded-xl bg-gray-200/50 dark:bg-gray-800 p-1 me-2 shrink-0">
            <button @click="filterStatus = 'all'" :class="[filterStatus === 'all' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300', 'px-3 py-1.5 rounded-lg text-sm font-bold transition-all']">{{ $t('employees.all') }}</button>
            <button @click="filterStatus = 'active'" :class="[filterStatus === 'active' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300', 'px-3 py-1.5 rounded-lg text-sm font-bold transition-all']">{{ $t('employees.active') }}</button>
            <button @click="filterStatus = 'inactive'" :class="[filterStatus === 'inactive' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300', 'px-3 py-1.5 rounded-lg text-sm font-bold transition-all']">{{ $t('employees.inactive') }}</button>
          </div>
          <button @click="openAddModal" class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center">
            <svg class="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            {{ $t('employees.add_employee') }}
          </button>
        </div>
      </div>

      <!-- Employees Table -->
      <div class="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('employees.employee') }}</th>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('employees.job_department') }}</th>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('employees.shift') }}</th>
                <th class="px-6 py-4 text-start text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('employees.leave_balances') }}</th>
                <th class="px-6 py-4 text-end text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $t('employees.actions') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
              <tr v-for="emp in paginatedEmployees" :key="emp._id" class="hover:bg-gray-50 dark:bg-gray-900 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold me-3">
                      {{ emp.name.charAt(0) }}
                    </div>
                    <div>
                      <div class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {{ emp.name }}
                        <span v-if="emp.isActive !== false" class="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{{ $t('employees.active_status') }}</span>
                        <span v-else class="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">{{ $t('employees.inactive_status') }}</span>
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">{{ emp.nationalId || $t('employees.no_id') }} • #{{ emp.employeeNumber || 'N/A' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white font-bold">{{ emp.position }}</div>
                  <div class="text-xs text-indigo-600">{{ emp.departmentId?.name || $t('employees.unassigned_dept') }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">{{ emp.shiftId?.name || $t('employees.no_shift') }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400" v-if="emp.shiftId">{{ emp.shiftId.startTime }} - {{ emp.shiftId.endTime }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-xs text-gray-700 dark:text-gray-300">{{ $t('employees.annual') }} <span class="font-bold">{{ emp.annualLeaveBalance }}</span> {{ $t('employees.days') }}</div>
                  <div class="text-xs text-gray-700 dark:text-gray-300">{{ $t('employees.sick') }} <span class="font-bold">{{ emp.sickLeaveBalance }}</span> {{ $t('employees.days') }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
              <div class="flex items-center justify-end gap-2">
                  <button @click="openEditModal(emp)" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">{{ $t('employees.profile') }}</button>
                  <button @click="deleteEmployee(emp._id)" class="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">{{ $t('employees.delete') }}</button>
                </div>
            </td>
              </tr>
              <tr v-if="employees.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">{{ $t('employees.no_employees_found') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <Pagination 
          v-if="employees.length > 0"
          :totalItems="employees.length" 
          :itemsPerPage="itemsPerPage"
          v-model:currentPage="currentPage" 
        />
      </div>

      <!-- Add/Edit Employee Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-2xl text-start overflow-hidden shadow-2xl w-full max-w-3xl border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]">
          
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ isEditing ? $t('employees.edit_hr_profile') : $t('employees.new_employee_profile') }}</h3>
            <button @click="showModal = false" class="text-gray-400 hover:text-gray-500 dark:text-gray-400"><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>

          <!-- Tabs -->
          <div class="border-b border-gray-100 dark:border-gray-700 px-6">
            <nav class="-mb-px flex gap-8">
              <button @click="activeModalTab = 'personal'" :class="[activeModalTab === 'personal' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600', 'whitespace-nowrap py-3 px-1 border-b-2 font-bold text-sm transition-colors']">{{ $t('employees.personal_info') }}</button>
              <button @click="activeModalTab = 'job'" :class="[activeModalTab === 'job' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600', 'whitespace-nowrap py-3 px-1 border-b-2 font-bold text-sm transition-colors']">{{ $t('employees.job_shift') }}</button>
              <button @click="activeModalTab = 'leaves'" :class="[activeModalTab === 'leaves' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600', 'whitespace-nowrap py-3 px-1 border-b-2 font-bold text-sm transition-colors']">{{ $t('employees.leave_balances') }}</button>
            </nav>
          </div>

          <form @submit.prevent="saveEmployee" class="flex flex-col flex-1 overflow-hidden">
            <div class="bg-white dark:bg-gray-800 px-6 py-6 overflow-y-auto flex-1">
              
              <!-- Personal Tab -->
              <div v-if="activeModalTab === 'personal'" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('employees.full_name') }}</label>
                    <input v-model="form.name" type="text" required class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('employees.national_id') }}</label>
                    <input v-model="form.nationalId" type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('employees.employee_number') }} (رقم البصمة)</label>
                    <input v-model="form.employeeNumber" type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('employees.email') }}</label>
                    <input v-model="form.email" type="email" required class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('employees.phone') }}</label>
                    <input v-model="form.phone" type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('employees.gender') }}</label>
                    <select v-model="form.gender" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="Male">{{ $t('employees.male') }}</option>
                      <option value="Female">{{ $t('employees.female') }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('employees.birth_date') }}</label>
                    <input v-model="form.birthDate" type="date" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('employees.address') }}</label>
                  <textarea v-model="form.address" rows="2" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                </div>
                <h4 class="text-sm font-bold text-gray-900 dark:text-white border-b pb-1 mt-4">{{ $t('employees.emergency_contact') }}</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input v-model="form.emergencyContact.name" type="text" :placeholder="$t('employees.name')" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm">
                  <input v-model="form.emergencyContact.phone" type="text" :placeholder="$t('employees.phone')" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm">
                  <input v-model="form.emergencyContact.relationship" type="text" :placeholder="$t('employees.relationship')" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm">
                </div>
              </div>

              <!-- Job Tab -->
              <div v-if="activeModalTab === 'job'" class="space-y-4">
                <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-600 mb-4">
                  <div>
                    <h4 class="text-sm font-bold text-gray-900 dark:text-white">{{ $t('employees.is_working') }}</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ $t('employees.is_working_note') }}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="form.isActive" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                  </label>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('employees.job_position') }}</label>
                    <input v-model="form.position" type="text" required class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('employees.department') }}</label>
                    <select v-model="form.departmentId" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option :value="null">{{ $t('employees.unassigned') }}</option>
                      <option v-for="d in departments" :key="d._id" :value="d._id">{{ d.name }}</option>
                    </select>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('employees.working_shift') }}</label>
                    <select v-model="form.shiftId" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option :value="null">{{ $t('employees.default_flexible') }}</option>
                      <option v-for="s in shifts" :key="s._id" :value="s._id">{{ s.name }} ({{ s.startTime }}-{{ s.endTime }})</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('employees.join_date') }}</label>
                    <input v-model="form.joinedAt" type="date" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                </div>
                
                <h4 class="text-sm font-bold text-gray-900 dark:text-white border-b pb-1 mt-6">{{ $t('employees.payroll_details') }}</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('employees.basic_salary') }}</label>
                    <input v-model="form.basicSalary" type="number" step="0.01" required class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('employees.monthly_allowance') }} (Legacy)</label>
                    <input v-model="form.allowance" type="number" step="0.01" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                </div>

                <h4 class="text-sm font-bold text-gray-900 dark:text-white border-b pb-1 mt-6">{{ $t('employees.bank_details') }}</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('employees.bank_name') }}</label>
                    <input v-model="form.bankDetails.bankName" type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('employees.iban') }}</label>
                    <input v-model="form.bankDetails.iban" type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                </div>

                <h4 class="text-sm font-bold text-gray-900 dark:text-white border-b pb-1 mt-6 flex justify-between items-center">
                  {{ $t('employees.allowances') }}
                  <button type="button" @click="addAllowance" class="text-xs font-bold text-indigo-600 hover:text-indigo-800">{{ $t('employees.add_allowance') }}</button>
                </h4>
                <div class="space-y-2 mt-3">
                  <div v-for="(allowance, idx) in form.assignedAllowances" :key="idx" class="flex gap-2 items-center bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                    <select v-model="allowance.allowanceTypeId" @change="updateAllowanceName(idx)" class="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-1.5 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option :value="null">{{ $t('employees.select_allowance') }}</option>
                      <option v-for="type in allowanceTypes" :key="type._id" :value="type._id">{{ type.name }}</option>
                    </select>
                    <input v-model="allowance.amount" type="number" step="0.01" :placeholder="$t('employees.amount')" class="w-24 border border-gray-300 dark:border-gray-600 rounded-lg py-1.5 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <button type="button" @click="removeAllowance(idx)" class="text-red-500 hover:text-red-700 p-1">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  <div v-if="form.assignedAllowances.length === 0" class="text-xs text-gray-500 text-center py-2">No allowances assigned</div>
                </div>

                <h4 class="text-sm font-bold text-gray-900 dark:text-white border-b pb-1 mt-6">{{ $t('employees.delegation') }}</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('employees.delegate_to') }}</label>
                    <select v-model="form.delegatedTo" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option :value="null">{{ $t('employees.no_delegation') }}</option>
                      <option v-for="emp in employees" :key="emp._id" :value="emp._id">{{ emp.name }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('employees.delegation_end') }}</label>
                    <input v-model="form.delegationEnd" type="date" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                </div>

                <h4 class="text-sm font-bold text-gray-900 dark:text-white border-b pb-1 mt-6">{{ $t('employees.system_user') }}</h4>
                <div class="mt-2">
                  <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('employees.link_system_user') }}</label>
                  <select v-model="form.userId" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option :value="null">{{ $t('employees.no_linked_user') }}</option>
                    <option v-for="u in users" :key="u._id" :value="u._id">{{ u.name }} ({{ u.email }})</option>
                  </select>
                </div>
              </div>

              <!-- Leaves Tab -->
              <div v-if="activeModalTab === 'leaves'" class="space-y-4">
                <div class="bg-indigo-50 rounded-lg p-4 border border-indigo-100 mb-4">
                  <p class="text-sm text-indigo-800">
                    {{ $t('employees.leave_balances_notice') }}
                  </p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('employees.annual_leave_balance') }}</label>
                    <input v-model="form.annualLeaveBalance" type="number" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-bold text-indigo-700 text-lg">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{{ $t('employees.sick_leave_balance') }}</label>
                    <input v-model="form.sickLeaveBalance" type="number" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-bold text-red-700 text-lg">
                  </div>
                </div>
              </div>

            </div>
            <div class="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex flex-row-reverse border-t border-gray-100 dark:border-gray-700 flex-shrink-0 gap-3">
              <button type="submit" class="inline-flex justify-center rounded-lg px-6 py-2.5 bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 shadow-sm ms-3">
                {{ isEditing ? $t('employees.save_profile') : $t('employees.add_employee') }}
              </button>
              <button type="button" @click="showModal = false" class="inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2.5 bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900 shadow-sm">
                {{ $t('employees.cancel') }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Employees' })

import { ref, computed, onMounted } from 'vue'
import Pagination from '~/components/Pagination.vue'

definePageMeta({ 
  layout: 'app-layout',
  middleware: ['auth', 'module-guard'],
  requiredModule: 'hr'
})

const { $api } = useNuxtApp()
const employees = ref([])
const departments = ref([])
const shifts = ref([])
const users = ref([])
const allowanceTypes = ref([])

const currentPage = ref(1)
const itemsPerPage = 15
const filterStatus = ref('all') // 'all', 'active', 'inactive'

const filteredEmployees = computed(() => {
  let list = employees.value
  if (filterStatus.value === 'active') {
    list = list.filter(e => e.isActive !== false)
  } else if (filterStatus.value === 'inactive') {
    list = list.filter(e => e.isActive === false)
  }
  return list
})

const paginatedEmployees = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredEmployees.value.slice(start, start + itemsPerPage)
})

const showModal = ref(false)
const activeModalTab = ref('personal')
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  name: '', email: '', phone: '', nationalId: '', employeeNumber: '', gender: 'Male', birthDate: '', address: '',
  emergencyContact: { name: '', phone: '', relationship: '' },
  position: '', departmentId: null, shiftId: null, joinedAt: '',
  basicSalary: '', allowance: 0, 
  bankDetails: { bankName: '', iban: '' },
  assignedAllowances: [],
  annualLeaveBalance: 21, sickLeaveBalance: 14,
  delegatedTo: null, delegationEnd: '',
  isActive: true, userId: null
})

const addAllowance = () => {
  form.value.assignedAllowances.push({ allowanceTypeId: null, name: '', amount: 0 })
}
const removeAllowance = (index) => {
  form.value.assignedAllowances.splice(index, 1)
}
const updateAllowanceName = (index) => {
  const typeId = form.value.assignedAllowances[index].allowanceTypeId
  const type = allowanceTypes.value.find(t => t._id === typeId)
  if (type) {
    form.value.assignedAllowances[index].name = type.name
  }
}

const formatDate = (d) => d ? new Date(d).toISOString().split('T')[0] : ''

const fetchData = async () => {
  try {
    employees.value = await $api('/hr/employees')
    departments.value = await $api('/hr/departments')
    shifts.value = await $api('/hr/shifts')
    users.value = await $api('/team/users')
    allowanceTypes.value = await $api('/hr/allowances')
  } catch (error) {
    console.error('Failed to fetch HR data', error)
  }
}

const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  activeModalTab.value = 'personal'
  form.value = {
    name: '', email: '', phone: '', nationalId: '', employeeNumber: '', gender: 'Male', birthDate: '', address: '',
    emergencyContact: { name: '', phone: '', relationship: '' },
    position: '', departmentId: null, shiftId: null, joinedAt: formatDate(new Date()),
    basicSalary: '', allowance: 0, 
    bankDetails: { bankName: '', iban: '' },
    assignedAllowances: [],
    annualLeaveBalance: 21, sickLeaveBalance: 14,
    delegatedTo: null, delegationEnd: '',
    isActive: true, userId: null
  }
  showModal.value = true
}

const openEditModal = (emp) => {
  isEditing.value = true
  editingId.value = emp._id
  activeModalTab.value = 'personal'
  form.value = { 
    name: emp.name, email: emp.email, phone: emp.phone || '', nationalId: emp.nationalId || '', employeeNumber: emp.employeeNumber || '',
    gender: emp.gender || 'Male', birthDate: formatDate(emp.birthDate), address: emp.address || '',
    emergencyContact: { 
      name: emp.emergencyContact?.name || '', 
      phone: emp.emergencyContact?.phone || '', 
      relationship: emp.emergencyContact?.relationship || '' 
    },
    position: emp.position, 
    departmentId: emp.departmentId?._id || emp.departmentId || null, 
    shiftId: emp.shiftId?._id || emp.shiftId || null, 
    joinedAt: formatDate(emp.joinedAt),
    basicSalary: emp.basicSalary || '', allowance: emp.allowance || 0,
    bankDetails: { bankName: emp.bankDetails?.bankName || '', iban: emp.bankDetails?.iban || '' },
    assignedAllowances: (emp.assignedAllowances || []).map(a => ({
      allowanceTypeId: a.allowanceTypeId?._id || a.allowanceTypeId,
      name: a.name || '',
      amount: a.amount || 0
    })),
    annualLeaveBalance: emp.annualLeaveBalance || 21, sickLeaveBalance: emp.sickLeaveBalance || 14,
    delegatedTo: emp.delegatedTo || null, delegationEnd: formatDate(emp.delegationEnd),
    isActive: emp.isActive !== false,
    userId: emp.userId ? (typeof emp.userId === 'object' ? emp.userId._id : emp.userId) : null
  }
  showModal.value = true
}

const saveEmployee = async () => {
  try {
    const payload = { ...form.value }
    if (!payload.departmentId) delete payload.departmentId
    if (!payload.shiftId) delete payload.shiftId
    if (!payload.nationalId) delete payload.nationalId
    if (!payload.employeeNumber) delete payload.employeeNumber
    if (!payload.birthDate) delete payload.birthDate
    if (!payload.joinedAt) delete payload.joinedAt

    if (isEditing.value) {
      await $api(`/hr/employees/${editingId.value}`, { method: 'PUT', body: payload })
    } else {
      await $api('/hr/employees', { method: 'POST', body: payload })
    }
    showModal.value = false
    fetchData()
  } catch (error) {
    alert(error.data?.message || error.data?.error || useNuxtApp().$i18n.t('employees.failed_save'))
  }
}

const deleteEmployee = async (id) => {
  if (!confirm(useNuxtApp().$i18n.t('employees.delete_prompt'))) return
  try {
    await $api(`/hr/employees/${id}`, { method: 'DELETE' })
    fetchData()
  } catch (error) {
    alert(useNuxtApp().$i18n.t('employees.failed_delete'))
  }
}

onMounted(() => {
  fetchData()
})
</script>
