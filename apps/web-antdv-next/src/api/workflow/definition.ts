import type { Recordable } from '@vben/types';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';

export namespace WorkflowDefinitionApi {
  export type WorkflowFormFieldPermission = 'editable' | 'hidden' | 'readonly';

  export interface WorkflowDefinition {
    [key: string]: any;
    definitionId?: string;
    definitionKey: string;
    definitionName: string;
    category?: string;
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
