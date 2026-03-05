import { requestClient } from '#/api/request';
import { objectOmit } from '@vueuse/core';
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

async function getProjectsList() {
  return requestClient.get<Array<DevProjectApi.DevProjectFace>>(
    '/dev/project/list',
  );
}

async function createProject(
  data: Omit<DevProjectApi.DevProjectFace, 'projectId'>,
) {
  const newData = objectOmit(data, ['projectId']);
  return requestClient.post('/dev/project', newData);
}

/**
 * 更新项目
 *
 * @param id 项目 ID
 * @param data 项目 数据
 */
async function updateProject(
  id: string,
  data: Omit<DevProjectApi.DevProjectFace, 'projectId'>,
) {
  const newData = objectOmit(data, ['projectId']);
  return requestClient.put(`/dev/project/${id}`, newData);
}

export { getProjectsList, createProject, updateProject };
