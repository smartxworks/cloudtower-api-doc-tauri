---
title: CloudTower Skills
sidebar_class_name: sidebar-new-item
---

import Terminology from '@site/terminology.json'
import CodeTerminology from '@site/code-terminology.json'
import CodeBlock from '@theme/CodeBlock'

## 简介

<>{Terminology['terminology']['zh-CN']['PRODUCT']} Skills 提供了一系列与 {Terminology['terminology']['zh-CN']['PRODUCT']} 相关的技能，具体说明见下方各 Skill 介绍。</>

## 可用 Skills

<h3> {CodeTerminology["skills_api_name"]} </h3>

- <a href={`https://github.com/${CodeTerminology["skills_github_address"]}/tree/master/skills/${CodeTerminology["skills_api_name"]}`}>GitHub 仓库</a>

<>提供完整的 {Terminology['terminology']['zh-CN']['PRODUCT']} API 操作文档，涵盖丰富的资源类型、操作接口和 Schema 定义。安装后，AI 助手能够：</>

<>- 理解 {Terminology['terminology']['zh-CN']['PRODUCT']} API 的认证方式、请求格式和异步任务机制</>
- 根据需求查找合适的 API 接口并生成调用代码
- 解读 API 返回的数据结构

### metrics-lookup

- <a href={`https://github.com/${CodeTerminology["skills_github_address"]}/tree/master/skills/metrics-lookup`}>GitHub 仓库</a>

<>提供 {Terminology['terminology']['zh-CN']['STORAGE_PRODUCT']}/{Terminology['terminology']['zh-CN']['VM_PRODUCT']}/{Terminology['terminology']['zh-CN']['FILE_SERVER']}/{Terminology['terminology']['zh-CN']['K8S_SERVER']}/{Terminology['terminology']['zh-CN']['PRODUCT']}/{Terminology['terminology']['zh-CN']['NET_SECURITY']}/备份/复制等产品的监控指标查询能力，覆盖上千个指标。安装后，AI 助手能够：</>

- 根据指标名称查询其含义和适用版本
- 根据关键词（如"读延迟"、"IOPS"、"GC"）反查相关指标
- 解读告警规则或 Grafana/Prometheus 面板中的指标

## 安装方式

Skills 通过 [vercel-labs/skills](https://github.com/vercel-labs/skills) 工具进行安装。

### 查看可用 Skills

<CodeBlock language="bash">
{`npx skills add ${CodeTerminology["skills_github_address"]} --list`}
</CodeBlock>

### 安装所有 Skills

<CodeBlock language="bash">
{`npx skills add ${CodeTerminology["skills_github_address"]} -a `}{'<agent>'}
</CodeBlock>

其中 `<agent>` 为你使用的 AI 助手类型，例如 `claude`、`cursor` 等。

### 安装特定 Skill

<CodeBlock language="bash">
{`npx skills add ${CodeTerminology["skills_github_address"]} --skill metrics-lookup -a `}{'<agent>'}
</CodeBlock>
