import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemRoleApi {
  export interface SystemRoleFace {
    [key: string]: any;
    id: string;
    name: string;
    permissions: string[];
    remark?: string;
    status: 0 | 1;
  }
}

/**
 * 获取角色列表数据
 */
export const getRoleList = async (params: Recordable<any>) => {
  return requestClient.get<Array<SystemRoleApi.SystemRoleFace>>(
    '/system/role/list',
    { params },
  );
};

/**
 * 创建角色
 * @param data 角色数据
 */
export const createRole = async (
  data: Omit<SystemRoleApi.SystemRoleFace, 'id'>,
) => {
  return requestClient.post('/system/role', data);
};

/**
 * 更新角色
 *
 * @param id 角色 ID
 * @param data 角色数据
 */
export const updateRole = async (
  id: string,
  data: Omit<SystemRoleApi.SystemRoleFace, 'id'>,
) => {
  return requestClient.put(`/system/role/${id}`, data);
};

/**
 * 删除角色
 * @param id 角色 ID
 */
export const deleteRole = async (id: string) => {
  return requestClient.delete(`/system/role/${id}`);
};
