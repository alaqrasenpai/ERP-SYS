<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="animate-spin h-8 w-8 text-indigo-600 border-4 border-t-transparent border-indigo-600 rounded-full"></div>
  </div>
</template>

<script setup>
import { navigateTo } from '#app'

definePageMeta({
  middleware: [
    function (to, from) {
      return navigateTo('/')
    }
  ]
})
</script>
