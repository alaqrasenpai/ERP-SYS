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

const route = useRoute()

onMounted(async () => {
  await initLanguage()
  if (auth.isLoggedIn.value && !route.path.startsWith('/super-admin')) {
    auth.fetchUser()
  }
})
</script>
