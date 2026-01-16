import { OpenAPIV3 } from "openapi-types";
import { useMemo } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useIsBrowser from "@docusaurus/useIsBrowser"

// 默认的 specMap 配置
const defaultSpecMap = {
  "4.8.0": import("../../static/specs/4.8.0-swagger.json"),
  "4.7.0": import("../../static/specs/4.7.0-swagger.json"),
  "4.6.2": import("../../static/specs/4.6.0-swagger.json"),
  "4.6.1": import("../../static/specs/4.6.0-swagger.json"),
  "4.6.0": import("../../static/specs/4.6.0-swagger.json"),
  "4.5.0": import("../../static/specs/4.5.0-swagger.json"),
  "4.4.2": import("../../static/specs/4.4.1-swagger.json"),
  "4.4.1": import("../../static/specs/4.4.1-swagger.json"),
  "4.4.0": import("../../static/specs/4.4.0-swagger.json"),
  "4.3.0": import("../../static/specs/4.3.0-swagger.json"),
  "4.2.0": import("../../static/specs/4.2.0-swagger.json"),
  "4.1.0": import("../../static/specs/4.1.0-swagger.json"),
  "4.0.0": import("../../static/specs/4.0.0-swagger.json"),
  "3.4.4": import("../../static/specs/3.4.4-swagger.json"),
  "2.8.0": import("../../static/specs/2.8.0-swagger.json"),
};

/**
 * Hook to get specMap, prioritizing customFields.specMap from docusaurus config,
 * falling back to default specMap if not configured.
 * 
 * customFields.specMap 中的值可以是：
 * - 字符串路径：会自动转换为动态 import
 * - Promise（import() 调用）：直接使用
 */
export function useSpecMap() {
  const { siteConfig: { customFields } } = useDocusaurusContext();
  const isBrowser = useIsBrowser();
  return useMemo(() => {
    if (!isBrowser) {
      return defaultSpecMap;
    }
    // 优先使用 customFields 中的 specMap 配置
    if (customFields?.specMap && typeof customFields.specMap === 'object') {
      const customSpecMap = customFields.specMap as Record<string, string | Promise<any>>;
      // 将字符串路径转换为动态 import，如果已经是 Promise 则直接使用
      const processedSpecMap: Record<string, Promise<any>> = {};
      for (const [key, value] of Object.entries(customSpecMap)) {
        if (typeof value === 'string') {
          // 如果是字符串路径，转换为动态 import
          processedSpecMap[key] = import(`../../static/${value}`);
        } else {
          // 如果已经是 Promise，直接使用
          processedSpecMap[key] = value;
        }
      }
      return processedSpecMap;
    }
    // 如果没有配置，使用默认的 specMap
    return defaultSpecMap;
  }, [customFields, isBrowser]);
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
