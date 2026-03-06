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

/**
 * 获取模块列表
 *
 * @param params 查询参数
 */
export const getModulesList = async (params: Recordable<any>) => {
  return requestClient.get<Array<DevModuleApi.DevModuleFace>>(
    '/dev/module/list',
    {
      params,
    },
  );
};

/**
 * 创建模块
 *
 * @param data 模块 数据
 */
export const createModule = async (
  data: Omit<DevModuleApi.DevModuleFace, 'moduleId'>,
) => {
  const newData = objectOmit(data, ['moduleId']);
  return requestClient.post('/dev/module', newData);
};

/**
 * 更新模块
 *
 * @param id 模块 ID
 * @param data 模块 数据
 */
export const updateModule = async (
  id: string,
  data: Omit<DevModuleApi.DevModuleFace, 'moduleId'>,
) => {
  const newData = objectOmit(data, ['moduleId']);
  return requestClient.put(`/dev/module/${id}`, newData);
};
