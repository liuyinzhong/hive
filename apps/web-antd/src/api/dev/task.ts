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

/**
 * 获取任务列表
 *
 * @param params 查询参数
 */
export const getTaskList = async (params: Recordable<any>) => {
  return requestClient.get<{
    items: Array<DevTaskApi.DevTaskFace>;
    total: number;
  }>('/dev/task/list', {
    params,
  });
};

/**
 * 创建任务
 *
 * @param data 任务 数据
 */
export const createTask = async (
  data: Omit<DevTaskApi.DevTaskFace, 'taskId'>,
) => {
  const newData = objectOmit(data, ['taskId']);
  return requestClient.post('/dev/task', newData);
};

/**
 * 更新任务
 *
 * @param id 任务 ID
 * @param data 任务 数据
 */
export const updateTask = async (
  id: string,
  data: Omit<DevTaskApi.DevTaskFace, 'taskId'>,
) => {
  const newData = objectOmit(data, ['taskId']);
  return requestClient.put(`/dev/task/${id}`, newData);
};

/**
 * 根据任务编号查询数据
 *
 * @param taskNum 任务编号
 */
export const getTaskDetail = async (taskNum: number) => {
  return requestClient.get<DevTaskApi.DevTaskFace>('/dev/task/get', {
    params: {
      taskNum,
    },
  });
};

/**
 * 根据storyId查询任务
 *
 * @param params 查询参数
 */
export const taskListByStoryId = async (params: Recordable<any>) => {
  return requestClient.get<Array<DevTaskApi.DevTaskFace>>(
    '/dev/task/taskListByStoryId',
    {
      params,
    },
  );
};
