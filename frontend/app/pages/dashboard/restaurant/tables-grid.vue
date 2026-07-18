<template>
  <div class="p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black text-gray-900">{{ $t('restaurant.tables_grid') }}</h2>
          <p class="text-sm text-gray-500">{{ $t('restaurant.description') }}</p>
        </div>
        <div class="flex space-x-3 rtl:space-x-reverse">
          <NuxtLink to="/dashboard/restaurant/sections" class="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition flex items-center">
            <svg class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            {{ $t('restaurant.sections_management') }}
          </NuxtLink>
          <button @click="openAddModal" class="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-gray-800 transition flex items-center">
            <svg class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            {{ $t('restaurant.add_table') }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <button v-for="table in tables" :key="table._id" @click="openTable(table)"
                class="relative aspect-square rounded-3xl p-4 flex flex-col items-center justify-center transition-all transform hover:-translate-y-1 hover:shadow-lg border-2"
                :class="table.status === 'Available' ? 'bg-white border-green-100 hover:border-green-300' : 'bg-indigo-50 border-indigo-200 hover:border-indigo-400'">
          
          <div class="absolute top-3 end-3 w-3 h-3 rounded-full"
               :class="table.status === 'Available' ? 'bg-green-500' : 'bg-indigo-600 animate-pulse'"></div>
          
          <svg class="w-8 h-8 mb-2" :class="table.status === 'Available' ? 'text-gray-400' : 'text-indigo-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          
          <h3 class="text-2xl font-black text-gray-900">{{ table.tableNumber }}</h3>
          <p class="text-xs font-bold text-gray-500 mt-1">{{ table.capacity }} {{ $t('restaurant.capacity') }}</p>
          
          <button @click.stop="openEditModal(table)" class="absolute top-3 start-3 w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-300 transition opacity-0 group-hover:opacity-100">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          </button>
          
          <div class="mt-auto pt-2 text-xs font-bold w-full text-center" :class="table.status === 'Available' ? 'text-green-600' : 'text-indigo-600'">
            {{ table.status === 'Available' ? $t('restaurant.available') : $t('restaurant.occupied') }}
          </div>
        </button>
        
        <!-- Empty State -->
        <div v-if="!tables.length && !loading" class="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
          <svg class="w-12 h-12 text-gray-300 mb-3 mx-auto block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          <h3 class="text-lg font-bold text-gray-900 mb-1">{{ $t('restaurant.no_tables') }}</h3>
        </div>
      </div>
    </div>
    
    <RestaurantTableFormModal 
      :is-open="isModalOpen"
      :editing-table="editingTable"
      @close="isModalOpen = false"
      @saved="fetchTables"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'dashboard'
})

const { $api } = useNuxtApp()
const router = useRouter()
const tables = ref([])
const loading = ref(true)

const isModalOpen = ref(false)
const editingTable = ref(null)

const fetchTables = async () => {
  loading.value = true
  try {
    const data = await $api('/restaurant/tables')
    tables.value = data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const openTable = (table) => {
  router.push({ path: '/dashboard/restaurant/pos-terminal', query: { tableId: table._id } })
}

const openAddModal = () => {
  editingTable.value = null
  isModalOpen.value = true
}

const openEditModal = (table) => {
  editingTable.value = table
  isModalOpen.value = true
}

onMounted(() => {
  fetchTables()
})
</script>
