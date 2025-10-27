import { OpenAPIV3 } from "openapi-types";

export const specMap = {
  "4.7.0": {
    'zh': import("../../static/specs/4.7.0-swagger-zh.json"),
    'en': import("../../static/specs/4.7.0-swagger-en.json"),
  },
  "4.6.1": {
    'zh': import("../../static/specs/4.6.0-swagger-zh.json"),
    'en': import("../../static/specs/4.6.0-swagger-en.json"),
  },
  "4.6.0": {
    'zh': import("../../static/specs/4.6.0-swagger-zh.json"),
    'en': import("../../static/specs/4.6.0-swagger-en.json"),
  },
  // "4.5.0": {
  //   'zh': import("../../static/specs/4.5.0-swagger-zh.json"),
  //   'en': import("../../static/specs/4.5.0-swagger-en.json"),
  // },
  // "4.4.2": {
  //   'zh': import("../../static/specs/4.4.1-swagger-zh.json"),
  //   'en': import("../../static/specs/4.4.1-swagger-en.json"),
  // },
  // "4.4.1": {
  //   'zh': import("../../static/specs/4.4.1-swagger-zh.json"),
  //   'en': import("../../static/specs/4.4.1-swagger-en.json"),
  // },
  // "4.4.0": {
  //   'zh': import("../../static/specs/4.4.0-swagger-zh.json"),
  //   'en': import("../../static/specs/4.4.0-swagger-en.json"),
  // },
  // "4.3.0": {
  //   'zh': import("../../static/specs/4.3.0-swagger-zh.json"),
  //   'en': import("../../static/specs/4.3.0-swagger-en.json"),
  // },
  // "4.2.0": {
  //   'zh': import("../../static/specs/4.2.0-swagger-zh.json"),
  //   'en': import("../../static/specs/4.2.0-swagger-en.json"),
  // },
  // "4.1.0": {
  //   'zh': import("../../static/specs/4.1.0-swagger-zh.json"),
  //   'en': import("../../static/specs/4.1.0-swagger-en.json"),
  // },
  // "4.0.0": {
  //   'zh': import("../../static/specs/4.0.0-swagger-zh.json"),
  //   'en': import("../../static/specs/4.0.0-swagger-en.json"),
  // },
  // "3.4.4": {
  //   'zh': import("../../static/specs/3.4.4-swagger-zh.json"),
  //   'en': import("../../static/specs/3.4.4-swagger-en.json"),
  // },
  // "3.3.0": {
  //   'zh': import("../../static/specs/3.3.0-swagger-zh.json"),
  //   'en': import("../../static/specs/3.3.0-swagger-en.json"),
  // },
  // "3.2.0": {
  //   'zh': import("../../static/specs/3.2.0-swagger-zh.json"),
  //   'en': import("../../static/specs/3.2.0-swagger-en.json"),
  // },
  // "3.1.0": {
  //   'zh': import("../../static/specs/3.1.0-swagger-zh.json"),
  //   'en': import("../../static/specs/3.1.0-swagger-en.json"),
  // },
  // "3.0.0": {
  //   'zh': import("../../static/specs/3.0.0-swagger-zh.json"),
  //   'en': import("../../static/specs/3.0.0-swagger-en.json"),
  // },
  // "2.8.0": {
  //   'zh': import("../../static/specs/2.8.0-swagger-zh.json"),
  //   'en': import("../../static/specs/2.8.0-swagger-en.json"),
  // },
  // "2.7.0": {
  //   'zh': import("../../static/specs/2.7.0-swagger-zh.json"),
  //   'en': import("../../static/specs/2.7.0-swagger-en.json"),
  // },
  // "2.6.0": {
  //   'zh': import("../../static/specs/2.6.0-swagger-zh.json"),
  //   'en': import("../../static/specs/2.6.0-swagger-en.json"),
  // },
  // "2.5.0": {
  //   'zh': import("../../static/specs/2.5.0-swagger-zh.json"),
  //   'en': import("../../static/specs/2.5.0-swagger-en.json"),
  // },
  // "2.4.0": {
  //   'zh': import("../../static/specs/2.4.0-swagger-zh.json"),
  //   'en': import("../../static/specs/2.4.0-swagger-en.json"),
  // },
  // "2.3.0": {
  //   'zh': import("../../static/specs/2.3.0-swagger-zh.json"),
  //   'en': import("../../static/specs/2.3.0-swagger-en.json"),
  // },
  // "2.2.0": {
  //   'zh': import("../../static/specs/2.2.0-swagger-zh.json"),
  //   'en': import("../../static/specs/2.2.0-swagger-en.json"),
  // },
  // "2.1.0": {
  //   'zh': import("../../static/specs/2.1.0-swagger-zh.json"),
  //   'en': import("../../static/specs/2.1.0-swagger-en.json"),
  // },
  // "2.0.0": {
  //   'zh': import("../../static/specs/2.0.0-swagger-zh.json"),
  //   'en': import("../../static/specs/2.0.0-swagger-en.json"),
  // },
  // "1.10.0": {
  //   'zh': import("../../static/specs/1.10.0-swagger-zh.json"),
  //   'en': import("../../static/specs/1.10.0-swagger-en.json"),
  // },
  // "1.9.0": {
  //   'zh': import("../../static/specs/1.9.0-swagger-zh.json"),
  //   'en': import("../../static/specs/1.9.0-swagger-en.json"),
  // },
  // "1.8.0": {
  //   'zh': import("../../static/specs/1.8.0-swagger-zh.json"),
  //   'en': import("../../static/specs/1.8.0-swagger-en.json"),
  // },
};

export enum SupportLanguage {
  zh = "zh",
  en = "en",
}

export type ISpec = OpenAPIV3.Document;
