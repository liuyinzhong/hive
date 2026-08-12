# 医疗页面上下文

修改本目录页面前先阅读前端 `business-docs/medical/README.md`，再按模块阅读对应 UI 文档和后端规则正文。

- `doctor-workbench`、`diagnosis`、`prescription-review`：阅读前端 `outpatient-workbench-ui.md` 和后端 `outpatient-workbench-draft.md`。
- `registration`：阅读前端 `registration-ui.md`、后端 `visit-queue.md` 和根 `CONTEXT.md`。
- `doctor`、`schedule`：继续遵循各自目录内更具体的 `AGENTS.md`。

医生工作台全部操作共用 `medical:doctorWorkbench:access`，处方审核共用 `medical:prescriptionReview:access`；页面按钮状态不能代替后端医生归属、候诊状态和审核人校验。候诊队列始终脱敏，开始接诊后的当前患者和历史病历不脱敏。

门诊病历的文档式录入只改变交互表现，API 仍按独立结构化字段保存，禁止把整段 HTML 或富文本作为病历正文提交。
