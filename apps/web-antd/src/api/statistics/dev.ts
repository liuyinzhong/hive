import { requestClient } from '#/api/request';
import type { Recordable } from '@vben/types';

/* 统计任务趋势 */
export const getTaskFindDay = async (params: Recordable<any>) => {
  return requestClient.get('/statistics/dev/getTaskFindDay', {
    params,
  });
};

/* 统计任务总量。以年-月统计数量，拼凑柱状图 */
export const getTaskFindYear = async (params: Recordable<any>) => {
  return requestClient.get('/statistics/dev/getTaskFindYear', {
    params,
  });
};

/* 获取工作空间枚举 */
export const getWorkspaceEnum = async (params: Recordable<any>) => {
  return requestClient.get('/statistics/dev/getWorkspaceEnum', {
    params,
  });
};
