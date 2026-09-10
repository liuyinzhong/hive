# 通知中心组件开发规范

本目录存放布局级通知中心组件。修改 `notification-center.vue` 前必须按以下顺序阅读：

1. 后端业务正文：[message-push.md](../../../../../../hive-admin-go/business-docs/system/message-push.md)（重点 SYS-MSG-001/003/010/011）
2. 前端 UI 规则：[message-push-ui.md](../../../../../business-docs/system/message-push-ui.md)
3. 消息数据层：`../store/menu-message.ts` 与 `../../api/system/message.ts`

## 硬性约定

- 已读口径不可更改：点击消息项 = 整组已读 + 跳转归属菜单（复用 Store 的 `markMenuRead`）；消息项按钮 = 逐条已读（系统内唯一单条路径）；头部按钮 = 全量已读。不做删除、清空。
- 列表契约：全部来源、含已读、最近 100 条、创建时间倒序；仅在弹层打开时拉取，不做实时刷新与分页。
- 红点 = Store 的 `totalUnreadCount > 0`，不显示具体数字。
- 文案一律使用 `system.notice.*` 国际化 key，中英文（`src/locales/langs/{zh-CN,en-US}/system.json`）同步维护。
- SSE 事件名只引用 `SystemMenuMessageApi.EventName` 常量，禁止裸字符串。
- 弹层、tooltip 使用项目已有 `antdv-next` 的 `Popover`/`Tooltip`，图标使用 `@vben/icons`；`VbenPopover`/`VbenScrollbar` 等基础组件未被 `@vben/common-ui` 再导出，不为此新增 `@vben-core/shadcn-ui` 依赖。
- 不得修改 `packages` 公共包与上游 Notification 组件相关代码。
