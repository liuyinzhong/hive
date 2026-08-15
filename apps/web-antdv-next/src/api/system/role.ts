import { requestClient } from '#/api/request';

export namespace SystemRoleApi {
  export type DataScope =
    | 'all'
    | 'customDepartment'
    | 'department'
    | 'departmentAndChildren'
    | 'none'
    | 'self';

  export interface SystemRoleFace {
    createDate?: string;
    dataScope: DataScope;
    dataScopeDeptIds?: string[];
    permissions?: string[];
    remark?: string;
    roleId: string;
    roleTitle: string;
    status: 0 | 1;
  }

  export interface RoleListParams {
    endDate?: string;
    page?: number;
    pageSize?: number;
    remark?: string;
    roleTitle?: string;
    sorts?: string;
    startDate?: string;
    status?: 0 | 1;
  }

  export interface RoleListResult {
    items: SystemRoleFace[];
    total: number;
  }

  export type SaveRoleRequest = Omit<SystemRoleFace, 'createDate' | 'roleId'>;
}

/**
 * 获取角色列表数据
 */
export const getRoleListApi = async (params: SystemRoleApi.RoleListParams) => {
  return requestClient.get<SystemRoleApi.RoleListResult>('/system/roles', {
    params,
  });
};

/**
 * 创建角色
 * @param data 角色数据
 */
export const createRoleApi = async (data: SystemRoleApi.SaveRoleRequest) => {
  return requestClient.post('/system/roles', data);
};

/**
 * 更新角色
 *
 * @param data 角色数据
 */
export const updateRoleApi = async (
  roleId: string,
  data: SystemRoleApi.SaveRoleRequest,
) => {
  return requestClient.put(`/system/roles/${roleId}`, data);
};

/**
 * 删除角色
 */
export const deleteRoleApi = async (roleIds: string[]) => {
  return requestClient.delete('/system/roles', {
    data: roleIds,
  });
};

/**
 * 切换角色状态
 */
export const updateRoleStatusApi = async (
  roleId: string,
  data: Pick<SystemRoleApi.SystemRoleFace, 'status'>,
) => {
  return requestClient.put(`/system/roles/${roleId}/status`, data);
};

/**
 * 获取所有启用的角色列表
 */
export const getAllRoleListApi = async () => {
  return requestClient.get<Array<SystemRoleApi.SystemRoleFace>>(
    '/system/roles/all',
  );
};

/**
 * 获取角色详情
 */
export const getRoleDetailApi = async (roleId: string) => {
  return requestClient.get<SystemRoleApi.SystemRoleFace>(
    `/system/roles/${roleId}`,
  );
};
