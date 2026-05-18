import type { Recordable } from '@vben/types';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';

export namespace SystemDictApi {
  export interface SystemDictFace {
    [key: string]: any;
    /** 字典id,; */
    id: string;
    /** 字典父id,; */
    pid?: string;
    /** 字典标题,; */
    label?: string;
    /** 字典值,; */
    value?: string;
    /** 字典类型,; */
    type?: string;
    /** 禁用状态 */
    disabled?: any;
    /** 备注,; */
    remark?: string;
    /** 颜色 */
    color?: string;
    /** 子字典 */
    children?: SystemDictFace[];
    /** 创建时间 */
    createDate?: string;
  }
}

/**
 * 获取字典列表数据
 */
export const getDictListApi = async (params: Recordable<any>) => {
  return requestClient.get<Array<SystemDictApi.SystemDictFace>>(
    '/system/dicts',
    { params },
  );
};

/**
 * 获取字典全量数据
 */
export const getDictListAllApi = async () => {
  return requestClient.get<Array<SystemDictApi.SystemDictFace>>(
    '/system/dicts/all',
  );
};

/**
 * 创建字典
 */
export const createDictApi = async (
  data: Omit<SystemDictApi.SystemDictFace, 'children' | 'id'>,
) => {
  const newData = objectOmit(data, ['children', 'id']);
  return requestClient.post('/system/dicts', newData);
};

/**
 * 更新字典
 */
export const updateDictApi = async (
  id: number | string,
  data: Omit<SystemDictApi.SystemDictFace, 'children' | 'id'>,
) => {
  const newData = objectOmit(data, ['children', 'id']);
  return requestClient.put(`/system/dicts/${id}`, newData);
};

export const deleteDictApi = async (ids: string[]) => {
  return requestClient.delete(`/system/dicts`, {
    data: ids,
  });
};
