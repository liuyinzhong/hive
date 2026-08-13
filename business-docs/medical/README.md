# 医疗前端业务手册

本目录记录医疗页面入口、按钮、表单联动和刷新规则。业务状态、前置条件、事务和副作用的正文位于后端 [医疗业务手册](../../../hive-admin-go/business-docs/medical/README.md)。

## 阅读顺序

1. 阅读后端 [医疗领域词汇](../../../hive-admin-go/business-docs/medical/CONTEXT.md)。
2. 阅读后端当前模块规则和下表对应 UI 文档。
3. 最后核对 src/api/medical、src/views/medical 和后端实现。

## 模块

| 前端模块 | UI 文档 | 后端规则 |
|---|---|---|
| 临床科室 | [department-ui.md](./department-ui.md) | [department.md](../../../hive-admin-go/business-docs/medical/department.md) |
| 医生管理 | [doctor-ui.md](./doctor-ui.md) | [doctor.md](../../../hive-admin-go/business-docs/medical/doctor.md) |
| 患者档案 | [patient-ui.md](./patient-ui.md) | [patient.md](../../../hive-admin-go/business-docs/medical/patient.md) |
| 疾病诊断档案 | [diagnosis-ui.md](./diagnosis-ui.md) | [diagnosis.md](../../../hive-admin-go/business-docs/medical/diagnosis.md) |
| 挂号费 | [registration-fee-ui.md](./registration-fee-ui.md) | [registration-fee.md](../../../hive-admin-go/business-docs/medical/registration-fee.md) |
| 医生排班 | [schedule-ui.md](./schedule-ui.md) | [schedule.md](../../../hive-admin-go/business-docs/medical/schedule.md) |
| 挂号与候诊 | [registration-ui.md](./registration-ui.md) | [挂号](../../../hive-admin-go/business-docs/medical/registration.md)、[候诊](../../../hive-admin-go/business-docs/medical/visit-queue.md) |
| 医生工作台、病历与处方审核 | [outpatient-workbench-ui.md](./outpatient-workbench-ui.md) | [outpatient-workbench-draft.md](../../../hive-admin-go/business-docs/medical/outpatient-workbench-draft.md) |

药房词汇目前是规划边界，前端没有对应页面或 API。新增药房页面前必须先建立后端模块规则和本目录 UI 文档。
