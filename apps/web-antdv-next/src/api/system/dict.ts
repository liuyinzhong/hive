import type { Recordable } from '@vben/types';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';

export namespace SystemDictApi {
  export interface SystemDictFace {
    [key: string]: any;
    /** 字典id,; */
    id?: string;
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
 * 公共字典树查询（仅需登录，无接口权限）
 * @description 返回全部启用状态的字典树（status=1），供全系统本地字典消费
 */
export const getDictValuesApi = async () => {
  return requestClient.post<Array<SystemDictApi.SystemDictFace>>(
    '/system/dicts/values',
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

export const updateDictStatusApi = async (
  id: number | string,
  data: Omit<SystemDictApi.SystemDictFace, 'id'>,
) => {
  return requestClient.put(`/system/dicts/${id}/status`, data);
};
