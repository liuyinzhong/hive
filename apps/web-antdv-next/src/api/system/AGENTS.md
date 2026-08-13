# 系统 API 上下文

修改本目录任一 API 前，先阅读前端 business-docs/system/README.md，再阅读后端 business-docs/system/CONTEXT.md、README.md 和当前模块规则，之后阅读对应 UI 文档，最后核对 Router、DTO、Service 和 API 类型。

- user、role、dept、menu：access-control 文档。
- dict、param：dictionary-parameter 文档。
- file：file-management 文档。
- log、external-page：audit-log、external-page 文档。
- payChannel：payment-channel 文档，敏感配置不得输出。
- message、download：message-push、download-center 文档。

请求地址、方法、字段、枚举、分页和权限必须与后端一致。SSE 事件不是权威状态，按钮隐藏也不能代替后端授权。

