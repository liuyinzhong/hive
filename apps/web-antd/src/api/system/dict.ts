import { requestClient } from '#/api/request';
import type { Recordable } from '@vben/types';
import { objectOmit } from '@vueuse/core';

export namespace SystemDictApi {
  export interface SystemDictFace {
    [key: string]: any;
    /** 字典id,; */
    id?: string | number;
    /** 字典父id,; */
    pid?: string | number | null;
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
    '/system/dict/list',
    { params },
  );
};

/**
 * 获取字典全量数据
 */
export const getDictListAll = async () => {
  return requestClient.get<Array<SystemDictApi.SystemDictFace>>(
    '/system/dict/listAll',
  );
};

/**
 * 创建字典
 * @param data 字典数据
 */
export const createDict = async (
  data: Omit<SystemDictApi.SystemDictFace, 'children' | 'id'>,
) => {
  const newData = objectOmit(data, ['children', 'id']);
  return requestClient.post('/system/dict', newData);
};

/**
 * 更新字典
 * @param id 字典 ID
 * @param data 字典数据
 */
export const updateDict = async (
  id: string | number,
  data: Omit<SystemDictApi.SystemDictFace, 'children' | 'id'>,
) => {
  const newData = objectOmit(data, ['children', 'id']);
  return requestClient.put(`/system/dict/${id}`, newData);
};
