import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ar from './locales/ar.json';

const LANGUAGE_KEY = 'jebshit_language';

// Get stored language or default to Arabic
const getStoredLanguage = (): string => {
  try {
    return localStorage.getItem(LANGUAGE_KEY) || 'ar';
  } catch {
    return 'ar';
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: getStoredLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Update document direction when language changes
i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
  try {
    localStorage.setItem(LANGUAGE_KEY, lng);
  } catch {
    // Ignore localStorage errors
  }
});

// Set initial direction
document.documentElement.dir = getStoredLanguage() === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = getStoredLanguage();

export default i18n;
