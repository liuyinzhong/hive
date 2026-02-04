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

async function getProjectsList() {
  return requestClient.get<Array<DevProjectApi.DevProjectFace>>(
    '/dev/project/list',
  );
}

async function createProject(
  data: Omit<DevProjectApi.DevProjectFace, 'projectId'>,
) {
  return requestClient.post('/dev/project', data);
}

export { getProjectsList, createProject };
