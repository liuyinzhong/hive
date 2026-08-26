import type { Recordable } from '@vben/types';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';

export namespace WorkflowDefinitionApi {
  export type WorkflowFormFieldPermission = 'editable' | 'hidden' | 'readonly';

  export interface WorkflowDefinition {
    [key: string]: any;
    definitionId?: string;
    // 流程标识由后端通过公共编码流水自动生成，创建/更新时不传入，列表/详情回显时由后端返回。
    definitionKey?: string;
    definitionName: string;
    category?: string;
    // 业务归属类型:story/bug/task,作为业务状态钩子注册键,空表示纯流程不绑定业务。由后端校验,创建/更新时传入。
    businessType?: string;
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

/** 节点业务键定义:流程设计器节点业务键下拉选项的元数据。 */
export interface BusinessNodeKeyDef {
  /** 节点业务键:流程节点上配置的稳定语义标识 */
  nodeKey: string;
  /** 中文名:设计器下拉展示 */
  label: string;
  /** 说明:设计器下拉提示 */
  description: string;
}

/** 业务状态钩子注册项:一个业务类型及其支持的节点业务键列表。 */
export interface BusinessHookRegistryItem {
  /** 业务类型:流程定义声明的业务归属标识 */
  businessType: string;
  /** 业务类型中文名:设计器下拉展示 */
  label: string;
  /** 该业务类型支持的节点业务键列表 */
  nodeKeys: BusinessNodeKeyDef[];
}

/** 查询业务状态钩子注册表,供流程设计器加载业务类型和节点业务键下拉选项。 */
export const getBusinessHooksApi = async () => {
  return requestClient.get<{ items: BusinessHookRegistryItem[] }>(
    '/workflow/business-hooks',
  );
};
