<template>
  <div class="min-h-screen bg-[#FAFAFA] p-4 sm:p-8 font-sans dir-rtl">
    <div class="max-w-7xl mx-auto space-y-8">
      
      <!-- Header -->
      <div class="text-center pt-4 pb-2">
        <h2 class="text-3xl font-black text-gray-900 tracking-tight">{{ $t('cash_shifts_page.title', 'إدارة الورديات والقاصة') }}</h2>
        <p class="text-sm font-bold text-gray-400 mt-2">{{ $t('cash_shifts_page.description', 'تتبع المبالغ النقدية وفتح وإغلاق الورديات اليومية') }}</p>
      </div>

      <!-- Main Content Layout -->
      <div class="flex flex-col lg:flex-row gap-8 items-start justify-center">
        
        <!-- Right Column: Shift Details & Actions -->
        <div class="w-full lg:w-[400px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden shrink-0">
          <div class="p-6 text-center border-b border-gray-50 bg-gray-50/50">
            <h3 class="text-base font-black text-gray-900">{{ $t('cash_shifts_page.shift_details', 'تفاصيل الوردية') }}</h3>
          </div>
          
          <div class="p-6 space-y-6">
            <div v-if="loading" class="flex justify-center p-8">
              <svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
            
            <template v-else-if="currentOpenShift">
              <!-- Info List -->
              <div class="space-y-4">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-500 font-bold">{{ $t('cash_shifts_page.identifier', 'المعرف') }}</span>
                  <span class="font-bold text-gray-900">{{ currentOpenShift._id.substring(0, 12) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-500 font-bold">{{ $t('cash_shifts_page.start_time', 'وقت البدء') }}</span>
                  <span class="font-bold text-gray-900">{{ new Date(currentOpenShift.openedAt).toLocaleString() }}</span>
                </div>
                <div class="flex justify-between items-center text-sm pt-2">
                  <span class="text-gray-500 font-bold">{{ $t('cash_shifts_page.starting_cash', 'كاش البداية') }}</span>
                  <span class="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg font-black text-sm">
                    {{ currentOpenShift.openingBalance?.toFixed(2) }} {{ $t('currency', 'ريال') }}
                  </span>
                </div>
                <div class="flex justify-between items-center text-sm pt-2 pb-4 border-b border-gray-100">
                  <span class="text-gray-500 font-bold">{{ $t('cash_shifts_page.expected_in_safe', 'المتوقع في القاصة') }}</span>
                  <span class="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg font-black text-sm">
                    {{ currentOpenShift.expectedBalance !== undefined ? currentOpenShift.expectedBalance?.toFixed(2) : currentOpenShift.openingBalance?.toFixed(2) }} {{ $t('currency', 'ريال') }}
                  </span>
                </div>
              </div>

              <!-- Cash Actions -->
              <div class="grid grid-cols-2 gap-4">
                <button @click="depositCash" class="py-3 px-2 border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-2xl text-blue-500 font-black text-sm transition-colors text-center">
                  {{ $t('cash_shifts_page.deposit_cash', 'إيداع نقدي (+)') }}
                </button>
                <button @click="withdrawCash" class="py-3 px-2 border-2 border-dashed border-amber-200 hover:border-amber-400 hover:bg-amber-50 rounded-2xl text-amber-500 font-black text-sm transition-colors text-center">
                  {{ $t('cash_shifts_page.withdraw_cash', 'سحب نقدي (-)') }}
                </button>
              </div>

              <!-- Closing Section -->
              <div class="pt-6 mt-6 border-t border-gray-100">
                <h4 class="text-rose-500 font-black text-sm mb-4">{{ $t('cash_shifts_page.z_report', 'تقرير Z-Report') }}</h4>
                
                <div class="space-y-2">
                  <label class="block text-xs font-bold text-gray-500">{{ $t('cash_shifts_page.actual_cash', 'الموجود فعلياً') }}</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span class="text-gray-400 font-bold">{{ $t('currency', 'ريال') }}</span>
                    </div>
                    <input type="number" v-model.number="actualCash" :placeholder="$t('cash_shifts_page.count_cash_placeholder', 'قم بعد النقدية وأدخل المبلغ هنا...')" class="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block pr-12 p-3.5 transition-colors">
                  </div>
                </div>

                <button @click="closeShift" :disabled="actualCash === null || actualCash === ''" class="mt-6 w-full py-4 bg-[#E58C9B] hover:bg-rose-400 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl text-base font-black tracking-wide shadow-md transition-colors flex justify-center items-center">
                  {{ $t('cash_shifts_page.close_current_shift', 'إغلاق الوردية الحالية') }}
                </button>
              </div>
            </template>
            
            <!-- Open Shift State -->
            <template v-else>
              <div class="text-center py-8">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 border-dashed">
                  <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </div>
                <h4 class="text-gray-900 font-black mb-2">{{ $t('cash_shifts_page.no_active_shift', 'لا توجد وردية نشطة') }}</h4>
                <p class="text-xs text-gray-500 font-bold mb-6">{{ $t('cash_shifts_page.open_shift_to_start', 'الرجاء فتح وردية جديدة للبدء باستقبال الطلبات والمبيعات.') }}</p>
                
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-bold text-gray-500 text-start mb-2">{{ $t('cash_shifts_page.starting_cash_drawer', 'كاش البداية (الموجود في الدرج)') }}</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span class="text-gray-400 font-bold">{{ $t('currency', 'ريال') }}</span>
                      </div>
                      <input type="number" v-model.number="openingCash" :placeholder="$t('cash_shifts_page.example_100', 'مثال: 100')" class="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block pr-12 p-3.5 transition-colors">
                    </div>
                  </div>
                  <button @click="openShift" class="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-base font-black shadow-md transition-colors flex justify-center items-center">
                    {{ $t('cash_shifts_page.open_new_shift', 'فتح وردية جديدة') }}
                  </button>
                </div>
              </div>
            </template>

          </div>
        </div>

        <!-- Left Column: Shift History -->
        <div class="flex-1 w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div class="p-6 text-center border-b border-gray-50 bg-gray-50/50">
            <h3 class="text-base font-black text-gray-900">{{ $t('cash_shifts_page.shifts_history', 'سجل الورديات') }}</h3>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-right text-gray-500">
              <thead class="text-xs text-gray-400 font-bold uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th scope="col" class="px-6 py-4">{{ $t('cash_shifts_page.shifts_history', 'سجل الورديات') }}</th>
                  <th scope="col" class="px-6 py-4">{{ $t('cash_shifts_page.end_time', 'وقت الانتهاء') }}</th>
                  <th scope="col" class="px-6 py-4">{{ $t('cash_shifts_page.difference', 'الفرق') }}</th>
                  <th scope="col" class="px-6 py-4">{{ $t('cash_shifts_page.actions', 'الإجراءات') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="shift in closedShifts" :key="shift._id" class="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="font-black text-gray-900">{{ shift._id.substring(0, 10) }}</div>
                    <div class="text-xs text-gray-400 mt-0.5">{{ new Date(shift.openedAt).toLocaleString() }}</div>
                  </td>
                  <td class="px-6 py-4 font-bold text-gray-600">
                    {{ shift.closedAt ? new Date(shift.closedAt).toLocaleString() : '-' }}
                  </td>
                  <td class="px-6 py-4">
                    <div v-if="shift.closingBalance !== undefined" class="font-black" :class="(shift.closingBalance >= (shift.expectedBalance || shift.openingBalance)) ? 'text-emerald-600' : 'text-rose-500'">
                      {{ (shift.closingBalance - (shift.expectedBalance || shift.openingBalance)).toFixed(2) }} {{ $t('currency', 'ريال') }}
                    </div>
                    <div v-else class="text-gray-400 font-bold">-</div>
                  </td>
                  <td class="px-6 py-4">
                    <button class="text-emerald-600 hover:text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors text-xs">{{ $t('cash_shifts_page.view_report', 'عرض التقرير') }}</button>
                  </td>
                </tr>
                
                <tr v-if="!loading && closedShifts.length === 0">
                  <td colspan="4" class="px-6 py-20 text-center">
                    <div class="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                      <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    </div>
                    <p class="font-black text-gray-400">{{ $t('cash_shifts_page.no_data', 'لا توجد بيانات') }}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination Dummy -->
          <div v-if="closedShifts.length > 0" class="p-4 border-t border-gray-50 flex items-center justify-start gap-2">
            <button class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 border border-gray-200 transition-colors">
              <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button class="w-8 h-8 rounded-full flex items-center justify-center text-emerald-600 font-black border border-emerald-500 bg-emerald-50">1</button>
            <button class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 border border-gray-200 transition-colors">
              <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

useHead({ title: t('cash_shifts_page.title', 'إدارة الورديات والقاصة') })

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { $api } = useNuxtApp()
const loading = ref(true)
const shifts = ref([])

const currentOpenShift = computed(() => shifts.value.find(s => s.status === 'Open'))
const closedShifts = computed(() => shifts.value.filter(s => s.status !== 'Open'))

const openingCash = ref('')
const actualCash = ref('')

const fetchShifts = async () => {
  loading.value = true
  try {
    shifts.value = await $api('/pos/shifts')
  } catch (error) {
    console.error('Failed to load shifts', error)
  } finally {
    loading.value = false
  }
}

const openShift = async () => {
  if (openingCash.value === '') return alert(t('cash_shifts_page.enter_opening_cash', 'الرجاء إدخال كاش البداية'))
  try {
    await $api('/pos/shifts/open', {
      method: 'POST',
      body: { openingBalance: Number(openingCash.value) }
    })
    openingCash.value = ''
    await fetchShifts()
  } catch (error) {
    alert(error.data?.message || 'Failed to open shift')
  }
}

const closeShift = async () => {
  if (actualCash.value === '') return alert(t('cash_shifts_page.enter_actual_cash', 'الرجاء إدخال الكاش الفعلي'))
  if (!currentOpenShift.value) return
  
  try {
    await $api(`/pos/shifts/close/${currentOpenShift.value._id}`, {
      method: 'POST',
      body: { closingBalance: Number(actualCash.value) }
    })
    actualCash.value = ''
    await fetchShifts()
  } catch (error) {
    alert(error.data?.message || 'Failed to close shift')
  }
}

const depositCash = () => {
  const amount = prompt(t('cash_shifts_page.enter_deposit_amount', "أدخل مبلغ الإيداع:"), "0")
  if (!amount || isNaN(Number(amount))) return
  // NOTE: Requires backend implementation to log transactions inside a shift
  // For now, updating expectedBalance if supported, or just showing toast
  alert(t('cash_shifts_page.deposit_success', `تم إضافة ${amount} إيداع نقدي (يتطلب دعم من الواجهة الخلفية)`).replace('{amount}', amount))
}

const withdrawCash = () => {
  const amount = prompt(t('cash_shifts_page.enter_withdraw_amount', "أدخل مبلغ السحب:"), "0")
  if (!amount || isNaN(Number(amount))) return
  alert(t('cash_shifts_page.withdraw_success', `تم سحب ${amount} (يتطلب دعم من الواجهة الخلفية)`).replace('{amount}', amount))
}

onMounted(() => {
  fetchShifts()
})
</script>

<style scoped>
/* To match the font weight from the mockup */
.font-sans {
  font-family: 'Cairo', 'Inter', sans-serif;
}
</style>
