import i18next from "i18next";
import { SupportLanguage } from "./utils";
import enTags from "./locales/en/tags.json";
import zhTags from "./locales/zh/tags.json";
import enComponents from './locales/en/components.json';
import zhComponents from './locales/zh/components.json';
import enDescription from './locales/en/description.json';
import zhDescription from './locales/zh/description.json';
import enParameters from './locales/en/parameters.json';
import zhParameters from './locales/zh/parameters.json';

i18next.init({
  resources: {
    [SupportLanguage.en]: {
      translation: {
        tags: enTags,
        components: enComponents,
        description: enDescription,
        parameters: enParameters,
      }
    },
    [SupportLanguage.zh]: {
      translation: {
        tags: zhTags,
        components: zhComponents,
        description: zhDescription,
        parameters: zhParameters
      }
    },
  },
  lng: SupportLanguage.zh,
  updateMissing: true,
  fallbackLng: [SupportLanguage.en, SupportLanguage.zh],
  interpolation: {
    prefix: "{",
    suffix: "}",
    escapeValue: false,
  },
  nsSeparator: ".",
  load: "currentOnly",
  react: {
    bindI18n: "languageChanged addResource",
  },
  parseMissingKeyHandler(key: string) {
    return key;
  },
});


export default i18next;
