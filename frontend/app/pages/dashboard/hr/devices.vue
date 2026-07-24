<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <div class="max-w-5xl mx-auto space-y-6">
      
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 ">
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight truncate">{{ $t('devices.title') }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ $t('devices.description') }}</p>
        </div>
        <button @click="showModal = true" class="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-200">
          {{ $t('devices.register_device') }}
        </button>
      </div>

      <div v-if="loading" class="flex justify-center p-12">
        <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>

      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('devices.device_name') }}</th>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('devices.serial_number') }}</th>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">IP Address</th>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('devices.status') }}</th>
              <th class="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase">{{ $t('devices.last_ping') }}</th>
              <th class="px-6 py-4 text-end text-xs font-black text-gray-500 uppercase">{{ $t('devices.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="dev in devices" :key="dev._id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{{ dev.deviceName }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{{ dev.serialNumber }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{{ dev.ipAddress || 'N/A' }}:{{ dev.port || 4370 }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="{'bg-secondary-100 text-secondary-800': dev.status === 'Online', 'bg-red-100 text-red-800': dev.status === 'Offline'}" class="px-2 py-1 text-[10px] font-bold uppercase rounded-md">
                  {{ dev.status === 'Online' ? $t('devices.online') : (dev.status === 'Offline' ? $t('devices.offline') : dev.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ dev.lastPing ? new Date(dev.lastPing).toLocaleString() : $t('devices.never') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-end space-x-2">
                <button @click="fetchLogs(dev._id)" class="text-primary-600 hover:text-primary-900 font-bold text-sm bg-primary-50 px-3 py-1 rounded-lg me-2">Fetch Data</button>
                <button @click="deleteDevice(dev._id)" class="text-red-600 hover:text-red-900 font-bold text-sm bg-red-50 px-3 py-1 rounded-lg">{{ $t('devices.delete') }}</button>
              </td>
            </tr>
            <tr v-if="devices.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500 font-bold">{{ $t('devices.no_devices') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add Device Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 class="text-lg font-bold text-gray-900">{{ $t('devices.register_title') }}</h3>
            <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <form @submit.prevent="saveDevice" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('devices.device_name') }}</label>
              <input type="text" v-model="form.deviceName" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" :placeholder="$t('devices.name_placeholder')">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">{{ $t('devices.serial_number') }}</label>
              <input type="text" v-model="form.serialNumber" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 font-mono" :placeholder="$t('devices.sn_placeholder')">
              <p class="text-xs text-gray-500 mt-1">{{ $t('devices.sn_hint') }}</p>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">IP Address</label>
              <input type="text" v-model="form.ipAddress" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 font-mono" placeholder="192.168.1.201">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Port</label>
              <input type="number" v-model="form.port" required class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 font-mono" placeholder="4370">
            </div>
            <div class="pt-4 flex justify-end gap-3">
              <button type="button" @click="showModal = false" class="px-4 py-2 border border-gray-300 rounded-xl font-medium">{{ $t('devices.cancel') }}</button>
              <button type="submit" :disabled="saving" class="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold">
                {{ saving ? $t('devices.registering') : $t('devices.register_btn') }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Biometric Devices' })

import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { $api } = useNuxtApp()

const devices = ref([])
const loading = ref(true)
const showModal = ref(false)
const saving = ref(false)

const form = ref({
  deviceName: '',
  serialNumber: '',
  ipAddress: '',
  port: 4370
})

const fetchDevices = async () => {
  loading.value = true
  try {
    devices.value = await $api('/hr/devices')
  } catch (err) {
    alert(useNuxtApp().$i18n.t('devices.failed_load'))
  } finally {
    loading.value = false
  }
}

const saveDevice = async () => {
  saving.value = true
  try {
    await $api('/hr/devices', {
      method: 'POST',
      body: form.value
    })
    showModal.value = false
    form.value = { deviceName: '', serialNumber: '' }
    await fetchDevices()
  } catch (err) {
    alert(err.response?.data?.message || useNuxtApp().$i18n.t('devices.failed_register'))
  } finally {
    saving.value = false
  }
}

const deleteDevice = async (id) => {
  if (!confirm(useNuxtApp().$i18n.t('devices.delete_confirm'))) return
  try {
    await $api(`/hr/devices/${id}`, { method: 'DELETE' })
    await fetchDevices()
  } catch (err) {
    alert(useNuxtApp().$i18n.t('devices.failed_delete'))
  }
}

const fetchLogs = async (id) => {
  try {
    alert('Fetching data from device... This may take a few seconds.')
    const res = await $api(`/hr/devices/${id}/fetch`, { method: 'POST' })
    alert(`Success: ${res.message}. Added: ${res.addedLogs}, Processed: ${res.processedLogs}`)
  } catch (err) {
    alert(err.response?.data?.message || err.message || 'Failed to fetch data')
  }
}

onMounted(fetchDevices)
</script>
