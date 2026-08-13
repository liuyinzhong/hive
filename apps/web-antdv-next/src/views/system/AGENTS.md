# 系统管理页面上下文

修改本目录前，先阅读前端 business-docs/system/README.md，再阅读后端 business-docs/system/CONTEXT.md、README.md 和当前模块规则，最后阅读对应 UI 文档与代码。

- user、role、dept、menu 对应 access-control-ui.md。
- dict、param 对应 dictionary-parameter-ui.md。
- file 对应 file-management-ui.md。
- log、menu/externalMenu 对应 audit-external-page-ui.md。
- payChannel 对应 payment-channel-ui.md。
- message、downloadCenter 继续遵循子目录规则。

敏感配置不得输出到控制台或普通日志。动态菜单、按钮权限、状态和后台业务校验必须分别核对。
