import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './i18n/resources';

const i18nInstance = createInstance();

i18nInstance.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18nInstance;