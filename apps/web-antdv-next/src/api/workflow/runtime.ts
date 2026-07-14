import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace WorkflowRuntimeApi {
  export type ApprovalMode = 'all' | 'any';
  export type CopyStatus = '0' | '1';
  export type InstanceStatus = '0' | '1' | '2' | '3';
  export type TaskStatus = '0' | '1' | '2' | '3';

  export interface PaginationResult<T> {
    items: T[];
    total: number;
  }

  export interface WorkflowInstance {
    businessKey?: null | string;
    createDate?: null | string;
    definitionId: string;
    definitionKey: string;
    definitionName: string;
    definitionVersion: number;
    endDate?: null | string;
    instanceId: string;
    startDate?: null | string;
    starterId: string;
    starterName: string;
    status: InstanceStatus;
    title: string;
    variables: Record<string, unknown>;
  }

  export interface WorkflowTask {
    approvalMode: ApprovalMode;
    assigneeId: string;
    assigneeName: string;
    comment?: null | string;
    createDate?: null | string;
    finishDate?: null | string;
    instanceId: string;
    instanceTitle: string;
    nodeId: string;
    nodeName: string;
    starterName: string;
    status: TaskStatus;
    taskId: string;
  }

  export interface WorkflowCopy {
    copyId: string;
    createDate?: null | string;
    instanceId: string;
    instanceTitle: string;
    nodeId: string;
    nodeName: string;
    readDate?: null | string;
    receiverId: string;
    receiverName: string;
    starterName: string;
    status: CopyStatus;
  }

  export interface WorkflowRecord {
    action: string;
    comment?: null | string;
    createDate?: null | string;
    nodeId?: null | string;
    nodeName?: null | string;
    operatorId?: null | string;
    operatorName?: null | string;
    recordId: string;
    taskId?: null | string;
  }

  export interface WorkflowInstanceDetail {
    copies: WorkflowCopy[];
    instance: WorkflowInstance;
    records: WorkflowRecord[];
    tasks: WorkflowTask[];
  }

  export interface StartWorkflowInstanceRequest {
    businessKey?: string;
    definitionId: string;
    title: string;
    variables: Record<string, unknown>;
  }

  export interface WorkflowTaskActionRequest {
    comment?: string;
  }
}

export function getWorkflowInstancesApi(params: Recordable<unknown>) {
  return requestClient.get<
    WorkflowRuntimeApi.PaginationResult<WorkflowRuntimeApi.WorkflowInstance>
  >('/workflow/instances', { params, paramsSerializer: 'comma' });
}

export function startWorkflowInstanceApi(
  data: WorkflowRuntimeApi.StartWorkflowInstanceRequest,
) {
  return requestClient.post<WorkflowRuntimeApi.WorkflowInstance>(
    '/workflow/instances',
    data,
  );
}

export function getWorkflowInstanceDetailApi(instanceId: string) {
  return requestClient.get<WorkflowRuntimeApi.WorkflowInstanceDetail>(
    `/workflow/instances/${instanceId}`,
  );
}

export function cancelWorkflowInstanceApi(instanceId: string) {
  return requestClient.put(`/workflow/instances/${instanceId}/cancel`);
}

export function getWorkflowTasksApi(params: Recordable<unknown>) {
  return requestClient.get<
    WorkflowRuntimeApi.PaginationResult<WorkflowRuntimeApi.WorkflowTask>
  >('/workflow/tasks', { params, paramsSerializer: 'comma' });
}

export function approveWorkflowTaskApi(
  taskId: string,
  data: WorkflowRuntimeApi.WorkflowTaskActionRequest,
) {
  return requestClient.put(`/workflow/tasks/${taskId}/approve`, data);
}

export function rejectWorkflowTaskApi(
  taskId: string,
  data: WorkflowRuntimeApi.WorkflowTaskActionRequest,
) {
  return requestClient.put(`/workflow/tasks/${taskId}/reject`, data);
}

export function getWorkflowCopiesApi(params: Recordable<unknown>) {
  return requestClient.get<
    WorkflowRuntimeApi.PaginationResult<WorkflowRuntimeApi.WorkflowCopy>
  >('/workflow/copies', { params, paramsSerializer: 'comma' });
}

export function readWorkflowCopyApi(copyId: string) {
  return requestClient.put(`/workflow/copies/${copyId}/read`);
}
