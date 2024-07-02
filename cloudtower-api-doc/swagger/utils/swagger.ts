import { OpenAPIV3 } from 'openapi-types';

export const specMap = {
  '4.3.0': import('../../static/specs/4.3.0-swagger.json'),
  '4.2.0': import('../../static/specs/4.2.0-swagger.json'),
  '4.0.0': import('../../static/specs/4.0.0-swagger.json'),
  '3.4.0': import('../../static/specs/3.4.0-swagger.json'),
  '3.3.0': import('../../static/specs/3.3.0-swagger.json'),
  '3.2.0': import('../../static/specs/3.2.0-swagger.json'),
  '3.1.0': import('../../static/specs/3.1.0-swagger.json'),
  '3.0.0': import('../../static/specs/3.0.0-swagger.json'),
  '2.8.0': import('../../static/specs/2.8.0-swagger.json'),
  '2.7.0': import('../../static/specs/2.7.0-swagger.json'),
  '2.6.0': import('../../static/specs/2.6.0-swagger.json'),
  '2.5.0': import('../../static/specs/2.5.0-swagger.json'),
  '2.4.0': import('../../static/specs/2.4.0-swagger.json'),
  '2.3.0': import('../../static/specs/2.3.0-swagger.json'),
  '2.2.0': import('../../static/specs/2.2.0-swagger.json'),
  '2.1.0': import('../../static/specs/2.1.0-swagger.json'),
  '2.0.0': import('../../static/specs/2.0.0-swagger.json'),
  '1.10.0': import('../../static/specs/1.10.0-swagger.json'),
  '1.9.0': import('../../static/specs/1.9.0-swagger.json'),
  '1.8.0': import('../../static/specs/1.8.0-swagger.json'),
}


export enum SupportLanguage {
  zh = "zh",
  en = "en",
}

export type ISpec = OpenAPIV3.Document