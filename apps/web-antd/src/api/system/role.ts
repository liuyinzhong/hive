import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemRoleApi {
  export interface SystemRoleFace {
    [key: string]: any;
    roleId: string;
    roleTitle: string;
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
    '/system/roles',
    { params },
  );
};

/**
 * 创建角色
 * @param data 角色数据
 */
export const createRole = async (
  data: Omit<SystemRoleApi.SystemRoleFace, 'roleId'>,
) => {
  return requestClient.post('/system/roles', data);
};

/**
 * 更新角色
 *
 * @param data 角色数据
 */
export const updateRole = async (
  roleId: string,
  data: Omit<SystemRoleApi.SystemRoleFace, 'roleId'>,
) => {
  return requestClient.put(`/system/roles/${roleId}`, data);
};

/**
 * 删除角色
 */
export const deleteRole = async (roleIds: string[]) => {
  return requestClient.delete('/system/roles', {
    data: roleIds,
  });
};

/**
 * 切换角色状态
 */
export const updateRoleStatus = async (
  roleId: string,
  data: Omit<SystemRoleApi.SystemRoleFace, 'roleId'>,
) => {
  return requestClient.put(`/system/roles/${roleId}/status`, data);
};

/**
 * 获取所有启用的角色列表
 */
export const getAllRoleList = async () => {
  return requestClient.get<Array<SystemRoleApi.SystemRoleFace>>(
    '/system/roles/all',
  );
};
