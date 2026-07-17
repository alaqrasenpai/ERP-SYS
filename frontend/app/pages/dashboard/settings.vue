<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-8">
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ $t('settings.title') }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ $t('settings.description') }}</p>
        </div>
        <div class="flex space-x-3 mt-4 sm:mt-0 space-x-reverse">
          <NuxtLink to="/" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 shadow-sm transition-colors flex items-center">
            <svg class="w-4 h-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            {{ $t('settings.dashboard') }}
          </NuxtLink>
          <button @click="saveSettings" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center text-sm" :disabled="saving">
            <svg v-if="saving" class="animate-spin -ms-1 me-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <svg v-else class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
            {{ saving ? $t('settings.saving') : $t('settings.save_changes') }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center p-12">
        <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>

      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <!-- Tabs -->
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8 px-6 space-x-reverse" aria-label="Tabs">
            <button @click="activeTab = 'general'" :class="activeTab === 'general' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" class="whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm">
              {{ $t('settings.general_branding') }}
            </button>
            <button @click="activeTab = 'financial'" :class="activeTab === 'financial' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" class="whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm">
              {{ $t('settings.financial_settings') }}
            </button>
            <button @click="activeTab = 'localization'" :class="activeTab === 'localization' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" class="whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm">
              {{ $t('settings.localization') }}
            </button>
            <button @click="activeTab = 'pos'" :class="activeTab === 'pos' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" class="whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm">
              {{ $t('settings.pos_configuration') }}
            </button>
          </nav>
        </div>

        <div class="p-6">
          <!-- General Tab -->
          <div v-if="activeTab === 'general'" class="space-y-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">{{ $t('settings.store_name') }}</label>
              <input v-model="settings.storeName" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">{{ $t('settings.logo_url') }}</label>
              <input v-model="settings.logoUrl" type="text" placeholder="https://..." class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">{{ $t('settings.primary_phone') }}</label>
                <input v-model="settings.phone" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">{{ $t('settings.business_address') }}</label>
                <textarea v-model="settings.address" rows="2" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"></textarea>
              </div>
            </div>
          </div>

          <!-- Financial Tab -->
          <div v-if="activeTab === 'financial'" class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">{{ $t('settings.currency_symbol') }}</label>
                <select v-model="settings.currency" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="$">USD ($)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                  <option value="JD">JOD (JD)</option>
                  <option value="SAR">SAR</option>
                  <option value="AED">AED</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">{{ $t('settings.default_tax_rate') }}</label>
                <input v-model.number="settings.taxRate" type="number" step="0.1" min="0" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">{{ $t('settings.fiscal_year_start') }}</label>
                <input v-model="settings.fiscalYearStart" type="text" placeholder="01-01" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
              </div>
            </div>
            <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex">
              <svg class="w-5 h-5 text-yellow-600 me-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <p class="text-sm text-yellow-800 font-medium">{{ $t('settings.tax_warning') }}</p>
            </div>
          </div>

          <!-- Localization Tab -->
          <div v-if="activeTab === 'localization'" class="space-y-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">{{ $t('settings.default_language') || 'Default Language' }}</label>
              <select v-model="settings.defaultLanguage" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
                <option value="ar">العربية (Arabic - RTL)</option>
                <option value="en">English (LTR)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">{{ $t('settings.allowed_languages') || 'Allowed Languages' }}</label>
              <div class="space-y-2">
                <label class="flex items-center space-x-3 cursor-pointer rtl:space-x-reverse">
                  <input type="checkbox" value="ar" v-model="settings.allowedLanguages" class="w-5 h-5 text-indigo-600 rounded border-gray-300">
                  <span class="text-sm font-medium text-gray-900">العربية (Arabic)</span>
                </label>
                <label class="flex items-center space-x-3 cursor-pointer rtl:space-x-reverse">
                  <input type="checkbox" value="en" v-model="settings.allowedLanguages" class="w-5 h-5 text-indigo-600 rounded border-gray-300">
                  <span class="text-sm font-medium text-gray-900">English</span>
                </label>
              </div>
            </div>
          </div>

          <!-- POS Tab -->
          <div v-if="activeTab === 'pos'" class="space-y-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">{{ $t('settings.receipt_header') }}</label>
              <textarea v-model="settings.receiptHeader" rows="2" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500" :placeholder="$t('settings.receipt_header_placeholder')"></textarea>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">{{ $t('settings.receipt_footer') }}</label>
              <textarea v-model="settings.receiptFooter" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500" :placeholder="$t('settings.receipt_footer_placeholder')"></textarea>
            </div>
            
            <div class="mt-8 p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <h4 class="text-xs font-black text-gray-500 uppercase tracking-wider mb-4 text-center">{{ $t('settings.receipt_preview') }}</h4>
              <div class="bg-white max-w-xs mx-auto p-4 rounded shadow-sm font-mono text-xs text-center border-t-8 border-gray-800">
                <p v-if="settings.storeName" class="font-bold text-base mb-1">{{ settings.storeName }}</p>
                <p v-if="settings.address" class="text-gray-500 mb-1">{{ settings.address }}</p>
                <p v-if="settings.phone" class="text-gray-500 mb-3">{{ settings.phone }}</p>
                <p class="mb-4 whitespace-pre-line">{{ settings.receiptHeader }}</p>
                
                <div class="border-t border-dashed border-gray-300 py-2 my-2 flex justify-between">
                  <span>{{ $t('settings.item_a') }}</span>
                  <span>{{ settings.currency }}100.00</span>
                </div>
                <div class="border-t border-dashed border-gray-300 py-2 my-2 flex justify-between font-bold">
                  <span>{{ $t('settings.total_incl') }} {{ settings.taxRate }}{{ $t('settings.tax') }}</span>
                  <span>{{ settings.currency }}115.00</span>
                </div>
                
                <p class="mt-4 whitespace-pre-line text-gray-500">{{ settings.receiptFooter }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Settings' })

import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { $api } = useNuxtApp()
const loading = ref(true)
const saving = ref(false)
const activeTab = ref('general')

const settings = ref({
  storeName: '',
  logoUrl: '',
  currency: '$',
  taxRate: 15,
  receiptHeader: '',
  receiptFooter: '',
  address: '',
  phone: '',
  fiscalYearStart: '01-01',
  allowedLanguages: ['ar', 'en'],
  defaultLanguage: 'ar'
})

const fetchSettings = async () => {
  loading.value = true
  try {
    const data = await $api('/settings')
    if (data) {
      settings.value = data
    }
  } catch (error) {
    console.error('Failed to load settings', error)
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    const data = await $api('/settings', {
      method: 'PUT',
      body: settings.value
    })
    settings.value = data
    alert(useNuxtApp().$i18n.t('settings.saved_successfully'))
  } catch (error) {
    console.error('Failed to save settings', error)
    alert(useNuxtApp().$i18n.t('settings.failed_save'))
  } finally {
    saving.value = false
  }
}

onMounted(fetchSettings)
</script>
