import { OpenAPIV3 } from 'openapi-types';
import swaggerSpec1_8 from "../specs/v1.8.0-swagger.json";
import swaggerSpec1_9 from '../specs/v1.9.0-swagger.json';
import swaggerSpec1_10 from '../specs/v1.10.0-swagger.json';
import swaggerSpec2_0 from '../specs/v2.0.0-swagger.json';
import swaggerSpec2_1 from '../specs/v2.1.0-swagger.json';

export const specMap = {
  'v1.8.0': swaggerSpec1_8,
  'v1.9.0': swaggerSpec1_9,
  'v1.10.0': swaggerSpec1_10,
  'v2.0.0': swaggerSpec2_0,
  'v2.1.0': swaggerSpec2_1,
}

export enum SupportLanguage {
  zh = "zh",
  en = "en",
}

export type ISpec = OpenAPIV3.Document

