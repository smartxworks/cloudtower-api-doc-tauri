import { SupportLanguage } from "../utils";
import { OpenAPIV3 } from 'openapi-types';

export type GetExamplesFunc = (lng: SupportLanguage) => Record<string,  OpenAPIV3.ExampleObject> 