# 系统消息与下载中心前端手册

本目录只记录菜单消息推送和下载中心的前端入口、状态同步、按钮条件及交互约束。消息持久化、SSE、下载任务状态、文件保留和清理规则的正文位于后端仓库 `hive-admin-go/business-docs/system`。

## 阅读顺序

1. 阅读后端 [系统消息与下载领域词汇](../../../hive-admin-go/business-docs/system/CONTEXT.md)。
2. 阅读后端 [系统消息与下载中心业务手册](../../../hive-admin-go/business-docs/system/README.md) 和当前模块规则。
3. 阅读 [菜单消息 UI](./message-push-ui.md) 或 [下载中心 UI](./download-center-ui.md)。
4. 核对 Store、API、页面、布局和后端对应实现。

## 模块

| 前端模块 | UI 文档 | 后端规则 |
|---|---|---|
| 菜单消息推送 | [message-push-ui.md](./message-push-ui.md) | [message-push.md](../../../hive-admin-go/business-docs/system/message-push.md) |
| 下载中心 | [download-center-ui.md](./download-center-ui.md) | [download-center.md](../../../hive-admin-go/business-docs/system/download-center.md) |

## 维护边界

- 后端文档定义持久化、状态、权限、Worker、文件和清理规则。
- 前端文档定义菜单角标、SSE 消费、列表刷新和下载按钮。
- SSE 事件只用于提示刷新，不能替代重新查询权威状态。
- 来源模块新增异步导出时，必须同步下载中心规则和来源模块 UI 文档。

## 源码入口

- API：`apps/web-antdv-next/src/api/system/message.ts`、`download.ts`。
- Store：`apps/web-antdv-next/src/store/menu-message.ts`。
- 布局接入：`apps/web-antdv-next/src/layouts/basic.vue`。
- 页面：`apps/web-antdv-next/src/views/system/message`、`downloadCenter`。
- 国际化：`apps/web-antdv-next/src/locales/langs/zh-CN/system.json` 和 `en-US/system.json`。

