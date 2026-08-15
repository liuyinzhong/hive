# 系统管理前端手册

本目录记录系统管理页面交互。授权、状态、持久化、文件、审计和清理规则的正文位于后端 [系统管理业务手册](../../../hive-admin-go/business-docs/system/README.md)。

## 阅读顺序

1. 阅读后端 [系统领域词汇](../../../hive-admin-go/business-docs/system/CONTEXT.md)。
2. 阅读后端当前模块规则和下表 UI 文档。
3. 核对 src/api/auth、src/api/system、src/views/_core、src/views/system、相关 Store 和布局。

## 模块

| 前端模块 | UI 文档 | 后端规则 |
|---|---|---|
| 登录、资料、用户、角色、部门和菜单 | [access-control-ui.md](./access-control-ui.md) | [access-control.md](../../../hive-admin-go/business-docs/system/access-control.md) |
| 角色数据范围和受限结果交互 | [data-permission-ui.md](./data-permission-ui.md) | [data-permission.md](../../../hive-admin-go/business-docs/system/data-permission.md) |
| 字典和参数 | [dictionary-parameter-ui.md](./dictionary-parameter-ui.md) | [dictionary-parameter.md](../../../hive-admin-go/business-docs/system/dictionary-parameter.md) |
| 上传文件和文件列表 | [file-management-ui.md](./file-management-ui.md) | [file-management.md](../../../hive-admin-go/business-docs/system/file-management.md) |
| 操作日志、登录日志和外部页面 | [audit-external-page-ui.md](./audit-external-page-ui.md) | [审计](../../../hive-admin-go/business-docs/system/audit-log.md)、[外部页面](../../../hive-admin-go/business-docs/system/external-page.md) |
| 支付渠道 | [payment-channel-ui.md](./payment-channel-ui.md) | [payment-channel.md](../../../hive-admin-go/business-docs/system/payment-channel.md) |
| 菜单消息推送 | [message-push-ui.md](./message-push-ui.md) | [message-push.md](../../../hive-admin-go/business-docs/system/message-push.md) |
| 下载中心 | [download-center-ui.md](./download-center-ui.md) | [download-center.md](../../../hive-admin-go/business-docs/system/download-center.md) |

## 维护边界

- 动态菜单和按钮只控制前端入口，后端认证、原子权限和业务归属仍是最终边界。
- 数据范围由后端按当前用户解析；前端筛选、缓存、隐藏按钮或提交部门 ID 都不能扩大结果。
- SSE 事件只提示刷新，不能代替持久化查询。
- 系统模块中的敏感配置不得写入前端日志、错误提示或文档示例。
