<template>
  <div>
    <NuxtLoadingIndicator color="#4f46e5" :height="3" />
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

<style>
.page-enter-active,
.page-leave-active,
.layout-enter-active,
.layout-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from,
.page-leave-to,
.layout-enter-from,
.layout-leave-to {
  opacity: 0;
  filter: blur(2px);
  transform: translateY(10px);
}
</style>
