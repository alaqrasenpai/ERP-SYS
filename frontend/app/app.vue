<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
const auth = useAuth()
const { initLanguage, currentLanguage } = useLanguage()

useHead({
  htmlAttrs: {
    dir: computed(() => currentLanguage.value === 'ar' ? 'rtl' : 'ltr'),
    lang: computed(() => currentLanguage.value)
  }
})

onMounted(async () => {
  await initLanguage()
  if (auth.isLoggedIn.value) {
    auth.fetchUser()
  }
})
</script>
