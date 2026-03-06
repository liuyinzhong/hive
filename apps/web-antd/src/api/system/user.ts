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
export const getUsersList = async (params: Recordable<any>) => {
  return requestClient.get<Array<SystemUserApi.SystemUserFace>>(
    '/system/user/list',
    {
      params,
    },
  );
};

export const getUserListAll = async (params?: Recordable<any>) => {
  return requestClient.get<Array<SystemUserApi.SystemUserFace>>(
    '/system/user/listAll',
    { params },
  );
};

export const createUser = async (
  data: Omit<SystemUserApi.SystemUserFace, 'userId'>,
) => {
  const newData = objectOmit(data, ['userId']);
  return requestClient.post('/system/user', newData);
};

export const updateUser = async (
  userId: string | number,
  data: Omit<SystemUserApi.SystemUserFace, 'userId'>,
) => {
  const newData = objectOmit(data, ['userId']);
  return requestClient.put(`/system/user/${userId}`, newData);
};
