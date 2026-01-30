import { requestClient } from '#/api/request';
import type { Recordable } from '@vben/types';

export namespace SystemDictApi {
  export interface SystemDict {
    /** 字典id,; */
    id?: string | number;
    /** 字典父id,; */
    pid?: string | number | null;
    /** 字典标题,; */
    label: string;
    /** 字典值,; */
    value: string;
    /** 字典类型,; */
    type?: string;
    /** 禁用状态 */
    disabled?: any;
    /** 备注,; */
    remark?: string;
    /** 颜色 */
    color?: string;
    /** 子字典 */
    children?: SystemDict[];
    /** 创建时间 */
    createDate?: string;
  }
}

/**
 * 获取字典列表数据
 */
async function getDictList(params: Recordable<any>) {
  return requestClient.get<Array<SystemDictApi.SystemDict>>(
    '/system/dict/list',
    { params },
  );
}

/**
 * 创建字典
 * @param data 字典数据
 */
async function createDict(
  data: Omit<SystemDictApi.SystemDict, 'children' | 'id'>,
) {
  return requestClient.post('/system/dict', data);
}

export { createDict, getDictList };
