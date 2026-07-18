<template>
  <div class="p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black text-gray-900">{{ $t('restaurant.tables_grid') }}</h2>
          <p class="text-sm text-gray-500">{{ $t('restaurant.description') }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <button v-for="table in tables" :key="table._id" @click="openTable(table)"
                class="relative aspect-square rounded-3xl p-4 flex flex-col items-center justify-center transition-all transform hover:-translate-y-1 hover:shadow-lg border-2"
                :class="table.status === 'Available' ? 'bg-white border-green-100 hover:border-green-300' : 'bg-indigo-50 border-indigo-200 hover:border-indigo-400'">
          
          <div class="absolute top-3 end-3 w-3 h-3 rounded-full"
               :class="table.status === 'Available' ? 'bg-green-500' : 'bg-indigo-600 animate-pulse'"></div>
          
          <span class="icon-[heroicons--user-group] w-8 h-8 mb-2" :class="table.status === 'Available' ? 'text-gray-400' : 'text-indigo-600'"></span>
          
          <h3 class="text-2xl font-black text-gray-900">{{ table.tableNumber }}</h3>
          <p class="text-xs font-bold text-gray-500 mt-1">{{ table.capacity }} {{ $t('restaurant.capacity') }}</p>
          
          <div class="mt-auto pt-2 text-xs font-bold w-full text-center" :class="table.status === 'Available' ? 'text-green-600' : 'text-indigo-600'">
            {{ table.status === 'Available' ? $t('restaurant.available') : $t('restaurant.occupied') }}
          </div>
        </button>
        
        <!-- Empty State -->
        <div v-if="!tables.length && !loading" class="col-span-full p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100 border-dashed">
          <span class="icon-[heroicons--squares-2x2] w-12 h-12 text-gray-300 mb-3 mx-auto block"></span>
          {{ $t('restaurant.no_tables') }}
        </div>
      </div>
    </div>
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

onMounted(() => {
  fetchTables()
})
</script>
