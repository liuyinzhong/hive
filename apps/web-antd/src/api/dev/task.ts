import { requestClient } from '#/api/request';
import type { Recordable } from '@vben/types';

export namespace SystemTaskApi {
  export interface SystemTask {
    [key: string]: any;
    taskId?: string;
    pid?: null;
    storyId?: string;
    storyTitle?: string;
    moduleId?: string;
    moduleTitle?: string;
    versionId?: string;
    version?: string;
    projectId?: string;
    projectTitle?: string;
    taskTitle?: string;
    taskNum?: string;
    taskRichText?: string;
    taskStatus?: number;
    taskType?: number;
    planHours?: number;
    actualHours?: number;
    endDate?: string;
    startDate?: string;
    createDate?: string;
    creatorId?: string;
    creatorName?: string;
    userId?: string;
    userName?: string;
    avatar?: string;
  }
}

async function getTaskList(params: Recordable<any>) {
  return requestClient.get<{
    items: Array<SystemTaskApi.SystemTask>;
    total: number;
  }>('/dev/task/list', {
    params,
  });
}

async function createTask(data: Omit<SystemTaskApi.SystemTask, 'taskId'>) {
  return requestClient.post('/dev/task', data);
}

export { getTaskList, createTask };
