import i18next from "i18next";
import _ from 'lodash';
import { OpenAPIV3 } from 'openapi-types';
import { SupportLanguage } from "./utils";
import enComponents from './locales/en/components.json';
import zhComponents from './locales/zh/components.json';

import zh1_8Api from '../generated/locales/zh/v1.8.0.json';
import zh1_9Api from '../generated/locales/zh/v1.9.0.json';

export type ApiDoc = {
  summary: string;
  description: string;
  examples: Record<number, OpenAPIV3.ExampleObject>;
  responses: Record<string, string>;
};

i18next.init({
  resources: {
    [SupportLanguage.en]: {
        ['v1_8_0']: {},
        ['v1_9_0']: {},
        components: enComponents,
    },
    [SupportLanguage.zh]: {
        ['v1_8_0']:zh1_8Api,
        ['v1_9_0']:zh1_9Api,
        components: zhComponents,
    },
  },
  lng: SupportLanguage.zh,
  updateMissing: true,
  fallbackLng: [SupportLanguage.en, SupportLanguage.zh],
  fallbackNS: ['v1_8_0','v1_9_0'],
  interpolation: {
    prefix: "{",
    suffix: "}",
    escapeValue: false,
  },
  keySeparator: false,
  ns: ['v1_8_0', 'v1_9_0', 'components'],
  nsSeparator: ".",
  load: "currentOnly",
  react: {
    bindI18n: "languageChanged addResource",
  },
});


export default i18next;
