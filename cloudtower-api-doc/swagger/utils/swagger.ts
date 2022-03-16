import { List, Map as IMap } from "immutable";
import { OpenAPIV3 } from 'openapi-types';
import i18next from '../i18n';
import swaggerSpec1_8 from "../specs/v1.8.0-swagger.json";
import swaggerSpec1_9 from '../specs/v1.9.0-swagger.json';


export const specMap = {
  'v1.8.0': swaggerSpec1_8,
  'v1.9.0': swaggerSpec1_9
}

export enum SupportLanguage {
  zh = "zh",
  en = "en",
}


export type Property = Record<
string,
{
  allOf?: [{ $ref?: string }];
  $ref?: string;
  items?: { $ref?: string };
  type?: 'object' | 'string' | 'aray';
  properties?: Property
}
>
export interface Schema {
  type?: "object" | "string" | 'array';
  enum?: string[];
  allOf?:[{ $ref?: string,properties?:Property }];
  items?: { properties?: Property };
  properties?: Record<
    string,
    {
      allOf?:[{ $ref?: string,properties?:Property }];
      $ref?: string;
      items?: { $ref?: string };
      type?: 'object' | 'string' | 'array';
      properties?: Property
    }
  >;
}
export type ISpec = OpenAPIV3.Document

type SwaggerComponent = React.FC<{
  className?: string;
  mobile?: number;
  desktop?: number;
  isSwagger2?: boolean;
  isOAS3?: boolean;
  alsoShow?: React.ReactElement;
  i18next?: typeof i18next;
}>;
export interface CommonSwaggerProps {
  oas3Selectors: {
    selectedServer: () => string;
  };
  oas3Actions: {
    setSelectedServer: (value: string) => void;
  };
  getComponent: (component: string, flag?: boolean) => SwaggerComponent;
  getConfigs: () => object;
  errSelectors: {
    lastError: () => Map<string, string>;
  };
  specSelectors: {
    url: () => string;
    loadingStatus: () => string;
    isSwagger2: () => boolean;
    isOAS3: () => boolean;
    servers: () => List<IMap<string, string>>;
    schemes: () => IMap<string, object>;
    securityDefinitions: () => string;
    specStr: () => string;
    specJson: () => IMap<string, Object>;
    paths: () => List<IMap<string, string>>;
    taggedOperations: () => IMap<string, object>;
  };
  configsActions: {
    update: (configName: string, configValue: string | boolean) => void;
    toggle: (configName: string) => void;
    loaded: () => void;
  };
  layoutActions: {
    updateFilter: (filter: boolean | null) => void;
  };
  layoutSelectors:{
    isShown: () => boolean;
    current: () => unknown;
  };
  specActions: {
    updateSpec: (spec: string) => void;
    updateLoadingStatus: (
      status: "loading" | "success" | "failed" | "failedConfig"
    ) => void;
  };
  authSelectors: {
    authorized: () => IMap<string, string>,
    shownDefinitions: () => boolean,
  }
}

export type TopBarSelection =
  | "all"
  | "userManagement"
  | "info"
  | "operators"
  | "clusters"
  | "audit"
  | "storage"
  | "resources"
  | "monitoring"
  | "timeMachine"
  | "vm"
  | "tasks"
  | "applicationManagement";

export const SwaggerTopBar: Record<TopBarSelection, string[]> = {
  info: [],
  all: ["*"],
  userManagement: ["User", "UserRoleNext"],
  monitoring: [
    "Graph",
    "View",
    "Alert",
    "AlertRule",
    "GlobalAlertRule",
    "SnmpTransport",
    "SnmpTrapReceiver",
  ],
  applicationManagement: ["Application"],
  clusters: ["Cluster", "ClusterSettings"],
  audit: ["UserAuditLog", "SystemAuditLog"],
  resources: ["EntityFilter"],
  vm: [
    "Vm",
    "VmDisk",
    "VmNic",
    "IsolationPolicy",
    "VmSnapshot",
    "VmTemplate",
    "VmFolder",
    "VmVolume",
    "ElfImage",
    "UploadTask",
    "Vds",
    "Vlan",
    "VmPlacementGroup",
  ],
  tasks: ["Task"],
  operators: [
    "BrickTopo",
    "NodeTopo",
    "RackTopo",
    "Disk",
    "Host",
    "Nic",
    "UsbDevice",
    "Datacenter",
    "Organization",
    "Label",
    "License",
    "ClusterSettings",
    "GlobalSettings",
    "ClusterImage",
    "ClusterUpgradeHistory",
    "VcenterAccount",
    "VsphereEsxiAccount",
  ],
  timeMachine: ["SnapshotPlan", "SnapshotPlanTask", "SnapshotGroup"],
  storage: [
    "IscsiLun",
    "IscsiLunSnapshot",
    "IscsiTarget",
    "NfsExport",
    "NvmfNamespace",
    "NvmfNamespaceSnapshot",
    "NvmfSubsystem",
    "NamespaceGroup",
  ],
};
