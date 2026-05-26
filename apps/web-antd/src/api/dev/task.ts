import type { Recordable } from '@vben/types';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';
export namespace DevTaskApi {
  export interface DevTaskFace {
    [key: string]: any;
    taskId?: string;
    pid?: any;
    storyId?: string;
    storyTitle?: string;
    moduleId?: string;
    moduleTitle?: string;
    versionId?: string;
    version?: string;
    projectId?: string;
    projectTitle?: string;
    taskTitle?: string;
    taskNum?: any;
    taskRichText?: string;
    taskStatus?: string;
    taskType?: string;
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

/**
 * 获取任务列表
 */
export const getTaskListApi = async (params: Recordable<any>) => {
  return requestClient.get<{
    items: Array<DevTaskApi.DevTaskFace>;
    total: number;
  }>('/dev/tasks', {
    params,
  });
};

/**
 * 创建任务
 */
export const createTaskApi = async (
  data: Omit<DevTaskApi.DevTaskFace, 'taskId'>,
) => {
  const newData = objectOmit(data, ['taskId']);
  return requestClient.post('/dev/tasks', newData);
};

/**
 * 更新任务
 */
export const updateTaskApi = async (
  id: string,
  data: Omit<DevTaskApi.DevTaskFace, 'taskId'>,
) => {
  const newData = objectOmit(data, ['taskId']);
  return requestClient.put(`/dev/tasks/${id}`, newData);
};

/**
 * 根据任务编号查询数据
 *
 * @param taskNum 任务编号
 */
export const getTaskDetailApi = async (taskNum: number) => {
  return requestClient.get<DevTaskApi.DevTaskFace>(`/dev/tasks/${taskNum}`);
};

/**
 * 删除任务
 */
export const deleteTaskApi = async (ids: string[]) => {
  return requestClient.delete(`/dev/tasks`, { data: ids });
};

/**
 * 流转任务
 */
export const nextTaskApi = async (taskId: string, data: Recordable<any>) => {
  const newData = objectOmit(data, ['taskId']);
  return requestClient.put(`/dev/tasks/${taskId}/next`, newData);
};

/**
 * 更新任务字段
 */
export const updateTaskFieldApi = async (
  taskId: string,
  data: Recordable<any>,
) => {
  const newData = objectOmit(data, ['taskId']);
  return requestClient.put(`/dev/tasks/${taskId}/field`, newData);
};
