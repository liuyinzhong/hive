import { requestClient } from '#/api/request';
import type { Recordable } from '@vben/types';
export namespace DevModuleApi {
  export interface DevModuleFace {
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
  return requestClient.get<Array<DevModuleApi.DevModuleFace>>(
    '/dev/module/list',
    {
      params,
    },
  );
}

async function createModule(
  data: Omit<DevModuleApi.DevModuleFace, 'moduleId'>,
) {
  return requestClient.post('/dev/module', data);
}

export { getModulesList, createModule };
