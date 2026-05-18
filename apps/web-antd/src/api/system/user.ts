import type { Recordable } from '@vben/types';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';
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
    createDate: string;
    updateDate: string;
  }
}

/**
 * 获取用户列表数据
 */
export const getUsersListApi = async (params: Recordable<any>) => {
  return requestClient.get<Array<SystemUserApi.SystemUserFace>>(
    '/system/users',
    {
      params,
    },
  );
};

export const getUserListAllApi = async (params?: Recordable<any>) => {
  return requestClient.get<Array<SystemUserApi.SystemUserFace>>(
    '/system/users/all',
    { params },
  );
};

export const createUserApi = async (
  data: Omit<SystemUserApi.SystemUserFace, 'userId'>,
) => {
  const newData = objectOmit(data, ['userId']);
  return requestClient.post('/system/users', newData);
};

export const updateUserApi = async (
  userId: number | string,
  data: Omit<SystemUserApi.SystemUserFace, 'userId'>,
) => {
  const newData = objectOmit(data, ['userId']);
  return requestClient.put(`/system/users/${userId}`, newData);
};

/**
 * 删除用户
 */
export const deleteUserApi = async (userIds: string[]) => {
  return requestClient.delete('/system/users', {
    data: userIds,
  });
};

/**
 * 更新用户状态
 */
export const updateUserStatusApi = async (
  userId: number | string,
  data: Omit<SystemUserApi.SystemUserFace, 'userId'>,
) => {
  return requestClient.put(`/system/users/${userId}/status`, data);
};
