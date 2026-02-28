import { requestClient } from '#/api/request';
import type { Recordable } from '@vben/types';

/* 统计任务趋势 */
async function getTaskFindDay(params: Recordable<any>) {
  return requestClient.get('/statistics/dev/getTaskFindDay', {
    params,
  });
}

/* 统计任务总量。以年-月统计数量，拼凑柱状图 */
async function getTaskFindYear(params: Recordable<any>) {
  return requestClient.get('/statistics/dev/getTaskFindYear', {
    params,
  });
}

/* 获取工作空间枚举 */
async function getWorkspaceEnum(params: Recordable<any>) {
  return requestClient.get('/statistics/dev/getWorkspaceEnum', {
    params,
  });
}

export { getTaskFindDay, getTaskFindYear, getWorkspaceEnum };
