import { ref, watch, onMounted } from 'vue'

export const useLanguage = () => {
  const { setLocale, locale } = useI18n()
  
  const allowedLanguages = ref(['ar', 'en']) // Default fallback
  const defaultLanguage = ref('ar')
  const userLangCookie = useCookie('user_lang', { maxAge: 60 * 60 * 24 * 365 })

  // Fetch tenant settings to get allowed languages
  const fetchTenantLanguages = async () => {
    try {
      const { $api } = useNuxtApp()
      const settings = await $api('/settings')
      if (settings) {
        allowedLanguages.value = settings.allowedLanguages || ['ar', 'en']
        defaultLanguage.value = settings.defaultLanguage || 'ar'
      }
    } catch (e) {
      console.error('Failed to fetch tenant language settings', e)
    }
  }

  const setLanguage = (langCode: string) => {
    if (allowedLanguages.value.includes(langCode)) {
      setLocale(langCode)
      userLangCookie.value = langCode
    } else {
      console.warn(`Language ${langCode} is not permitted by Tenant Admin.`)
    }
  }

  const initLanguage = async () => {
    await fetchTenantLanguages()
    
    // Determine which language to load
    let targetLang = defaultLanguage.value
    if (userLangCookie.value && allowedLanguages.value.includes(userLangCookie.value)) {
      targetLang = userLangCookie.value
    } else if (allowedLanguages.value.includes(locale.value)) {
      targetLang = locale.value
    }

    setLanguage(targetLang)
  }

  return {
    allowedLanguages,
    defaultLanguage,
    currentLanguage: locale,
    setLanguage,
    initLanguage
  }
}
