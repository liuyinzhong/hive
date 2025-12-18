import { requestClient } from '#/api/request';
import type { Recordable } from '@vben/types';
export namespace SystemUserApi {
  export interface SystemUser {
    [key: string]: any;
    userId: string;
    avatar: string;
    username: string;
    realName: string;
    desc: string;
    password: string;
    disabled: boolean;
    lastLoginIp: string;
    lastLoginDate: string;
    createTime: string;
    updateTime: string;
  }
}

/**
 * 获取用户列表数据
 */
async function getUsersList(params: Recordable<any>) {
  return requestClient.get<Array<SystemUserApi.SystemUser>>(
    '/system/user/list',
    {
      params,
    },
  );
}

export { getUsersList };
