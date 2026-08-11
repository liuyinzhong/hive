# 医疗前端业务手册

本目录记录医生管理、医生排班和挂号候诊的页面入口、按钮展示、表单联动和交互约束。业务规则正文位于后端仓库 `hive-admin-go/business-docs/medical`。

## 阅读顺序

1. 阅读后端 [医疗领域词汇](../../../hive-admin-go/business-docs/medical/CONTEXT.md)。
2. 阅读后端 [医疗业务手册](../../../hive-admin-go/business-docs/medical/README.md) 和当前模块规则。
3. 阅读 [医生管理 UI](./doctor-ui.md)、[医生排班 UI](./schedule-ui.md) 或 [挂号候诊 UI](./registration-ui.md)。
4. 核对 `src/api/medical`、当前页面和后端对应接口。

## 模块

| 前端模块 | UI 文档 | 后端规则 |
|---|---|---|
| 医生管理 | [doctor-ui.md](./doctor-ui.md) | [doctor.md](../../../hive-admin-go/business-docs/medical/doctor.md) |
| 医生排班 | [schedule-ui.md](./schedule-ui.md) | [schedule.md](../../../hive-admin-go/business-docs/medical/schedule.md) |
| 挂号候诊 | [registration-ui.md](./registration-ui.md) | [visit-queue.md](../../../hive-admin-go/business-docs/medical/visit-queue.md) |

## 维护边界

- 后端文档定义状态、前置条件、事务和副作用。
- 前端文档定义页面呈现、按钮条件和表单联动。
- 页面状态判断和按钮隐藏不能代替后端校验。
- 患者、挂号主流程和挂号费尚未完整迁入本目录，相关任务继续核对后端根 `CONTEXT.md` 和当前代码。
