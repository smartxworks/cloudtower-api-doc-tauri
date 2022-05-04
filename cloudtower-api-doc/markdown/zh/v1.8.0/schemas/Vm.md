| parameter | Type | Description |
| ----------- | ----------- |----------- |
| clock_offset  |  object  |  虚拟机时钟  |
| cluster  |  object  |  所属集群  |
| cpu  |  object  |   CPU |
| cpu_model  |  string  | CPU 兼容性   |
| cpu_usage  |  number  |  CPU 使用率  |
| deleted_at  |  string  |  加入回收站的时间  |
| description  |  string  |  描述 |
| dns_servers  |  string  | DNS 服务器   |
| entity_filter_results  |  object  |  资源优化结果  |
| entity_filter_results  |  array  | 资源优化结果   |
| entityAsyncStatus  |  object  | 内部字段   |
| firmware  |  object  |  固件  |
| folder  |  object  |  所属组 |
| guest_cpu_model  |  string  |  客户端 CPU 兼容性  |
| guest_os_type  |  object  | 客户端操作系统类型    |
| guest_size_usage  |  number  |  内部使用率  |
| guest_used_size  |  number  | 内部使用量   |
| ha  |  boolean  | 高可用   |
| hostname  |  string  |  主机名  |
| id  |  string  | 唯一标识   |
| in_recycle_bin  |  boolean  |  是否在回收站中  |
| internal  |  boolean  | 内部字段   |
| io_policy  |  object  | 限制模式   |
| ips  |  string  | IP 地址   |
| isolation_policy  |  object  |  隔离策略  |
| kernel_info  |  string  | kernal 信息  |
| labels  |  object  |  关联标签  |
| labels  |  array  |  关联标签  |
| last_shutdown_time  |  string  | 最后一次关机时间   |
| local_created_at  |  string  |  创建时间  |
| local_id  |  string  |  UUID  |
| logical_size_bytes  |  number  | 独占容量   |
| max_bandwidth  |  number  | 带宽限制   |
| max_bandwidth_policy  |  object  |  带宽限制策略  |
| max_iops  |  integer  | IOPS 限制   |
| max_iops_policy  |  object  |  IOPS 限制策略  |
| memory  |  number  |  内存  |
| memory_usage  |  number  | 内存使用率   |
| name  |  string  |   虚拟机名  |
| nested_virtualization  |  boolean  | 嵌套虚拟化   |
| node_ip  |  string  | 节点 IP   |
| original_name  |  string  | 原始名称   |
| os  |  string  |  操作系统  |
| out_uninstall_usb  |  string  |  已拔除且为安装的 USB 设备  |
| out_uninstall_usb  |  array  |  已拔除且为安装的 USB 设备   |
| protected  |  boolean  |  是否加入快照计划  |
| provisioned_size  |  number  |  分配容量  |
| size  |  number  | 可释放空间  |
| snapshot_plan  |  object  |  所属快照计划  |
| snapshots  |  object  |   虚拟机快照 |
| snapshots  |  array  | 虚拟机快照   |
| status  |  object  | 电池状态   |
| unique_size  |  number  |  独占容量  |
| usb_devices  |  object  | 关联 USB 设备  |
| usb_devices  |  array  |  关联 USB 设备  |
| vcpu  |  integer  |  vCPU  |
| video_type  |  object  |   显卡 |
| vm_disks  |  object  |  虚拟盘  |
| vm_disks  |  array  | 虚拟盘   |
| vm_nics  |  object  |  虚拟网卡  |
| vm_nics  |  array  |  虚拟网卡  |
| vm_placement_group  |  object  | 虚拟机放置组   |
| vm_placement_group  |  array  |  虚拟机放置组  |
| vm_tools_status  |  object  | 虚拟机工具状态   |
| vm_tools_version  |  string  |  虚拟机工具版本  |
| vm_usage  |  object  |  系统服务  |
| win_opt  |  boolean  | Windows 优化选项   |