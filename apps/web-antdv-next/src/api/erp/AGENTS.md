# ERP API 局部规则

修改本目录任一 API 前，必须先阅读仓库根 `business-docs/erp/README.md`、后端 `business-docs/erp` 下对应业务规则，以及后端 Router、Controller 和 Model/DTO。

- 请求地址、方法、参数、响应类型、枚举和权限必须与后端一致。
- API 契约变化时同步检查对应 UI 文档与后端 Swagger。
- 发现业务文档、Swagger 和当前代码不一致时，先列出差异，不自行猜测。
