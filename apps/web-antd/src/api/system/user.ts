import { requestClient } from '#/api/request';
import type { Recordable } from '@vben/types';
import { objectOmit } from '@vueuse/core';
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

async function createUser(data: Omit<SystemUserApi.SystemUserFace, 'userId'>) {
  const newData = objectOmit(data, ['userId']);
  return requestClient.post('/system/user', newData);
}

async function updateUser(
  userId: string | number,
  data: Omit<SystemUserApi.SystemUserFace, 'userId'>,
) {
  const newData = objectOmit(data, ['userId']);
  return requestClient.put(`/system/user/${userId}`, newData);
}

export { getUsersList, getUserListAll, createUser, updateUser };
