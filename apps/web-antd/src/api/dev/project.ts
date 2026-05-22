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
export const getProjectsListApi = async () => {
  return requestClient.get<Array<DevProjectApi.DevProjectFace>>(
    '/dev/projects',
  );
};

/**
 * 创建项目
 *
 * @param data 项目 数据
 */
export const createProjectApi = async (
  data: Omit<DevProjectApi.DevProjectFace, 'projectId'>,
) => {
  const newData = objectOmit(data, ['projectId']);
  return requestClient.post('/dev/projects', newData);
};

/**
 * 更新项目
 */
export const updateProjectApi = async (
  projectId: string,
  data: Omit<DevProjectApi.DevProjectFace, 'projectId'>,
) => {
  const newData = objectOmit(data, ['projectId']);
  return requestClient.put(`/dev/projects/${projectId}`, newData);
};
