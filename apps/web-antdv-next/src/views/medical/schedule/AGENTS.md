# 医生排班页面上下文

修改本目录前依次阅读：

1. `hive-admin-go/business-docs/medical/CONTEXT.md`。
2. `hive-admin-go/business-docs/medical/doctor.md`。
3. `hive-admin-go/business-docs/medical/schedule.md`。
4. `hive/business-docs/medical/schedule-ui.md`。
5. 涉及候诊队列时，再阅读 `hive-admin-go/business-docs/medical/visit-queue.md` 和 `hive/business-docs/medical/registration-ui.md`。

重点核对排班状态机、半小时号源、模板冲突、生成幂等、发布费用快照、自动任务和按钮权限。前端按钮条件不能代替后端状态校验。
