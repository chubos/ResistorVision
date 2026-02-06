import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';

import en from './locales/en.json';
import pl from './locales/pl.json';

const LANGUAGE_KEY = '@resistorvision:language';

// Get device language
const getDeviceLanguage = (): string => {
  try {
    const locales = getLocales();
    if (locales && locales.length > 0) {
      const languageCode = locales[0].languageCode;
      return languageCode || 'en';
    }
  } catch (error) {
    // Fallback to English
  }
  return 'en';
};

// Get language from AsyncStorage or use default
const getStoredLanguage = async (): Promise<string> => {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (storedLanguage) {
      return storedLanguage;
    }
  } catch (error) {
    // Fallback to device language
  }
  return getDeviceLanguage();
};

// Synchronous initialization with default language
i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    en: { translation: en },
    pl: { translation: pl },
  },
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// Asynchronously load saved language
getStoredLanguage().then((language) => {
  if (language !== i18n.language) {
    i18n.changeLanguage(language);
  }
});

// Change language and save to AsyncStorage
export const changeLanguage = async (language: string) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
  await i18n.changeLanguage(language);
};


export default i18n;
