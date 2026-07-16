<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Document Archive</h1>
          <p class="text-sm text-gray-500 mt-1">Manage and securely store your company files</p>
        </div>
        <div class="flex space-x-4 mt-4 sm:mt-0">
          <NuxtLink to="/" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">Back to Dashboard</NuxtLink>
          <button @click="showFolderModal = true" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 shadow-sm flex items-center transition-colors">
            <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path></svg>
            New Folder
          </button>
          <button @click="showFileModal = true" class="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            Upload File
          </button>
        </div>
      </div>

      <!-- File Manager Grid -->
      <div class="bg-white shadow-sm border border-gray-200 sm:rounded-xl p-8">
        <div class="flex items-center text-gray-600 mb-6">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span class="font-bold text-gray-900">/ Root Directory</span>
        </div>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <!-- Folders -->
          <div v-for="folder in folders" :key="folder._id" class="group border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-all text-center">
            <svg class="w-14 h-14 text-yellow-400 group-hover:scale-110 transition-transform mb-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path></svg>
            <span class="text-sm font-semibold text-gray-800 truncate w-full">{{ folder.name }}</span>
            <span class="text-xs text-gray-400 mt-1">Folder</span>
          </div>

          <!-- Files -->
          <div v-for="file in files" :key="file._id" class="group border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-all text-center" :title="file.fileName">
            <svg class="w-14 h-14 text-gray-300 group-hover:text-indigo-400 group-hover:scale-110 transition-all mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            <span class="text-sm font-semibold text-gray-800 truncate w-full">{{ file.fileName }}</span>
            <span class="text-xs text-gray-400 mt-1">File</span>
          </div>
          
          <div v-if="folders.length === 0 && files.length === 0 && !loading" class="col-span-full py-16 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <svg class="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path></svg>
            <p class="font-medium text-gray-600">This folder is empty</p>
            <p class="text-sm mt-1">Upload a file or create a folder to get started.</p>
          </div>
        </div>
      </div>

      <!-- Add Folder Modal -->
      <div v-if="showFolderModal" class="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity" @click="showFolderModal = false"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-gray-100">
            <form @submit.prevent="createFolder">
              <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="flex items-center mb-4">
                  <div class="w-10 h-10 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mr-3">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path></svg>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900">Create Folder</h3>
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1">Folder Name</label>
                  <input v-model="folderForm.name" type="text" required placeholder="e.g. Q3 Financials" class="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
              </div>
              <div class="bg-gray-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100">
                <button type="submit" class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-5 py-2.5 bg-indigo-600 text-base font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">Create Folder</button>
                <button type="button" @click="showFolderModal = false" class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-5 py-2.5 bg-white text-base font-bold text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Add File Modal -->
      <div v-if="showFileModal" class="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity" @click="showFileModal = false"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-gray-100">
            <form @submit.prevent="uploadFile">
              <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="flex items-center mb-4">
                  <div class="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-3">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900">Upload Document</h3>
                </div>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">File Name</label>
                    <input v-model="fileForm.fileName" type="text" required placeholder="e.g. report.pdf" class="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">File URL / Source</label>
                    <input v-model="fileForm.fileUrl" type="url" required placeholder="https://..." class="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-500">
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100">
                <button type="submit" class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-5 py-2.5 bg-indigo-600 text-base font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">Upload Metadata</button>
                <button type="button" @click="showFileModal = false" class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-5 py-2.5 bg-white text-base font-bold text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
definePageMeta({ 
  layout: 'dashboard',
  middleware: ['auth'] 
})

const { $api } = useNuxtApp()
const folders = ref([])
const files = ref([])
const loading = ref(true)

const showFolderModal = ref(false)
const showFileModal = ref(false)

const folderForm = ref({ name: '' })
const fileForm = ref({ fileName: '', fileUrl: '' })

const fetchData = async () => {
  loading.value = true
  try {
    folders.value = await $api('/archive/folders')
    files.value = await $api('/archive/files')
  } catch (error) {
    console.error('Failed to fetch archive data', error)
  } finally {
    loading.value = false
  }
}

const createFolder = async () => {
  try {
    await $api('/archive/folders', {
      method: 'POST',
      body: folderForm.value
    })
    showFolderModal.value = false
    folderForm.value.name = ''
    fetchData()
  } catch (error) {
    alert('Failed to create folder')
  }
}

const uploadFile = async () => {
  try {
    await $api('/archive/files', {
      method: 'POST',
      body: fileForm.value
    })
    showFileModal.value = false
    fileForm.value = { fileName: '', fileUrl: '' }
    fetchData()
  } catch (error) {
    alert('Failed to save file metadata')
  }
}

onMounted(() => {
  fetchData()
})
</script>
