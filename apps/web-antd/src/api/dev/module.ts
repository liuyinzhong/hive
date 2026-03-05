import { requestClient } from '#/api/request';
import type { Recordable } from '@vben/types';
import { objectOmit } from '@vueuse/core';
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
  const newData = objectOmit(data, ['moduleId']);
  return requestClient.post('/dev/module', newData);
}

/**
 * 更新模块
 *
 * @param id 模块 ID
 * @param data 模块 数据
 */
async function updateModule(
  id: string,
  data: Omit<DevModuleApi.DevModuleFace, 'moduleId'>,
) {
  const newData = objectOmit(data, ['moduleId']);
  return requestClient.put(`/dev/module/${id}`, newData);
}

export { getModulesList, createModule, updateModule };
