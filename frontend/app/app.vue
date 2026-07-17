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
const { initLanguage } = useLanguage()

onMounted(async () => {
  await initLanguage()
  if (auth.isLoggedIn.value) {
    auth.fetchUser()
  }
})
</script>
