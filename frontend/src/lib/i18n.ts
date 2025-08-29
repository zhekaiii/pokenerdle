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
    supportedLngs: ["en", "zh"],
    nonExplicitSupportedLngs: true,
    fallbackLng: (code: string) => {
      if (code.startsWith("en")) return ["en"];
      if (code.startsWith("zh")) return ["zh"];
      return ["en"];
    },
    debug: import.meta.env.DEV,
    load: "languageOnly",

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

export default i18n;
