import { ref, watch, onMounted } from 'vue'

export const useLanguage = () => {
  const { setLocale, locale } = useI18n()
  
  const allowedLanguages = useState('allowedLanguages', () => ['ar', 'en']) // Default fallback
  const defaultLanguage = useState('defaultLanguage', () => 'ar')
  const userLangCookie = useCookie('user_lang', { maxAge: 60 * 60 * 24 * 365 })

  // Fetch tenant settings to get allowed languages
  const fetchTenantLanguages = async () => {
    try {
      const { $api } = useNuxtApp()
      const settings = await $api('/settings')
      if (settings) {
        if (settings.allowedLanguages && settings.allowedLanguages.length > 0) {
          allowedLanguages.value = settings.allowedLanguages
        } else {
          allowedLanguages.value = ['ar', 'en'] // fallback if not configured
        }
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
