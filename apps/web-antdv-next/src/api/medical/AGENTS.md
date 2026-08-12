# 医疗 API 上下文

修改 `doctor.ts` 时阅读 `hive-admin-go/business-docs/medical/doctor.md` 和前端 `business-docs/medical/doctor-ui.md`；修改 `schedule.ts` 时阅读后端 `schedule.md` 和前端 `schedule-ui.md`。

修改 `registration.ts` 时阅读后端 `business-docs/medical/visit-queue.md`、根 `CONTEXT.md` 和前端 `business-docs/medical/registration-ui.md`。`schedule.ts` 涉及候诊队列字段或接口时，还需阅读后端 `visit-queue.md`。

本目录还包含患者、挂号和挂号费 API，它们尚未完整迁入新业务手册；修改这些文件时继续核对后端根 `CONTEXT.md`、当前 Router、Model/DTO 和 Service，不得套用医生或排班规则。

修改 `diagnosis.ts` 或 `outpatient.ts` 时，必须阅读后端 `business-docs/medical/outpatient-workbench-draft.md` 和前端 `business-docs/medical/outpatient-workbench-ui.md`。医生工作台队列状态同时影响 `registration.ts` 与 `schedule.ts`，修改状态枚举时必须同步三处类型和中英文国际化。
