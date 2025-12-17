import { requestClient } from '#/api/request';
export namespace SystemProjectApi {
  export interface SystemProject {
    [key: string]: any;
    projectId: string;
    projectTitle: string;
    projectLogo: any;
    createdTime?: string;
    description: string;
  }
}

async function getProjectsList() {
  return requestClient.get<Array<SystemProjectApi.SystemProject>>(
    '/dev/project/list',
  );
}

async function createProject(
  data: Omit<SystemProjectApi.SystemProject, 'projectId'>,
) {
  return requestClient.post('/dev/project', data);
}

export { getProjectsList, createProject };
