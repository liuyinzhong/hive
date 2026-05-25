import type { Recordable } from '@vben/types';
import { objectOmit } from '@vueuse/core';
import { requestClient } from '#/api/request';
export namespace DevChangeApi {
  export interface DevChangeFace {
    [key: string]: any;
    changeId?: string;
    /* 字典：CHANGE_BEHAVIOR */
    changeBehavior?: string;
    /* 变更原因,富文本格式 */
    changeRichText?: string;
    creatorId?: string;
    creatorName?: string;
    businessId?: string;
    /* 字典：BUSINESS_TYPE */
    businessType?: string;
    extendJson?: string;
    /** 创建时间 (在TS中通常使用字符串格式的时间，也可根据实际情况用Date) */
    createDate?: Date | string;
    /** 修改时间 (在TS中通常使用字符串格式的时间，也可根据实际情况用Date) */
    updateDate?: Date | string;
  }
}

export const getChangeListApi = async (params: Recordable<any>) => {
  return requestClient.get<Array<DevChangeApi.DevChangeFace>>(
    '/dev/changeHistory',
    {
      params,
    },
  );
};

// 创建变更记录
export const addChangeApi = async (
  data: Omit<DevChangeApi.DevChangeFace, 'changeId'>,
) => {
  const newData = objectOmit(data, ['changeId']);
  return requestClient.post('/dev/changeHistory', newData);
};
