import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户信息
 */
export const getUserInfoApi = async () => {
  return requestClient.get<UserInfo>('/user/info');
};
