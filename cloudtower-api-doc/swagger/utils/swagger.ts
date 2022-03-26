import { OpenAPIV3 } from 'openapi-types';
import swaggerSpec1_8 from "../specs/v1.8.0-swagger.json";
import swaggerSpec1_9 from '../specs/v1.9.0-swagger.json';
import swaggerSpec1_10 from '../specs/v1.10.0-swagger.json';

export const specMap = {
  'v1.8.0': swaggerSpec1_8,
  'v1.9.0': swaggerSpec1_9,
  'v1.10.0': swaggerSpec1_10,
}

export const hideApiMap = {
  'v1.10.0': [
    '/upload-content-library-image',
    '/update-content-library-image',
    '/distribute-content-library-image-clusters',
    '/remove-content-library-image-clusters',
    '/delete-content-library-image',
    '/clone-content-library-vm-template-from-vm',
    '/convert-content-library-vm-template-from-vm',
    '/update-content-library-vm-template',
    '/distribute-content-library-vm-template-clusters',
    '/remove-content-library-vm-template-clusters',
    '/delete-content-library-vm-template',
    '/get-user-login-infoes',
    '/get-user-login-infoes-connection',
    '/get-user-sessions',
    '/get-user-sessions-connection',
  ]
}

export enum SupportLanguage {
  zh = "zh",
  en = "en",
}

export type ISpec = OpenAPIV3.Document

