import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(HttpBackend)
  .init({
    backend: {
      loadPath: "/locales/{{ns}}/{{lng}}.json",
    },
    fallbackLng: {
      en: ["en"],
      zh: ["zh"],
    },
    debug: import.meta.env.DEV,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
    ns: ["nav", "daily"],
  });

export default i18n;
