<template>
  <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-b-xl">
    <div class="flex flex-1 justify-between sm:hidden">
      <button @click="prevPage" :disabled="currentPage === 1" class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">{{ $t('pagination.previous', 'السابق') }}</button>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">{{ $t('pagination.next', 'التالي') }}</button>
    </div>
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700 font-bold">
          {{ $t('pagination.showing', 'عرض') }} <span class="font-bold">{{ startIndex + 1 }}</span> {{ $t('pagination.to', 'إلى') }} <span class="font-bold">{{ endIndex }}</span> {{ $t('pagination.of', 'من أصل') }} <span class="font-bold">{{ totalItems }}</span> {{ $t('pagination.results', 'نتيجة') }}
        </p>
      </div>
      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <button @click="prevPage" :disabled="currentPage === 1" class="relative inline-flex items-center rtl:rounded-r-md ltr:rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
            <span class="sr-only">{{ $t('pagination.previous', 'السابق') }}</span>
            <svg class="h-5 w-5 rtl:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <!-- Left Chevron (Prev in LTR) -->
              <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <template v-for="page in pages" :key="page">
            <span v-if="page === '...'" class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">...</span>
            <button v-else @click="goToPage(page)" :class="[page === currentPage ? 'relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0']">
              {{ page }}
            </button>
          </template>
          
          <button @click="nextPage" :disabled="currentPage === totalPages" class="relative inline-flex items-center rtl:rounded-l-md ltr:rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
            <span class="sr-only">{{ $t('pagination.next', 'التالي') }}</span>
            <svg class="h-5 w-5 rtl:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <!-- Right Chevron (Next in LTR) -->
              <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalItems: { type: Number, required: true },
  currentPage: { type: Number, required: true },
  itemsPerPage: { type: Number, default: 15 }
})

const emit = defineEmits(['update:currentPage'])

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage))
const startIndex = computed(() => (props.currentPage - 1) * props.itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + props.itemsPerPage, props.totalItems))

const pages = computed(() => {
  const range = []
  for (let i = 1; i <= totalPages.value; i++) {
    if (i === 1 || i === totalPages.value || (i >= props.currentPage - 1 && i <= props.currentPage + 1)) {
      range.push(i)
    } else if (range[range.length - 1] !== '...') {
      range.push('...')
    }
  }
  return range
})

const goToPage = (page) => {
  emit('update:currentPage', page)
}

const prevPage = () => {
  if (props.currentPage > 1) {
    emit('update:currentPage', props.currentPage - 1)
  }
}

const nextPage = () => {
  if (props.currentPage < totalPages.value) {
    emit('update:currentPage', props.currentPage + 1)
  }
}
</script>
