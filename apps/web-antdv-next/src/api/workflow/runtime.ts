import type { Recordable } from '@vben/types';
import type {
  FormSchemaLayout,
  PersistentFormSchema,
} from '#/utils/form-schema';

import type { WorkflowDefinitionApi } from './definition';

import { requestClient } from '#/api/request';

export namespace WorkflowRuntimeApi {
  export type ApprovalMode = 'all' | 'any';
  export type CopyStatus = '0' | '1';
  export type InstanceStatus = '0' | '1' | '2' | '3';
  export type NodeStatus = '0' | '1' | '2' | '3';
  export type NodeType = 'approve' | 'condition' | 'copy' | 'end' | 'start';
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
    formSchema?: null | PersistentFormSchema[];
    formLayout: FormSchemaLayout;
    instanceId: string;
    instanceNo: string;
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
    nodeInstanceId: string;
    nodeName: string;
    starterName: string;
    status: TaskStatus;
    taskId: string;
    taskGroupId: string;
  }

  export interface WorkflowCopy {
    copyId: string;
    createDate?: null | string;
    instanceId: string;
    instanceTitle: string;
    nodeId: string;
    nodeInstanceId: string;
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
    nodeInstanceId: string;
    nodeName?: null | string;
    operatorId?: null | string;
    operatorName?: null | string;
    recordId: string;
    taskId?: null | string;
  }

  export interface WorkflowNodeActor {
    userId: string;
    userName: string;
  }

  export interface WorkflowNodeInstance {
    action: string;
    actors: WorkflowNodeActor[];
    approvalMode?: null | ApprovalMode;
    branchEdgeId?: null | string;
    copies: WorkflowCopy[];
    durationSeconds?: null | number;
    endDate?: null | string;
    fieldPermissions: Record<
      string,
      WorkflowDefinitionApi.WorkflowFormFieldPermission
    >;
    nodeId: string;
    nodeInstanceId: string;
    nodeName: string;
    nodeType: NodeType;
    records: WorkflowRecord[];
    routeVersion: number;
    sequence: number;
    startDate?: null | string;
    status: NodeStatus;
    tasks: WorkflowTask[];
  }

  export interface WorkflowInstanceDetail {
    instance: WorkflowInstance;
    nodes: WorkflowNodeInstance[];
  }

  export interface StartWorkflowInstanceRequest {
    // 业务对象主键(如需求 storyId),由业务发起方传入;空表示纯流程实例不绑定业务。
    businessId?: string;
    definitionId: string;
    variables: Record<string, unknown>;
  }

  export interface WorkflowTaskActionRequest {
    comment?: string;
    variables?: Record<string, unknown>;
  }

  export interface WorkflowReturnTarget {
    nodeId: string;
    nodeName: string;
  }

  export interface WorkflowTaskOperationRequest {
    comment?: string;
    targetNodeId?: string;
    targetUserId?: string;
    taskIds?: string[];
    userIds?: string[];
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

export function transferWorkflowTaskApi(
  taskId: string,
  data: WorkflowRuntimeApi.WorkflowTaskOperationRequest,
) {
  return requestClient.put(`/workflow/tasks/${taskId}/transfer`, data);
}

export function addWorkflowTaskSignApi(
  taskId: string,
  data: WorkflowRuntimeApi.WorkflowTaskOperationRequest,
) {
  return requestClient.put(`/workflow/tasks/${taskId}/addSign`, data);
}

export function removeWorkflowTaskSignApi(
  taskId: string,
  data: WorkflowRuntimeApi.WorkflowTaskOperationRequest,
) {
  return requestClient.put(`/workflow/tasks/${taskId}/removeSign`, data);
}

export function getWorkflowTaskReturnTargetsApi(taskId: string) {
  return requestClient.get<WorkflowRuntimeApi.WorkflowReturnTarget[]>(
    `/workflow/tasks/${taskId}/returnTargets`,
  );
}

export function returnWorkflowTaskApi(
  taskId: string,
  data: WorkflowRuntimeApi.WorkflowTaskOperationRequest,
) {
  return requestClient.put(`/workflow/tasks/${taskId}/return`, data);
}

export function getWorkflowCopiesApi(params: Recordable<unknown>) {
  return requestClient.get<
    WorkflowRuntimeApi.PaginationResult<WorkflowRuntimeApi.WorkflowCopy>
  >('/workflow/copies', { params, paramsSerializer: 'comma' });
}

export function readWorkflowCopyApi(copyId: string) {
  return requestClient.put(`/workflow/copies/${copyId}/read`);
}
