import type { Recordable } from '@vben/types';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';

export namespace WorkflowDefinitionApi {
  export type WorkflowFormFieldPermission = 'editable' | 'hidden' | 'readonly';

  /** 流程定义启动类型:0手动发起流程(纯流程,发起申请入口) 1被动触发流程(由业务对象发起) */
  export type WorkflowStartType = 0 | 1;

  export interface WorkflowDefinition {
    [key: string]: any;
    definitionId?: string;
    // 流程标识由后端通过公共编码流水自动生成，创建/更新时不传入，列表/详情回显时由后端返回。
    definitionKey?: string;
    definitionName: string;
    category?: string;
    // 业务类型,字典BUSINESS_TYPE的值(0需求/10任务/20缺陷/30版本),必填,供自动化动作按类型过滤。
    businessType?: string;
    // 启动类型:0手动发起流程 1被动触发流程
    startType?: WorkflowStartType;
    // 默认流程标志:同业务类型唯一,仅被动触发流程可设,业务对象创建后按此匹配自动发起
    isDefault?: boolean;
    status?: string;
    version?: number;
    flowData?: string;
    formSchemaId?: null | string;
    remark?: string;
    creatorId?: string;
    creatorName?: string;
    createDate?: string;
    updateDate?: string;
  }
}

export const getWorkflowDefinitionListApi = async (params: Recordable<any>) => {
  return requestClient.get<{
    items: WorkflowDefinitionApi.WorkflowDefinition[];
    total: number;
  }>('/workflow/definitions', {
    params,
    paramsSerializer: 'comma',
  });
};

export const getAllWorkflowDefinitionsApi = async (
  params?: Recordable<any>,
) => {
  return requestClient.get<WorkflowDefinitionApi.WorkflowDefinition[]>(
    '/workflow/definitions/all',
    { params },
  );
};

export const getWorkflowDefinitionDetailApi = async (definitionId: string) => {
  return requestClient.get<WorkflowDefinitionApi.WorkflowDefinition>(
    `/workflow/definitions/${definitionId}`,
  );
};

export const createWorkflowDefinitionApi = async (
  data: Omit<WorkflowDefinitionApi.WorkflowDefinition, 'definitionId'>,
) => {
  return requestClient.post(
    '/workflow/definitions',
    objectOmit(data, ['definitionId']),
  );
};

export const updateWorkflowDefinitionApi = async (
  definitionId: string,
  data: Omit<WorkflowDefinitionApi.WorkflowDefinition, 'definitionId'>,
) => {
  return requestClient.put(
    `/workflow/definitions/${definitionId}`,
    objectOmit(data, ['definitionId']),
  );
};

export const saveWorkflowDefinitionCanvasApi = async (
  definitionId: string,
  flowData: string,
) => {
  return requestClient.put(`/workflow/definitions/${definitionId}/canvas`, {
    flowData,
  });
};

/** 保存流程定义绑定的申请表单结构。 */
export const saveWorkflowDefinitionFormApi = async (
  definitionId: string,
  formSchemaId: string,
) => {
  return requestClient.put(
    `/workflow/definitions/${definitionId}/formSchema`,
    {
      formSchemaId,
    },
  );
};

export const publishWorkflowDefinitionApi = async (definitionId: string) => {
  return requestClient.put(`/workflow/definitions/${definitionId}/publish`);
};

export const updateWorkflowDefinitionStatusApi = async (
  definitionId: string,
  status: string,
) => {
  return requestClient.put(`/workflow/definitions/${definitionId}/status`, {
    status,
  });
};

export const deleteWorkflowDefinitionApi = async (definitionIds: string[]) => {
  return requestClient.delete('/workflow/definitions', {
    data: definitionIds,
  });
};
