export const tagsGroup: { name: string; tags: string[] }[] = [
  {
    name: "ClusterManagement",
    tags: [
      "Cluster",
      "ClusterSettings",
      "SnmpTransport",
      "SnmpTrapReceiver",
      "MigrateTransmitter",
    ],
  },
  {
    name: "MetroXClusterManagement",
    tags: ["Witness", "WitnessService", "Zone", "ZoneTopo"],
  },
  {
    name: "VmwareManagement",
    tags: ["VcenterAccount", "VsphereEsxiAccount"],
  },
  {
    name: "AlertManagement",
    tags: ["AlertNotifier", "Alert", "GlobalAlertRule", "AlertRule"],
  },
  {
    name: "VmManagement",
    tags: [
      "ElfImage",
      "VmDisk",
      "VmFolder",
      "VmNic",
      "VmPlacementGroup",
      "Vm",
      "VmSnapshot",
      "VmTemplate",
      "VmVolume",
      "VmVolumeSnapshot",
      "Ovf",
      "VmExportFile",
    ],
  },
  {
    name: "CloudTowerSetting",
    tags: [
      "Application",
      "Ntp",
      "ClusterImage",
      "ClusterUpgradeHistory",
      "Deploy",
      "GlobalSettings",
      "License",
      "SvtImage",
    ],
  },
  {
    name: "HardwareManagement",
    tags: [
      "BrickTopo",
      "RackTopo",
      "ClusterTopo",
      "DiscoveredHost",
      "Disk",
      "Host",
      "Ipmi",
      "NodeTopo",
      "PmemDimm",
      "UsbDevice",
      "GpuDevice",
    ],
  },
  {
    name: "StorageManagement",
    tags: [
      "ConsistencyGroup",
      "ConsistencyGroupSnapshot",
      "ElfDataStore",
      "ElfStoragePolicy",
      "IscsiConnection",
      "Iscsi",
      "IscsiLun",
      "IscsiLunSnapshot",
      "IscsiTarget",
      "NamespaceGroup",
      "NfsExport",
      "NfsInode",
      "NvmfNamespace",
      "NvmfNamespaceSnapshot",
      "NvmfSubsystem",
      "StoragePolicyConector",
    ],
  },
  {
    name: "SharedManagement",
    tags: ["ContentLibraryImage", "ContentLibraryVmTemplate"],
  },
  {
    name: "DatacneterAndOrgManagement",
    tags: ["Datacenter", "Organization"],
  },
  {
    name: "EntityFileterManagement",
    tags: ["EntityFilter", "VmEntityFilterResult"],
  },
  {
    name: "ErManagement",
    tags: ["EverouteCluster", "EverouteLicense", "EveroutePackage", "V2EverouteLicense"],
  },
  {
    name: "MonitorManagement",
    tags: ["Graph", "View", "Metrics"],
  },
  {
    name: "LabelManagement",
    tags: ["Label"],
  },
  {
    name: "LogManagement",
    tags: ["LogCollection", "LogServiceConfig"],
  },
  {
    name: "NetworkManagement",
    tags: ["Nic", "Vds", "Vlan"],
  },
  {
    name: "ReportManagement",
    tags: ["ReportTask", "ReportTemplate", "TableReporter"],
  },
  {
    name: "SnapshotManagement",
    tags: ["SnapshotGroup", "SnapshotPlan", "SnapshotPlanTask"],
  },
  {
    name: "AuditManagement",
    tags: ["SystemAuditLog", "UserAuditLog"],
  },
  {
    name: "TaskManagement",
    tags: ["Task", "UploadTask"],
  },
  {
    name: "UserManagement",
    tags: ["UserRoleNext", "User"],
  },
  {
    name: "BackupManagement",
    tags: [
      "BackupLicense",
      "BackupPackage",
      "BackupPlanExecution",
      "BackupPlan",
      "BackupRestoreExecution",
      "BackupRestorePoint",
      "BackupService",
      "BackupStoreRepository",
      "BackupTargetExecution",
    ],
  },
  {
    name: "CloudTowerApplicationManagement",
    tags: ["CloudTowerApplication", "CloudTowerApplicationPackage"],
  },
  {
    name: "DistributedFirewall",
    tags: ["IsolationPolicy", "SecurityPolicy", "SecurityGroup"],
  },
  {
    name: "VirtualPrivateCloudNetwork",
    tags: [
      "VirtualPrivateCloud",
      "VirtualPrivateCloudSubnet",
      "VirtualPrivateCloudRouteTable",
      "VirtualPrivateCloudSecurityGroup",
      "VirtualPrivateCloudSecurityPolicy",
      "VirtualPrivateCloudIsolationPolicy",
      "VirtualPrivateCloudNatGateway",
      "VirtualPrivateCloudRouterGateway",
      "VirtualPrivateCloudFloatingIp",
      "VirtualPrivateCloudClusterBinding",
      "VirtualPrivateCloudExternalSubnet",
    ],
  },
  {
    name: "Other",
    tags: ["ApiInfo"],
  },
  {
    name: "Observability",
    tags: ["Observability"]
  }
];



export const APIInfo = {
  title: "CloudTower APIs",
  version: "",
  description: "cloudtower operation API and SDK"
}
