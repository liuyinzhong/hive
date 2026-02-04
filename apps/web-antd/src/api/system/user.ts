import { requestClient } from '#/api/request';
import type { Recordable } from '@vben/types';
export namespace SystemUserApi {
  export interface SystemUserFace {
    [key: string]: any;
    userId: string;
    avatar: string;
    username: string;
    realName: string;
    desc: string;
    password?: string;
    disabled: boolean;
    lastLoginIp: string;
    lastLoginDate: string;
    createDate: string;
    updateDate: string;
  }
}

/**
 * 获取用户列表数据
 */
async function getUsersList(params: Recordable<any>) {
  return requestClient.get<Array<SystemUserApi.SystemUserFace>>(
    '/system/user/list',
    {
      params,
    },
  );
}

async function getUserListAll(params?: Recordable<any>) {
  return requestClient.get<Array<SystemUserApi.SystemUserFace>>(
    '/system/user/listAll',
    { params },
  );
}

export { getUsersList, getUserListAll };
