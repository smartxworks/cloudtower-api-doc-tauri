import { OpenAPIV3 } from 'openapi-types';

import swaggerSpec1_8 from "../specs/1.8.0-swagger.json";
import swaggerSpec1_9 from '../specs/1.9.0-swagger.json';
import swaggerSpec1_10 from '../specs/1.10.0-swagger.json';
import swaggerSpec2_0 from '../specs/2.0.0-swagger.json';
import swaggerSpec2_1 from '../specs/2.1.0-swagger.json';
import swaggerSpec2_2 from '../specs/2.2.0-swagger.json';
import swaggerSpec2_3 from '../specs/2.3.0-swagger.json';
import swaggerSpec2_4 from '../specs/2.4.0-swagger.json';
import swaggerSpec2_5 from '../specs/2.5.0-swagger.json';
import swaggerSpec2_6 from '../specs/2.6.0-swagger.json';
import swaggerSpec2_7 from '../specs/2.7.0-swagger.json';
import swaggerSpec2_8 from '../specs/2.8.0-swagger.json';
import swaggerSpec3_0 from '../specs/3.0.0-swagger.json';

import { splitSchema, wrapSpecWithI18n  } from './wrap';

export const specMap = {
  '3.0.0': swaggerSpec3_0,
  '2.8.0': swaggerSpec2_8,
  '2.7.0': swaggerSpec2_7,
  '2.6.0': swaggerSpec2_6,
  '2.5.0': swaggerSpec2_5,
  '2.4.0': swaggerSpec2_4,
  '2.3.0': swaggerSpec2_3,
  '2.2.0': swaggerSpec2_2,
  '2.1.0': swaggerSpec2_1,
  '2.0.0': swaggerSpec2_0,
  '1.10.0': swaggerSpec1_10,
  '1.9.0': swaggerSpec1_9,
  '1.8.0': swaggerSpec1_8,
}

export enum SupportLanguage {
  zh = "zh",
  en = "en",
}

export type ISpec = OpenAPIV3.Document