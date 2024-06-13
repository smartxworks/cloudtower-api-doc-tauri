---
title: 如何阅读 CloudTower API 参考
sidebar_position: 13
---

CloudTower API 基于 OpenApi v3.0.0 规范进行开发，可以使用 cURL 或任何 HTTP 客户端进行调用。

目前每个接口文档的组成包括了：
* Request: 请求数据
  * header parameters: 请求 header 中需要提供的参数
  * request body schema： 请求 body 中的字段说明
* Responese: 返回数据。
  * 200: 请求成功后返回的数据字段解释。
  * 400: 请求数据有误时的返回数据字段解释。
  * 404: 寻找不到对应的操作资源时的返回。
  * 500: 服务内部出错

注意：每个字段解释的面板默认都为收缩状态，点击 `>` 可展开详情

文档右侧的面板中包含了：
* Try it： 调用面板。点击 `Try it` 按钮，展开调试面板，用户可自行在面板中输入参数，进行页面调用
* Request samples: 调用示例面板，提供了 API 接口调用的 json 示例和 curl 示例代码。
* Response samples: 返回示例面板，提供了 API 接口返回的示例