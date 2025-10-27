import i18next from "i18next";
import { OpenAPIV3 } from "openapi-types";
import { SupportLanguage } from "./utils";
import enComponents from "./locales/en/components.json";
import zhComponents from "./locales/zh/components.json";

export type ApiDoc = {
  summary: string;
  description: string;
  examples: Record<number, OpenAPIV3.ExampleObject>;
  responses: Record<string, string>;
};

i18next.init({
  resources: {
    [SupportLanguage.en]: {
      components: enComponents,
    },
    [SupportLanguage.zh]: {
      components: zhComponents,
    },
  },
  lng: SupportLanguage.zh,
  updateMissing: true,
  fallbackLng: null,
  returnEmptyString: false,
  returnNull: false,
  interpolation: {
    prefix: "{",
    suffix: "}",
    escapeValue: false,
  },
  keySeparator: false,
  nsSeparator: ".",
  load: "currentOnly",
  react: {
    bindI18n: "languageChanged addResource",
  },
});

export default i18next;
