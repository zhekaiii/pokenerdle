import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

if (!import.meta.env.SSR) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .use(HttpBackend)
    .init({
      backend: {
        loadPath: "/locales/{{ns}}/{{lng}}.json",
      },
      debug: import.meta.env.DEV,

      interpolation: {
        escapeValue: false,
      },

      fallbackLng: "en",

      detection: {
        order: ["localStorage", "navigator", "htmlTag"],
        caches: ["localStorage"],
        convertDetectedLanguage: (code) => {
          if (code.startsWith("en")) return "en";
          if (["zh-TW", "zh-HK", "zh-MO", "zh-Hant"].includes(code)) {
            return "zh-Hant";
          }
          if (code.startsWith("zh")) {
            return "zh-Hans";
          }
          return "en";
        },
      },
    });
} else {
  // SSR setup - minimal configuration without browser plugins
  i18n.use(initReactI18next).init({
    lng: "en", // Default language for SSR
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {}, // Will be loaded client-side
      },
    },
  });
}

export default i18n;
