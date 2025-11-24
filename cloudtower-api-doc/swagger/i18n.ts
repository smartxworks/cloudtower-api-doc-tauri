import i18next from "i18next";
import { OpenAPIV3 } from "openapi-types";
import { SupportLanguage } from "./utils";
import enComponents from "./locales/en/components.json";
import zhComponents from "./locales/zh/components.json";

import zh2_xAPI from "./locales/zh/2x.json";
import en2_xAPI from "./locales/en/2x.json";

import zh3_xAPI from "./locales/zh/3x.json";
import en3_xAPI from "./locales/en/3x.json";

import zh4_0API from "./locales/zh/4.0.0.json";
import en4_0API from "./locales/en/4.0.0.json";

import zh4_1API from "./locales/zh/4.1.0.json";
import en4_1API from "./locales/en/4.1.0.json";

import zh4_2API from "./locales/zh/4.2.0.json";
import en4_2API from "./locales/en/4.2.0.json";

import zh4_3API from "./locales/zh/4.3.0.json";
import en4_3API from "./locales/en/4.3.0.json";

import zh4_4API from "./locales/zh/4.4.0.json";
import en4_4API from "./locales/en/4.4.0.json";

import zh4_4_1API from "./locales/zh/4.4.1.json";
import en4_4_1API from "./locales/en/4.4.1.json";

import zh4_5API from "./locales/zh/4.5.0.json";
import en4_5API from "./locales/en/4.5.0.json";

import zh4_6API from "./locales/zh/4.6.0.json";
import en4_6API from "./locales/en/4.6.0.json";

import zh4_7API from "./locales/zh/4.7.0.json";
import en4_7API from "./locales/en/4.7.0.json";

export const fallbackNS = [
  "4_7_0",
  "4_6_2",
  "4_6_1",
  "4_6_0",
  "4_5_0",
  "4_4_2",
  "4_4_1",
  "4_4_0",
  "4_3_0",
  "4_2_0",
  "4_1_0",
  "4_0_0",
  "3_4_4",
  "2_8_0",
];
export type ApiDoc = {
  summary: string;
  description: string;
  examples: Record<number, OpenAPIV3.ExampleObject>;
  responses: Record<string, string>;
};

i18next.init({
  resources: {
    [SupportLanguage.en]: {
      ["2_8_0"]: en2_xAPI,
      ["3_4_4"]: en3_xAPI,
      ["4_0_0"]: en4_0API,
      ["4_1_0"]: en4_1API,
      ["4_2_0"]: en4_2API,
      ["4_3_0"]: en4_3API,
      ["4_4_0"]: en4_4API,
      ["4_4_1"]: en4_4_1API,
      ["4_4_2"]: en4_4_1API,
      ["4_5_0"]: en4_5API,
      ["4_6_0"]: en4_6API,
      ["4_6_1"]: en4_6API,
      ["4_6_2"]: en4_6API,
      ["4_7_0"]: en4_7API,
      components: enComponents,
    },
    [SupportLanguage.zh]: {
      ["2_8_0"]: zh2_xAPI,
      ["3_4_4"]: zh3_xAPI,
      ["4_0_0"]: zh4_0API,
      ["4_1_0"]: zh4_1API,
      ["4_2_0"]: zh4_2API,
      ["4_3_0"]: zh4_3API,
      ["4_4_0"]: zh4_4API,
      ["4_4_1"]: zh4_4_1API,
      ["4_4_2"]: zh4_4_1API,
      ["4_5_0"]: zh4_5API,
      ["4_6_0"]: zh4_6API,
      ["4_6_1"]: zh4_6API,
      ["4_6_2"]: zh4_6API,
      ["4_7_0"]: zh4_7API,
      components: zhComponents,
    },
  },
  lng: process.env.DEFAULT_LNG || SupportLanguage.zh,
  updateMissing: true,
  fallbackLng: null,
  fallbackNS,
  returnEmptyString: false,
  returnNull: false,
  interpolation: {
    prefix: "{",
    suffix: "}",
    escapeValue: false,
  },
  keySeparator: false,
  ns: [
    "2_8_0",
    "3_4_4",
    "4_0_0",
    "4_1_0",
    "4_2_0",
    "4_3_0",
    "4_4_0",
    "4_4_1",
    "4_5_0",
    "4_6_0",
    "4_6_2",
    "4_7_0",
    "components",
  ],
  nsSeparator: ".",
  load: "currentOnly",
  react: {
    bindI18n: "languageChanged addResource",
  },
});

export default i18next;
