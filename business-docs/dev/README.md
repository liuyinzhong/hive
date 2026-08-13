# 开发管理前端业务手册

本目录记录开发管理页面和仪表盘交互。业务规则正文见后端 [开发管理手册](../../../hive-admin-go/business-docs/dev/README.md)。

| 模块 | UI 文档 | 后端规则 |
|---|---|---|
| 项目、模块、版本 | [project-planning-ui.md](./project-planning-ui.md) | [project-planning.md](../../../hive-admin-go/business-docs/dev/project-planning.md) |
| 需求、任务、缺陷、变更记录 | [work-items-ui.md](./work-items-ui.md) | [work-items.md](../../../hive-admin-go/business-docs/dev/work-items.md) |
| 仪表盘和统计 | [statistics-ui.md](./statistics-ui.md) | [statistics.md](../../../hive-admin-go/business-docs/dev/statistics.md) |

修改前先读后端领域词汇和规则，再读对应 UI 文档，最后核对 src/api/dev、src/api/statistics/dev.ts、src/views/dev 和 src/views/dashboard。
