import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace WorkflowAutomationApi {
  /** 动作类型:修改字段值(挂被动触发流程) / 插入记录(挂手动发起流程) */
  export type AutomationActionType = 'insert_record' | 'update_field';

  /** 插入记录的值来源:fixed固定值 form表单字段 */
  export type InsertSourceType = 'fixed' | 'form';

  /** 修改字段值参数 */
  export interface UpdateFieldConfig {
    /** 目标字段,须在业务类型状态字段白名单内 */
    targetField: string;
    /** 目标值,字典字段须为对应字典的合法值 */
    targetValue: string;
    targetFieldLabel?: string;
    dictType?: string;
  }

  /** 插入记录的字段映射行 */
  export interface InsertRecordMapping {
    /** 目标字段,须在目标业务类型可插字段目录内 */
    field: string;
    sourceType: InsertSourceType;
    /** 固定值 */
    value?: string;
    /** 表单字段名(弱引用,发布时按流程绑定表单校验) */
    formField?: string;
  }

  /** 插入记录参数:插入目标即动作的业务类型,无独立目标类型 */
  export interface InsertRecordConfig {
    mappings: InsertRecordMapping[];
  }

  /** 插入记录响应:附目录元数据供渲染 */
  export interface InsertRecordConfigResponse extends InsertRecordConfig {
    targetBusinessLabel?: string;
    mappings: Array<InsertRecordMapping & {
      fieldLabel?: string;
      required?: boolean;
      dictType?: string;
      isRefField?: boolean;
    }>;
  }

  export interface WfAutomation {
    automationId?: string;
    automationName: string;
    /** 业务类型,字典BUSINESS_TYPE的值(0需求/10任务/20缺陷/30版本),设计器挂载过滤维度 */
    businessType: string;
    actionType: AutomationActionType;
    /** 动作参数:actionType=update_field 时为 UpdateFieldConfig,insert_record 时为 InsertRecordConfig */
    actionConfig: InsertRecordConfig | UpdateFieldConfig;
    /** 状态:0启用 1停用;提交数字,列表响应为字符串 */
    status?: number | string;
    remark?: string;
  }

  /** 动作响应:参数按动作类型挂载在 updateField / insertRecord 上 */
  export interface AutomationResponse {
    automationId?: string;
    automationName: string;
    businessType: string;
    actionType: string;
    updateField?: UpdateFieldConfig;
    insertRecord?: InsertRecordConfigResponse;
    status: string;
    remark?: string;
    creatorId?: string;
    creatorName?: string;
    createDate?: string;
    updateDate?: string;
  }

  /** 业务类型字段元数据;required 仅可插字段目录携带 */
  export interface AutomationFieldMeta {
    field: string;
    label: string;
    dictType: string;
    required?: boolean;
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

/** 返回业务类型的字段元数据:purpose=update 状态字段白名单;purpose=insert 可插字段目录(含必填) */
export const getAutomationFieldsApi = async (
  businessType: string,
  purpose?: 'insert' | 'update',
) => {
  return requestClient.get<WorkflowAutomationApi.AutomationFieldMeta[]>(
    '/workflow/automations/fields',
    { params: { businessType, purpose } },
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
