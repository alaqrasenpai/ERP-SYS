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
import { hexToRgb } from '~/utils/colors'

// Inject CSS variables for primary and secondary colors dynamically based on tenant config
const { data: tenantConfig } = await useAsyncData(
  `global-tenant-${auth.tenantId.value || 'default'}`, 
  () => {
    if (!auth.tenantId.value) return Promise.resolve(null)
    const { $api } = useNuxtApp()
    return $api(`/public/tenant/${auth.tenantId.value}`).catch(() => null)
  },
  { watch: [() => auth.tenantId.value] }
)

useHead({
  htmlAttrs: {
    dir: computed(() => currentLanguage.value === 'ar' ? 'rtl' : 'ltr'),
    lang: computed(() => currentLanguage.value)
  },
  style: [
    {
      children: computed(() => {
        // Use colors from backend if available, otherwise fallbacks
        const pColor = tenantConfig.value?.primaryColor || '#4f46e5'
        const sColor = tenantConfig.value?.secondaryColor || '#10b981'
        
        return `
          :root {
            --color-primary-50: ${hexToRgb(pColor)};
            --color-primary-100: ${hexToRgb(pColor)};
            --color-primary-200: ${hexToRgb(pColor)};
            --color-primary-300: ${hexToRgb(pColor)};
            --color-primary-400: ${hexToRgb(pColor)};
            --color-primary-500: ${hexToRgb(pColor)};
            --color-primary-600: ${hexToRgb(pColor)};
            --color-primary-700: ${hexToRgb(pColor)};
            --color-primary-800: ${hexToRgb(pColor)};
            --color-primary-900: ${hexToRgb(pColor)};
            --color-primary-950: ${hexToRgb(pColor)};
            
            --color-secondary-50: ${hexToRgb(sColor)};
            --color-secondary-100: ${hexToRgb(sColor)};
            --color-secondary-200: ${hexToRgb(sColor)};
            --color-secondary-300: ${hexToRgb(sColor)};
            --color-secondary-400: ${hexToRgb(sColor)};
            --color-secondary-500: ${hexToRgb(sColor)};
            --color-secondary-600: ${hexToRgb(sColor)};
            --color-secondary-700: ${hexToRgb(sColor)};
            --color-secondary-800: ${hexToRgb(sColor)};
            --color-secondary-900: ${hexToRgb(sColor)};
            --color-secondary-950: ${hexToRgb(sColor)};
          }
        `
      })
    }
  ]
})


const route = useRoute()

onMounted(async () => {
  await initLanguage()
  if (auth.isLoggedIn.value && !route.path.startsWith('/super-admin')) {
    auth.fetchUser()
  }
})
</script>
