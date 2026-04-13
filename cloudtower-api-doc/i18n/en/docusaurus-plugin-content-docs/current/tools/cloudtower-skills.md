---
title: CloudTower Skills
sidebar_class_name: sidebar-new-item
---

import Terminology from '@site/terminology.json'
import CodeTerminology from '@site/code-terminology.json'
import CodeBlock from '@theme/CodeBlock'

## Introduction

<>{Terminology['terminology']['en-US']['PRODUCT']} Skills provides a set of {Terminology['terminology']['en-US']['PRODUCT']}-related skills. See the individual Skill descriptions below for details.</>

## Available Skills

<h3> {CodeTerminology["skills_api_name"]} </h3>

- <a href={`https://github.com/${CodeTerminology["skills_github_address"]}/tree/master/skills/${CodeTerminology["skills_api_name"]}`}>GitHub Repository</a>

<>Provides complete {Terminology['terminology']['en-US']['PRODUCT']} API operation documentation, covering a wide range of resource types, operations, and schema definitions. Once installed, your AI assistant can:</>

<>- Understand {Terminology['terminology']['en-US']['PRODUCT']} API authentication methods, request formats, and async task mechanisms</>
- Find the appropriate API endpoints based on your requirements and generate calling code
- Interpret API response data structures

### metrics-lookup

- <a href={`https://github.com/${CodeTerminology["skills_github_address"]}/tree/master/skills/metrics-lookup`}>GitHub Repository</a>

<>Provides monitoring metrics lookup for {Terminology['terminology']['en-US']['STORAGE_PRODUCT']}/{Terminology['terminology']['en-US']['VM_PRODUCT']}/{Terminology['terminology']['en-US']['FILE_SERVER']}/{Terminology['terminology']['en-US']['K8S_SERVER']}/{Terminology['terminology']['en-US']['PRODUCT']}/{Terminology['terminology']['en-US']['NET_SECURITY']}/Backup/Replication products, covering thousands of metrics. Once installed, your AI assistant can:</>

- Look up the meaning and applicable versions of a metric by its name
- Reverse-search related metrics by keywords (e.g., "read latency", "IOPS", "GC")
- Interpret metrics in alert rules or Grafana/Prometheus dashboards

## Installation

Skills are installed via the [vercel-labs/skills](https://github.com/vercel-labs/skills) tool.

### List Available Skills

<CodeBlock language="bash">
{`npx skills add ${CodeTerminology["skills_github_address"]} --list`}
</CodeBlock>

### Install All Skills

<CodeBlock language="bash">
{`npx skills add ${CodeTerminology["skills_github_address"]} -a `}{'<agent>'}
</CodeBlock>

Where `<agent>` is your AI assistant type, e.g., `claude`, `cursor`, etc.

### Install a Specific Skill

<CodeBlock language="bash">
{`npx skills add ${CodeTerminology["skills_github_address"]} --skill metrics-lookup -a `}{'<agent>'}
</CodeBlock>
