import i18next from "i18next";
import { OpenAPIV3 } from 'openapi-types';
import { SupportLanguage } from "./utils";
import enComponents from './locales/en/components.json';
import zhComponents from './locales/zh/components.json';

import zh1_8Api from './locales/zh/v1.8.0.json';
import en1_8API from './locales/en/v1.8.0.json'

import zh1_9Api from './locales/zh/v1.9.0.json';
import en1_9API from './locales/en/v1.9.0.json'

import zh1_10Api from './locales/zh/v1.10.0.json';
import en1_10Api from './locales/en/v1.10.0.json'

import zh2_0API from './locales/zh/v2.0.0.json';
import en2_0API from './locales/en/v2.0.0.json';

import zh2_1API from './locales/zh/v2.1.0.json';
import en2_1API from './locales/en/v2.1.0.json';


import zh2_2API from './locales/zh/v2.2.0.json';
import en2_2API from './locales/en/v2.2.0.json';


export type ApiDoc = {
  summary: string;
  description: string;
  examples: Record<number, OpenAPIV3.ExampleObject>;
  responses: Record<string, string>;
};

i18next.init({
  resources: {
    [SupportLanguage.en]: {
        ['v1_8_0']: en1_8API,
        ['v1_9_0']: en1_9API,
        ['v1_10_0']: en1_10Api,
        ['v2_0_0']: en2_0API,
        ['v2_1_0']: en2_1API,
        ['v2_2_0']: en2_2API,
        components: enComponents,
    },
    [SupportLanguage.zh]: {
        ['v1_8_0']:zh1_8Api,
        ['v1_9_0']:zh1_9Api,
        ['v1_10_0']: zh1_10Api,
        ['v2_0_0']: zh2_0API,
        ['v2_1_0']: zh2_1API,
        ['v2_2_0']: zh2_2API,
        components: zhComponents,
    },
  },
  lng: SupportLanguage.zh,
  updateMissing: true,
  fallbackLng: [SupportLanguage.en, SupportLanguage.zh],
  fallbackNS: ['v1_8_0','v1_9_0','v1_10_0', 'v2_0_0', 'v2_1_0','v2_2_0'],
  interpolation: {
    prefix: "{",
    suffix: "}",
    escapeValue: false,
  },
  keySeparator: false,
  ns: ['v1_8_0', 'v1_9_0', 'v1_10_0','v2_0_0', 'v2_1_0', 'v2_2_0', 'components'],
  nsSeparator: ".",
  load: "currentOnly",
  react: {
    bindI18n: "languageChanged addResource",
  },
});


export default i18next;
