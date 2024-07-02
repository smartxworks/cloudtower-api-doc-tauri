import i18next from "i18next";
import { OpenAPIV3 } from 'openapi-types';
import { SupportLanguage } from "./utils";
import enComponents from './locales/en/components.json';
import zhComponents from './locales/zh/components.json';

import zh1_8Api from './locales/zh/1.8.0.json';
import en1_8API from './locales/en/1.8.0.json'

import zh1_9Api from './locales/zh/1.9.0.json';
import en1_9API from './locales/en/1.9.0.json'

import zh1_10Api from './locales/zh/1.10.0.json';
import en1_10Api from './locales/en/1.10.0.json'

import zh2_0API from './locales/zh/2.0.0.json';
import en2_0API from './locales/en/2.0.0.json';

import zh2_1API from './locales/zh/2.1.0.json';
import en2_1API from './locales/en/2.1.0.json';


import zh2_2API from './locales/zh/2.2.0.json';
import en2_2API from './locales/en/2.2.0.json';

import zh2_3API from './locales/zh/2.3.0.json';
import en2_3API from './locales/en/2.3.0.json';

import zh2_4API from './locales/zh/2.4.0.json';
import en2_4API from './locales/en/2.4.0.json';


import zh2_5API from './locales/zh/2.5.0.json';
import en2_5API from './locales/en/2.5.0.json';

import zh2_6API from './locales/zh/2.6.0.json';
import en2_6API from './locales/en/2.6.0.json';


import zh2_7API from './locales/zh/2.7.0.json';
import en2_7API from './locales/en/2.7.0.json';

import zh2_8API from './locales/zh/2.8.0.json';
import en2_8API from './locales/en/2.8.0.json';

import zh3_0API from './locales/zh/3.0.0.json';
import en3_0API from './locales/en/3.0.0.json';

import zh3_1API from './locales/zh/3.1.0.json';
import en3_1API from './locales/en/3.1.0.json';

import zh3_2API from './locales/zh/3.2.0.json';
import en3_2API from './locales/en/3.2.0.json';


import zh3_3API from './locales/zh/3.3.0.json';
import en3_3API from './locales/en/3.3.0.json';

import zh3_4API from './locales/zh/3.4.0.json';
import en3_4API from './locales/en/3.4.0.json';



import zh4_0API from './locales/zh/4.0.0.json';
import en4_0API from './locales/en/4.0.0.json';

import zh4_2API from './locales/zh/4.2.0.json';
import en4_2API from './locales/en/4.2.0.json';

import zh4_3API from './locales/zh/4.3.0.json';
import en4_3API from './locales/en/4.3.0.json';

export const fallbackNS = ['4_3_0','4_2_0','4_0_0','3_4_0','3_3_0', '3_2_0', '3_1_0', '3_0_0', '2_8_0', '2_7_0', '2_6_0', '2_5_0', '2_4_0', '2_3_0', '2_2_0', '2_1_0', '2_0_0', '1_10_0', '1_9_0', '1_8_0'];
export type ApiDoc = {
  summary: string;
  description: string;
  examples: Record<number, OpenAPIV3.ExampleObject>;
  responses: Record<string, string>;
};

i18next.init({
  resources: {
    [SupportLanguage.en]: {
        ['1_8_0']: en1_8API,
        ['1_9_0']: en1_9API,
        ['1_10_0']: en1_10Api,
        ['2_0_0']: en2_0API,
        ['2_1_0']: en2_1API,
        ['2_2_0']: en2_2API,
        ['2_3_0']: en2_3API,
        ['2_4_0']: en2_4API,
        ['2_5_0']: en2_5API,
        ['2_6_0']: en2_6API,
        ['2_7_0']: en2_7API,
        ['2_8_0']: en2_8API,
        ['3_0_0']: en3_0API,
        ['3_1_0']: en3_1API,
        ['3_2_0']: en3_2API,
        ['3_3_0']: en3_3API,
        ['3_4_0']: en3_4API,
        ['4_0_0']: en4_0API,
        ['4_2_0']: en4_2API,
        ['4_3_0']: en4_3API,
        components: enComponents,
    },
    [SupportLanguage.zh]: {
        ['1_8_0']:zh1_8Api,
        ['1_9_0']:zh1_9Api,
        ['1_10_0']: zh1_10Api,
        ['2_0_0']: zh2_0API,
        ['2_1_0']: zh2_1API,
        ['2_2_0']: zh2_2API,
        ['2_3_0']: zh2_3API,
        ['2_4_0']: zh2_4API,
        ['2_5_0']: zh2_5API,
        ['2_6_0']: zh2_6API,
        ['2_7_0']: zh2_7API,
        ['2_8_0']: zh2_8API,
        ['3_0_0']: zh3_0API,
        ['3_1_0']: zh3_1API,
        ['3_2_0']: zh3_2API,
        ['3_3_0']: zh3_3API,
        ['3_4_0']: zh3_4API,
        ['4_0_0']: zh4_0API,
        ['4_2_0']: zh4_2API,
        ['4_3_0']: zh4_3API,
        components: zhComponents,
    },
  },
  lng: SupportLanguage.zh,
  updateMissing: true,
  fallbackLng: [SupportLanguage.en, SupportLanguage.zh],
  fallbackNS,
  interpolation: {
    prefix: "{",
    suffix: "}",
    escapeValue: false,
  },
  keySeparator: false,
  ns: ['1_8_0', '1_9_0', '1_10_0','2_0_0', '2_1_0', '2_2_0', '2_3_0', '2_4_0', '2_5_0','2_6_0', '2_7_0','2_8_0', '3_0_0', '3_1_0','3_2_0', '3_3_0', '3_4_0', '4_0_0', '4_2_0','4_3_0','components'],
  nsSeparator: ".",
  load: "currentOnly",
  react: {
    bindI18n: "languageChanged addResource",
  },
});


export default i18next;
