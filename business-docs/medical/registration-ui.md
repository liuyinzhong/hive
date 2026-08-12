# 挂号候诊 UI

业务规则正文见后端 [挂号候诊队列规则](../../../hive-admin-go/business-docs/medical/visit-queue.md)，挂号主流程仍需同时核对后端根 `CONTEXT.md`。

## 列表签到

- 已支付挂号单继续使用现有“签到”按钮和 `medical:registration:checkIn` 权限码。
- 签到成功后直接使用动作接口返回的 `queueInfo.queueSequence` 提示候诊序号，不额外请求详情接口。
- 操作成功后刷新挂号列表；首期列表不增加候诊序号列。

## 挂号详情

详情接口返回非空 `queueInfo` 时展示：

- 候诊序号；
- 候诊状态；
- 叫号次数；
- 签到时间，取候诊记录的 `createDate`。

未签到时 `queueInfo` 为空或省略，详情不展示候诊信息。所有新增静态文案同时维护中英文国际化资源。

## 完成接诊

- 挂号管理不再提供调试用“完成接诊”按钮。
- 正式完成接诊只能从医生工作台门诊病历执行，页面规则见 [医生工作台与处方审核 UI](./outpatient-workbench-ui.md)。
