import i18next from "i18next";
import middleware from "i18next-http-middleware";
import { enTranslations, faTranslations } from "../locales/translations.js";

await i18next.use(middleware.LanguageDetector).init({
  fallbackLng: "fa",
  supportedLngs: ["fa", "en"],
  resources: {
    fa: { translation: faTranslations },
    en: { translation: enTranslations },
  },
  detection: {
    order: ["header", "querystring"],
    lookupHeader: "accept-language",
    lookupQuerystring: "lang",
    caches: false,
  },
  interpolation: {
    escapeValue: false,
  },
});

export { i18next, middleware };
