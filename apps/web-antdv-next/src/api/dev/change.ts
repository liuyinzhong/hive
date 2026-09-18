import type { Recordable } from '@vben/types';
import { objectOmit } from '@vueuse/core';
import { requestClient } from '#/api/request';
export namespace DevChangeApi {
  /** 字段级变更明细项：字典值存原始值,由前端按 dictType 翻译展示 */
  export interface ChangeItem {
    /** 变更字段键(数据库列名) */
    fieldKey?: string;
    /** 字段中文标签,后端写入时刻固化 */
    fieldLabel?: string;
    /** 值所属字典类型,空表示非字典值 */
    dictType?: string;
    /** 旧值(字典值存原始值;附件类为"移除：文件名"或空) */
    oldValue?: string;
    /** 新值(字典值存原始值;附件类为"新增：文件名"或空) */
    newValue?: string;
  }

  export interface DevChangeFace {
    [key: string]: any;
    changeId?: string;
    /* 字典：CHANGE_BEHAVIOR */
    changeBehavior?: string;
    /* 变更原因,富文本格式 */
    changeRichText?: string;
    /** 字段级变更明细,存量记录无明细时为空数组 */
    changeItems?: ChangeItem[];
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
