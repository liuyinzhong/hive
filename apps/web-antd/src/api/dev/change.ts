import { requestClient } from '#/api/request';
import type { Recordable } from '@vben/types';
export namespace DevChangeApi {
  export interface DevChangeFace {
    [key: string]: any;
    changeId?: string;
    /* 字典：CHANGE_BEHAVIOR */
    changeType?: string;
    /* 变更原因,富文本格式 */
    changeRichText?: string;
    creatorId?: string;
    creatorName?: string;
    fkId?: string;
    /* 字典：CHANGE_TYPE */
    fkType?: string;
    extendJson?: string;
    /** 创建时间 (在TS中通常使用字符串格式的时间，也可根据实际情况用Date) */
    createDate?: string | Date;
    /** 修改时间 (在TS中通常使用字符串格式的时间，也可根据实际情况用Date) */
    updateDate?: string | Date;
  }
}

async function getChangeList(params: Recordable<any>) {
  return requestClient.get<Array<DevChangeApi.DevChangeFace>>(
    '/dev/change/list',
    {
      params,
    },
  );
}

export { getChangeList };
