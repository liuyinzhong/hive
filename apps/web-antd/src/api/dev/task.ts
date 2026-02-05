import { requestClient } from '#/api/request';
import type { Recordable } from '@vben/types';

export namespace DevTaskApi {
  export interface DevTaskFace {
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
    taskNum?: number;
    taskRichText?: string;
    taskStatus?: number;
    taskType?: number;
    planHours?: number;
    actualHours?: number;
    /* 任务进度百分比 0~100 */
    percent?: number;
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
    items: Array<DevTaskApi.DevTaskFace>;
    total: number;
  }>('/dev/task/list', {
    params,
  });
}

async function createTask(data: Omit<DevTaskApi.DevTaskFace, 'taskId'>) {
  return requestClient.post('/dev/task', data);
}

/* 根据storyId查询任务 */
async function taskListByStoryId(params: Recordable<any>) {
  return requestClient.get<Array<DevTaskApi.DevTaskFace>>(
    '/dev/task/taskListByStoryId',
    {
      params,
    },
  );
}

export { getTaskList, createTask, taskListByStoryId };
