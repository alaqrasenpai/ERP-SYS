<template>
  <div class="min-h-screen bg-[#FAFAFA] p-4 sm:p-8 font-sans dir-rtl">
    <div class="max-w-7xl mx-auto space-y-6">
      
      <!-- Top Header Area -->
      <div class="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <!-- Title and Subtitle -->
        <div class="flex items-baseline gap-4 shrink-0">
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ $t('checks.title', 'إدارة الشيكات') }}</h2>
          <p class="text-sm font-bold text-gray-400">{{ $t('checks.description', 'متابعة الشيكات المستحقة، المحصلة، والمرتجعة') }}</p>
        </div>
        
        <!-- Stats Badges -->
        <div class="flex flex-wrap gap-3 w-full xl:w-auto">
          <div class="flex-1 xl:flex-none px-5 py-3 bg-emerald-50/80 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-between xl:justify-start gap-4">
            <span class="text-xs font-black uppercase tracking-wider opacity-80">{{ $t('checks.collected_total', 'إجمالي المحصل') }}</span>
            <span class="text-lg font-black">{{ collectedTotal.toFixed(2) }} ريال</span>
          </div>
          <div class="flex-1 xl:flex-none px-5 py-3 bg-amber-50/80 text-amber-600 border border-amber-100 rounded-2xl flex items-center justify-between xl:justify-start gap-4">
            <span class="text-xs font-black uppercase tracking-wider opacity-80">{{ $t('checks.pending_checks', 'شيكات تحت التحصيل') }}</span>
            <span class="text-lg font-black">{{ pendingCount }}</span>
          </div>
          <div class="flex-1 xl:flex-none px-5 py-3 bg-rose-50/80 text-rose-600 border border-rose-100 rounded-2xl flex items-center justify-between xl:justify-start gap-4">
            <span class="text-xs font-black uppercase tracking-wider opacity-80">{{ $t('checks.bounced_count', 'شيكات مرتجعة') }}</span>
            <span class="text-lg font-black">{{ bouncedCount }}</span>
          </div>
        </div>
      </div>

      <!-- Main Card with Table -->
      <div class="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
        
        <div v-if="loading" class="flex justify-center p-12">
          <svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>

        <div v-else class="flex-1 overflow-x-auto">
          <table class="w-full text-sm text-center">
            <thead class="text-xs text-gray-500 font-bold bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th scope="col" class="px-6 py-5">{{ $t('checks.customer_name') }}</th>
                <th scope="col" class="px-6 py-5">{{ $t('checks.total_amount') }}</th>
                <th scope="col" class="px-6 py-5">{{ $t('checks.check_number') }}</th>
                <th scope="col" class="px-6 py-5">{{ $t('checks.bank') }}</th>
                <th scope="col" class="px-6 py-5">{{ $t('checks.reference') }}</th>
                <th scope="col" class="px-6 py-5">{{ $t('checks.due_date') }}</th>
                <th scope="col" class="px-6 py-5">{{ $t('checks.status') }}</th>
                <th scope="col" class="px-6 py-5">{{ $t('checks.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="check in checks" :key="check._id" class="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                <td class="px-6 py-5 font-black text-gray-900">
                  {{ check.customerId?.name || $t('checks.unknown_customer', 'عميل غير معروف') }}
                </td>
                <td class="px-6 py-5 font-black text-emerald-600">
                  {{ check.amount.toFixed(2) }} ريال
                </td>
                <td class="px-6 py-5 font-bold text-gray-600">
                  {{ check.checkNumber }}
                </td>
                <td class="px-6 py-5 font-bold text-gray-600">
                  {{ check.bankName }}
                </td>
                <td class="px-6 py-5 text-xs font-bold text-gray-400">
                  {{ check.orderId?.orderNumber || $t('checks.manual', 'يدوي') }}
                </td>
                <td class="px-6 py-5 font-bold" :class="isOverdue(check.dueDate) && check.status === 'Pending' ? 'text-rose-500' : 'text-gray-600'">
                  {{ new Date(check.dueDate).toLocaleDateString() }}
                </td>
                <td class="px-6 py-5">
                  <span v-if="check.status === 'Pending'" class="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black rounded-full uppercase tracking-wider">{{ $t('checks.pending', 'تحت التحصيل') }}</span>
                  <span v-else-if="check.status === 'Collected'" class="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black rounded-full uppercase tracking-wider">{{ $t('checks.collected', 'مُحصل') }}</span>
                  <span v-else class="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black rounded-full uppercase tracking-wider">{{ $t('checks.bounced', 'مرتجع') }}</span>
                </td>
                <td class="px-6 py-5">
                  <div class="flex items-center justify-center gap-2" v-if="check.status === 'Pending'">
                    <button @click="updateStatus(check._id, 'Collected')" class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 text-xs font-black rounded-xl transition-colors shadow-sm">
                      {{ $t('checks.mark_collected', 'تحصيل') }}
                    </button>
                    <button @click="updateStatus(check._id, 'Bounced')" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-black rounded-xl transition-colors shadow-sm">
                      {{ $t('checks.mark_bounced', 'مرتجع') }}
                    </button>
                  </div>
                  <div v-else class="text-gray-400 font-bold text-xs">-</div>
                </td>
              </tr>
              
              <tr v-if="checks.length === 0">
                <td colspan="8" class="px-6 py-16 text-center">
                  <div class="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                  </div>
                  <p class="font-black text-gray-400">{{ $t('checks.no_checks', 'لا توجد شيكات مسجلة') }}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="p-4 border-t border-gray-50 flex items-center justify-start gap-2 bg-white">
          <button class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 border border-gray-200 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
          <button class="w-8 h-8 rounded-full flex items-center justify-center text-emerald-600 font-black border border-emerald-500 bg-emerald-50">1</button>
          <button class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 border border-gray-200 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'إدارة الشيكات' })

import { ref, computed, onMounted } from 'vue'
const { t } = useI18n()

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { $api } = useNuxtApp()
const checks = ref([])
const loading = ref(true)

const pendingCount = computed(() => checks.value.filter(c => c.status === 'Pending').length)
const bouncedCount = computed(() => checks.value.filter(c => c.status === 'Bounced').length)
const collectedTotal = computed(() => checks.value.filter(c => c.status === 'Collected').reduce((acc, c) => acc + c.amount, 0))

const fetchChecks = async () => {
  loading.value = true
  try {
    checks.value = await $api('/finance/checks')
  } catch (error) {
    alert('Failed to load checks')
  } finally {
    loading.value = false
  }
}

const isOverdue = (dateString) => {
  return new Date(dateString) < new Date()
}

const updateStatus = async (checkId, status) => {
  const transStatus = status === 'Collected' ? t('checks.status_collected_msg', 'تم تحصيل الشيك') : t('checks.status_bounced_msg', 'شيك مرتجع')
  if (!confirm(t('checks.confirm_status', `هل أنت متأكد من تغيير حالة الشيك إلى: {status}؟`).replace('{status}', transStatus))) return

  try {
    await $api(`/finance/checks/${checkId}/status`, {
      method: 'POST',
      body: { status }
    })
    await fetchChecks()
  } catch (error) {
    alert('Failed to update status')
  }
}

onMounted(fetchChecks)
</script>

<style scoped>
.font-sans {
  font-family: 'Cairo', 'Inter', sans-serif;
}
</style>
