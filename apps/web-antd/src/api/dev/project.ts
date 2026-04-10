import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';
export namespace DevProjectApi {
  export interface DevProjectFace {
    [key: string]: any;
    projectId: string;
    projectTitle: string;
    projectLogo: any;
    createDate?: string;
    updateDate?: string;
    description: string;
  }
}

/**
 * 获取项目列表
 */
export const getProjectsList = async () => {
  return requestClient.get<Array<DevProjectApi.DevProjectFace>>(
    '/dev/project/list',
  );
};

/**
 * 创建项目
 *
 * @param data 项目 数据
 */
export const createProject = async (
  data: Omit<DevProjectApi.DevProjectFace, 'projectId'>,
) => {
  const newData = objectOmit(data, ['projectId']);
  return requestClient.post('/dev/project', newData);
};

/**
 * 更新项目
 *
 * @param id 项目 ID
 * @param data 项目 数据
 */
export const updateProject = async (
  id: string,
  data: Omit<DevProjectApi.DevProjectFace, 'projectId'>,
) => {
  const newData = objectOmit(data, ['projectId']);
  return requestClient.put(`/dev/project/${id}`, newData);
};
