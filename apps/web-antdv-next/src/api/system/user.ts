import type { Recordable } from '@vben/types';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';
export namespace SystemUserApi {
  export interface SystemUserFace {
    [key: string]: any;
    userId: string;
    avatar?: null | string;
    username: string;
    realName: string;
    email?: null | string;
    signature?: null | string;
    leaderUserId?: null | string;
    leaderUserName?: null | string;
    desc: string;
    disabled: boolean;
    createDate: string;
    updateDate: string;
    status: 0 | 1;
  }

  /** 管理员重置密码参数 */
  export interface ResetUserPasswordParams {
    /** 新密码，至少 8 位且含字母、数字、特殊字符中的两类 */
    newPassword: string;
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

/**
 * 管理员重置用户密码；成功后目标用户全部会话失效，需使用新密码重新登录
 */
export const resetUserPasswordApi = async (
  userId: number | string,
  data: SystemUserApi.ResetUserPasswordParams,
) => {
  return requestClient.put(`/system/users/${userId}/password`, data);
};
