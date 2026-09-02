import { OpenAPIV3 } from "openapi-types";
import { useMemo } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export type SpecMap = Record<string, string>;

// Swagger files are static assets so only the selected version is fetched.
const defaultSpecMap = {
  "4.9.0": "specs/4.9.0-swagger.json",
  "4.8.1": "specs/4.8.1-swagger.json",
  "4.8.0": "specs/4.8.0-swagger.json",
  "4.7.2": "specs/4.7.2-swagger.json",
  "4.7.1": "specs/4.7.0-swagger.json",
  "4.7.0": "specs/4.7.0-swagger.json",
  "4.6.2": "specs/4.6.0-swagger.json",
  "4.6.1": "specs/4.6.0-swagger.json",
  "4.6.0": "specs/4.6.0-swagger.json",
  "4.5.0": "specs/4.5.0-swagger.json",
  "4.4.2": "specs/4.4.1-swagger.json",
  "4.4.1": "specs/4.4.1-swagger.json",
  "4.4.0": "specs/4.4.0-swagger.json",
  "4.3.0": "specs/4.3.0-swagger.json",
  "4.2.0": "specs/4.2.0-swagger.json",
  "4.1.0": "specs/4.1.0-swagger.json",
  "4.0.0": "specs/4.0.0-swagger.json",
  "3.4.4": "specs/3.4.4-swagger.json",
  "2.8.0": "specs/2.8.0-swagger.json",
} satisfies SpecMap;

/**
 * Hook to get specMap, prioritizing customFields.specMap from docusaurus config,
 * falling back to default specMap if not configured.
 * 
 * customFields.specMap 中的值可以是：
 * - 字符串路径：静态 Swagger 文件的相对 URL
 */
export function useSpecMap(): SpecMap {
  const { siteConfig: { customFields } } = useDocusaurusContext();
  return useMemo(() => {
    // 优先使用 customFields 中的 specMap 配置
    if (customFields?.specMap && typeof customFields.specMap === 'object') {
      return customFields.specMap as SpecMap;
    }
    // 如果没有配置，使用默认的 specMap
    return defaultSpecMap;
  }, [customFields]);
}

export enum SupportLanguage {
  zh = "zh",
  en = "en",
}

export const LngMap = {
  [SupportLanguage.zh]: "zh-CN",
  [SupportLanguage.en]: "en-US",
}

export type ISpec = OpenAPIV3.Document;
