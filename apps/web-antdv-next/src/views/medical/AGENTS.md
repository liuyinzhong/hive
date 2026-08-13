# 医疗页面上下文

修改本目录任一页面前，必须先阅读前端 business-docs/medical/README.md，再阅读后端 business-docs/medical/CONTEXT.md、README.md 和对应模块规则，随后阅读对应 UI 文档，最后查看页面与 API 代码。不得从页面实现开始反推医疗业务。

- department、patient、diagnosis、registration-fee：读取同名后端规则和 *-ui.md。
- registration：同时读取 registration.md、visit-queue.md 和 registration-ui.md。
- doctor-workbench、prescription-review：读取 outpatient-workbench-draft.md 和 outpatient-workbench-ui.md；诊断管理再读 diagnosis.md。
- doctor、schedule：继续遵循各自目录内更具体的 AGENTS.md。

页面按钮状态不能代替后端权限、医生归属、号源、候诊、患者隐私和处方审核校验。医疗状态或接口变化必须同步所有受影响模块文档。
