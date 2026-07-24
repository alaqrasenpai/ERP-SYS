<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-bold text-gray-900">إدارة أنواع الإجازات</h3>
      <button @click="openModal()" class="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-700">
        + نوع جديد
      </button>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full text-right">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase">اسم الإجازة</th>
            <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase">مدفوعة؟</th>
            <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase">الرصيد الافتراضي (أيام)</th>
            <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase w-24">إجراءات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading" class="text-center">
            <td colspan="4" class="py-8 text-gray-400">جاري التحميل...</td>
          </tr>
          <tr v-else-if="leaveTypes.length === 0" class="text-center">
            <td colspan="4" class="py-8 text-gray-400">لا يوجد أنواع إجازات مضافة</td>
          </tr>
          <tr v-for="type in leaveTypes" :key="type._id" class="hover:bg-gray-50 transition-colors">
            <td class="py-3 px-4 font-bold text-gray-900">{{ type.name }}</td>
            <td class="py-3 px-4">
              <span v-if="type.isPaid" class="bg-secondary-100 text-secondary-800 text-xs px-2 py-1 rounded-full">نعم</span>
              <span v-else class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">لا</span>
            </td>
            <td class="py-3 px-4 text-gray-600">{{ type.defaultBalance || 0 }}</td>
            <td class="py-3 px-4 flex gap-2">
              <button @click="openModal(type)" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
              <button @click="deleteType(type._id)" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" @click.stop>
        <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="font-bold text-gray-900">{{ editingId ? 'تعديل نوع إجازة' : 'إضافة نوع إجازة جديد' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>
        <form @submit.prevent="saveType" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">اسم الإجازة</label>
            <input v-model="form.name" required type="text" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">الرصيد الافتراضي المسموح (أيام)</label>
            <input v-model.number="form.defaultBalance" type="number" min="0" class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500">
            <p class="text-xs text-gray-500 mt-1">يمكن تعيين الرصيد لكل موظف لاحقاً من صفحة الإجازات.</p>
          </div>
          <div class="flex items-center mt-2">
            <input v-model="form.isPaid" type="checkbox" id="isPaid" class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500">
            <label for="isPaid" class="ms-2 block text-sm font-medium text-gray-700">هذه الإجازة مدفوعة الراتب (تغطي الراتب)</label>
          </div>
          <div class="pt-4 flex gap-3">
            <button type="submit" class="flex-1 bg-primary-600 text-white py-2.5 rounded-xl font-bold hover:bg-primary-700" :disabled="saving">
              {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
            </button>
            <button type="button" @click="closeModal" class="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-200">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const { $api } = useNuxtApp()

const leaveTypes = ref([])
const loading = ref(true)
const showModal = ref(false)
const saving = ref(false)
const editingId = ref(null)

const form = ref({
  name: '',
  isPaid: false,
  defaultBalance: 0
})

const fetchTypes = async () => {
  try {
    loading.value = true
    const data = await $api('/settings/leave-types')
    leaveTypes.value = data
  } catch (error) {
    console.error('Failed to load leave types', error)
  } finally {
    loading.value = false
  }
}

const openModal = (type = null) => {
  if (type) {
    editingId.value = type._id
    form.value = { ...type }
  } else {
    editingId.value = null
    form.value = { name: '', isPaid: false, defaultBalance: 0 }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveType = async () => {
  saving.value = true
  try {
    if (editingId.value) {
      await $api(`/settings/leave-types/${editingId.value}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      await $api('/settings/leave-types', {
        method: 'POST',
        body: form.value
      })
    }
    await fetchTypes()
    closeModal()
  } catch (error) {
    console.error('Failed to save', error)
    alert('حدث خطأ أثناء الحفظ')
  } finally {
    saving.value = false
  }
}

const deleteType = async (id) => {
  if (!confirm('هل أنت متأكد من حذف نوع الإجازة؟')) return
  try {
    await $api(`/settings/leave-types/${id}`, { method: 'DELETE' })
    await fetchTypes()
  } catch (error) {
    console.error('Failed to delete', error)
    alert('حدث خطأ أثناء الحذف')
  }
}

onMounted(() => {
  fetchTypes()
})
</script>
