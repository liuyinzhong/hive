# Hive 前端业务文档总索引

本目录是 Hive 业务前端的 UI 知识库，供业务人员、开发、测试和 AI 使用。进入已有模块时，应先读后端业务规则和本目录 UI 说明理解业务，再阅读页面和 API 核实现状；不要从逐文件钻研代码开始反推规则。

前端 docs 目录属于 Vben 上游框架和通用技术文档，Hive 业务文档只能放在 business-docs，不能混入 docs。

## 固定阅读顺序

1. 在本页按页面或 API 入口找到业务领域。
2. 阅读后端 hive-admin-go/CONTEXT-MAP.md、领域 CONTEXT.md、README.md 和当前模块规则。
3. 阅读本仓库对应 README.md 和 UI 文档。
4. 最后阅读前端 API、页面、Store、国际化和后端实现，核对文档与代码是否一致。

## 业务域总览

| 业务域 | 前端能力 | UI 入口 |
|---|---|---|
| 基础资料 | 本机构、企业主体、分类体系 | [base](./base/README.md) |
| 产品档案 | SPU、RP、MP、SKU 和价格 | [product](./product/README.md) |
| 医疗 | 科室、医生、患者、诊断、挂号费、排班、挂号候诊、接诊和处方审核 | [medical](./medical/README.md) |
| ERP | 仓库、采购、入库、库存、追溯码和其它出库 | [erp](./erp/README.md) |
| 打印 | 模板管理、设计器、预览和正式打印 | [print](./print/README.md) |
| 开发管理 | 项目、版本、需求、任务、缺陷、统计和仪表盘 | [dev](./dev/README.md) |
| 表单 | Schema 列表、设计器和预览 | [form](./form/README.md) |
| 工作流 | 定义设计、发起、实例、待办和抄送 | [workflow](./workflow/README.md) |
| 系统管理 | 登录资料、权限、字典参数、文件日志、外部页面、支付渠道、消息和下载 | [system](./system/README.md) |

## 前端源码覆盖表

| 源码范围 | 文档归属 |
|---|---|
| src/views/base、src/api/base | [基础资料](./base/README.md) |
| src/views/product、src/api/product | [产品档案](./product/README.md) |
| src/views/medical、src/api/medical | [医疗](./medical/README.md) |
| src/views/erp、src/api/erp | [ERP](./erp/README.md) |
| src/views/print、src/api/print | [打印](./print/README.md) |
| src/views/dev、src/api/dev、src/api/statistics/dev.ts | [开发管理](./dev/README.md) |
| src/views/dashboard | [开发统计 UI](./dev/statistics-ui.md)；analytics 部分接入开发统计，workspace 和部分图表仍是演示数据 |
| src/views/form、src/api/form | [表单](./form/README.md) |
| src/views/workflow、src/api/workflow | [工作流](./workflow/README.md) |
| src/views/system、src/api/system、src/api/auth | [系统管理](./system/README.md) |
| src/views/_core/authentication、src/views/_core/profile | [登录与访问控制 UI](./system/access-control-ui.md) |
| src/views/external | [外部页面 UI](./system/audit-external-page-ui.md) |
| src/store/menu-message.ts、src/layouts/basic.vue 的消息接入 | [菜单消息 UI](./system/message-push-ui.md) |

## 不属于 Hive 业务文档的源码

- src/views/_core/about、fallback 和框架初始化页面属于 Vben 基础能力。
- src/views/demo、src/api/examples 和示例型页面属于框架演示，不据此定义业务规则。
- src/views/flow、src/api/flow 与 src/views/medical/product/classification 当前只有空目录占位，没有可运行模块；新增实现前先确定领域并建立文档。
- 前端 docs 是上游框架文档，不放置业务说明。

## 覆盖维护

新增页面、API、业务 Store、菜单或状态时，必须在同一次修改中登记本页或领域 README，补充后端业务正文和前端 UI 文档，并更新就近 AGENTS.md。文档与代码不一致时先列出差异、当前行为和影响，不得静默选择。
