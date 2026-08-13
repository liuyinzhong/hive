# 医疗 API 上下文

修改本目录任一 API 前，先阅读前端 business-docs/medical/README.md，再阅读后端 business-docs/medical/CONTEXT.md、README.md 和当前模块规则，之后阅读对应 UI 文档，最后核对 Router、Model/DTO、Service 与当前 API。

- department.ts：department.md、department-ui.md。
- doctor.ts：doctor.md、doctor-ui.md。
- patient.ts：patient.md、patient-ui.md。
- diagnosis.ts：diagnosis.md、diagnosis-ui.md；接诊使用还要读 outpatient-workbench-draft.md。
- registration-fee.ts：registration-fee.md、registration-fee-ui.md。
- schedule.ts：schedule.md、schedule-ui.md；队列字段还要读 visit-queue.md。
- registration.ts：registration.md、visit-queue.md、registration-ui.md。
- outpatient.ts：outpatient-workbench-draft.md、outpatient-workbench-ui.md。

医疗状态会跨排班、挂号、候诊、病历和处方联动，修改枚举或动作时必须同步受影响 API 类型、页面、中英文国际化和前后端文档。
