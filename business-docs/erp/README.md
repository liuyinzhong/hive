# ERP 前端业务手册

本目录只记录 ERP 的页面入口、按钮展示、表单联动和交互约束。ERP 术语、状态和库存规则的唯一正文位于后端仓库 `hive-admin-go/business-docs/erp`，前端文档不复制这些规则。

## 阅读顺序

1. 阅读后端 [ERP 领域词汇](../../../hive-admin-go/business-docs/erp/CONTEXT.md)。
2. 阅读后端 [ERP 业务手册](../../../hive-admin-go/business-docs/erp/README.md) 和对应模块规则。
3. 阅读本目录对应的 UI 文档。
4. 核对 `src/api/erp` 的接口类型和 `src/views/erp` 的当前实现。

## 模块

| 前端模块 | UI 文档 | 后端业务规则 |
|---|---|---|
| 仓库 | [warehouse-ui.md](./warehouse-ui.md) | [warehouse.md](../../../hive-admin-go/business-docs/erp/warehouse.md) |
| 采购单 | [purchase-order-ui.md](./purchase-order-ui.md) | [purchase-order.md](../../../hive-admin-go/business-docs/erp/purchase-order.md) |
| 采购入库 | [purchase-inbound-ui.md](./purchase-inbound-ui.md) | [purchase-inbound.md](../../../hive-admin-go/business-docs/erp/purchase-inbound.md) |
| 库存与追溯码 | [inventory-ui.md](./inventory-ui.md) | [inventory.md](../../../hive-admin-go/business-docs/erp/inventory.md) |
| 其它出库 | [other-outbound-ui.md](./other-outbound-ui.md) | [other-outbound.md](../../../hive-admin-go/business-docs/erp/other-outbound.md) |

## 维护边界

- 后端业务手册说明“操作是否允许、执行后发生什么”。
- 前端 UI 文档说明“入口在哪里、按钮何时展示、表单如何联动”。
- Swagger 和 `src/api/erp` 说明请求与响应契约。
- 前端按钮隐藏不能代替后端权限与业务状态校验。
- 业务规则改变时先更新后端正文，再同步受影响的 UI 文档；不要在前端文档重新定义另一套状态规则。

## 源码入口

- API：`apps/web-antdv-next/src/api/erp`。
- 页面：`apps/web-antdv-next/src/views/erp`。
- 国际化：`apps/web-antdv-next/src/locales/langs/zh-CN/erp.json` 和 `en-US/erp.json`。
