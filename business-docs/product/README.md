# 产品档案前端业务手册

本目录只记录产品档案页面入口、按钮权限、表单联动和交互约束。产品层级、唯一性、启停、生效期和并发规则的唯一正文位于后端仓库 `hive-admin-go/business-docs/product`。

## 阅读顺序

1. 阅读后端 [产品领域词汇](../../../hive-admin-go/business-docs/product/CONTEXT.md)。
2. 阅读后端 [产品档案业务手册](../../../hive-admin-go/business-docs/product/README.md)。
3. 阅读 [产品档案 UI](./product-archive-ui.md)。
4. 核对 `src/api/product`、`src/views/product/spu` 和后端对应接口。

## 维护边界

- 后端文档说明操作是否允许以及执行结果。
- 本目录说明入口、按钮展示、抽屉或弹窗以及表单联动。
- 前端隐藏按钮不能代替后端权限、并发版本或业务规则校验。
- 产品规则或 UI 行为变化时，在同一次修改中同步对应文档。

## 源码入口

- API：`apps/web-antdv-next/src/api/product`。
- 页面：`apps/web-antdv-next/src/views/product/spu`。
- 国际化：`apps/web-antdv-next/src/locales/langs/zh-CN/product.json` 和 `en-US/product.json`。

