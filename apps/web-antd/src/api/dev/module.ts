import { requestClient } from '#/api/request';
import type { Recordable } from '@vben/types';
export namespace SystemModuleApi {
  export interface SystemModule {
    [key: string]: any;
    moduleId: string;
    moduleTitle: string;
    pid: any;
    projectId?: string;
    sort?: number;
    creatorId: string;
    creatorName: string;
    updateDate: string;
    createDate: string;
  }
}

async function getModulesList(params: Recordable<any>) {
  return requestClient.get<Array<SystemModuleApi.SystemModule>>(
    '/dev/module/list',
    { params },
  );
}

async function createModule(
  data: Omit<SystemModuleApi.SystemModule, 'moduleId'>,
) {
  return requestClient.post('/dev/module', data);
}

export { getModulesList, createModule };
