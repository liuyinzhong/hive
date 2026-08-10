# 仓库 UI 行为

业务规则以 [后端仓库文档](../../../hive-admin-go/business-docs/erp/warehouse.md) 为准。

## 页面入口

- 仓库列表：`apps/web-antdv-next/src/views/erp/warehouse/list.vue`。
- 仓库编辑：同页弹窗。
- 库区维护：从仓库行操作进入抽屉。
- 货位维护：从库区行操作继续进入抽屉。

## 当前交互

- 列表提供新建、编辑、库区维护和删除；状态通过表格 `CellSwitch` 切换。
- 状态开关要求 `erp:warehouse:status`，无权限时按公共组件行为只读展示。
- 库区入口显示后端返回的库区数量，货位入口显示后端返回的货位数量。
- 新增和编辑保存成功后关闭弹窗并刷新列表。
- 删除前展示确认提示，提交当前行 `rowVersion` 进行并发校验。
- 仓库、库区和货位编码均只读展示，不出现在创建表单中。

## 页面权限

- 仓库按钮按 `erp:warehouse:*` 控制。
- 库区按钮按 `erp:warehouseZone:*` 控制。
- 货位按钮按 `erp:warehouseLocation:*` 控制。
- 前端权限只控制入口显示，后端路由仍执行最终权限校验。
