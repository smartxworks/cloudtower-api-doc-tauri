import { vi } from 'vitest';


// Mock swagger.ts to avoid React/Docusaurus dependencies
vi.mock('./cloudtower-api-doc/swagger/utils/swagger.ts', () => {
  const { OpenAPIV3 } = require('openapi-types');
  return {
    ISpec: OpenAPIV3.Document,
    SupportLanguage: {
      zh: 'zh',
      en: 'en',
    },
  };
});

