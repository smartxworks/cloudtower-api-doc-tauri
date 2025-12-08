import { OpenAPIV3 } from "openapi-types";

// Mock version of swagger.ts for testing
export type ISpec = OpenAPIV3.Document;

// Export SupportLanguage enum for i18n.ts
export enum SupportLanguage {
  zh = "zh",
  en = "en",
}

