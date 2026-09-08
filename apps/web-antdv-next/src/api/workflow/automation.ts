import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace WorkflowAutomationApi {
  /** 动作类型:修改字段值;预留插入记录 */
  export type AutomationActionType = 'update_field';

  /** 动作参数,结构随动作类型变化;update_field 为修改字段值参数 */
  export interface AutomationActionConfig {
    /** 目标字段,须在业务类型可写字段白名单内 */
    targetField: string;
    /** 目标值,字典字段须为对应字典的合法值 */
    targetValue: string;
  }

  export interface WfAutomation {
    automationId?: string;
    automationName: string;
    /** 业务类型,字典BUSINESS_TYPE的值(0需求/10任务/20缺陷/30版本) */
    businessType: string;
    actionType: AutomationActionType;
    actionConfig: AutomationActionConfig;
    /** 状态:0启用 1停用;提交数字,列表响应为字符串 */
    status?: number | string;
    remark?: string;
    creatorId?: string;
    creatorName?: string;
    createDate?: string;
    updateDate?: string;
  }

  /** 动作响应:附带字段元数据,供摘要渲染和字典翻译 */
  export interface AutomationResponse {
    automationId?: string;
    automationName: string;
    businessType: string;
    actionType: string;
    targetField: string;
    targetValue: string;
    /** 目标字段中文名,来自后端业务类型注册表 */
    targetFieldLabel: string;
    /** 目标值字典类型,前端按字典翻译展示 */
    dictType: string;
    status: string;
    remark?: string;
    creatorId?: string;
    creatorName?: string;
    createDate?: string;
    updateDate?: string;
  }

  /** 业务类型可写字段元数据 */
  export interface AutomationFieldMeta {
    field: string;
    label: string;
    dictType: string;
  }
}

/** 分页查询自动化动作 */
export const getAutomationListApi = async (params: Recordable<any>) => {
  return requestClient.get<{
    items: WorkflowAutomationApi.AutomationResponse[];
    total: number;
  }>('/workflow/automations', {
    params,
    paramsSerializer: 'comma',
  });
};

/** 按业务类型返回启用的自动化动作选项,供设计器节点挂载选择器 */
export const getAutomationOptionsApi = async (businessType?: string) => {
  return requestClient.get<WorkflowAutomationApi.AutomationResponse[]>(
    '/workflow/automations/options',
    { params: { businessType } },
  );
};

/** 返回业务类型的可写字段元数据,供动作库表单目标字段下拉 */
export const getAutomationFieldsApi = async (businessType: string) => {
  return requestClient.get<WorkflowAutomationApi.AutomationFieldMeta[]>(
    '/workflow/automations/fields',
    { params: { businessType } },
  );
};

/** 创建自动化动作 */
export const createAutomationApi = async (
  data: WorkflowAutomationApi.WfAutomation,
) => {
  return requestClient.post('/workflow/automations', data);
};

/** 更新自动化动作 */
export const updateAutomationApi = async (
  automationId: string,
  data: WorkflowAutomationApi.WfAutomation,
) => {
  return requestClient.put(`/workflow/automations/${automationId}`, data);
};

/** 批量删除自动化动作(软删除,已挂载画布的快照不受影响) */
export const deleteAutomationApi = async (automationIds: string[]) => {
  return requestClient.delete('/workflow/automations', {
    data: automationIds,
  });
};
