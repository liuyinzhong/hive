import type { Recordable } from '@vben/types';

import type { SystemMenuApi } from './menu';
import type { SystemRoleApi } from './role';

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

  /** 权限明细树节点：按菜单树层级嵌套（目录→页面→按钮），目录作为层级节点保留其下被授权的后代 */
  export interface UserPermissionItem {
    /** 下级授权节点 */
    children?: null | UserPermissionItem[];
    /** 原子权限码，仅按钮节点 */
    authCode?: null | string;
    /** 菜单节点ID */
    menuId: string;
    /** 路由路径，目录和按钮节点为空 */
    path?: null | string;
    /** 菜单状态 0=停用 1=启用 */
    status: 0 | 1;
    /** 菜单标题国际化key */
    title: string;
    /** 菜单类型 catalog=目录 menu=页面 embedded=内嵌页 link=链接 button=按钮 */
    type: 'button' | 'catalog' | 'embedded' | 'link' | 'menu';
  }

  /** 用户权限明细中的角色分组 */
  export interface UserPermissionRole {
    /** 数据范围 */
    dataScope: SystemRoleApi.DataScope;
    /** 角色被授权的菜单节点总数 */
    permissionCount: number;
    /** 权限明细树 */
    permissions: UserPermissionItem[];
    /** 备注 */
    remark?: null | string;
    /** 角色ID */
    roleId: string;
    /** 角色名称 */
    roleTitle: string;
    /** 角色状态 0=停用 1=启用 */
    status: 0 | 1;
  }

  /** 用户权限明细：一次返回该用户全部关联角色及各自菜单授权明细 */
  export interface UserPermissionResult {
    personal?: null | UserPermissionPersonal;
    realName: string;
    roles: UserPermissionRole[];
    userId: string;
  }

  /** 用户权限明细中的个人权限分组：额外授权树与禁止树 */
  export interface UserPermissionPersonal {
    deny: UserPermissionItem[];
    denyCount: number;
    grant: UserPermissionItem[];
    grantCount: number;
  }

  /** 用户个人权限：额外授权与禁止两个菜单ID集合，附带可勾选的启用菜单树 */
  export interface UserPersonalPermissionResult {
    denyMenuIds: string[];
    grantMenuIds: string[];
    menuTree: null | SystemMenuApi.SystemMenuFace[];
    realName: string;
    userId: string;
  }

  /** 保存用户个人权限参数：两个集合均按提交内容完整替换 */
  export interface SaveUserPersonalPermissionParams {
    denyMenuIds: string[];
    grantMenuIds: string[];
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

/**
 * 获取用户权限明细：一次返回该用户全部关联角色及各自菜单授权明细
 */
export const getUserPermissionsApi = async (userId: string) => {
  return requestClient.get<SystemUserApi.UserPermissionResult>(
    `/system/users/${userId}/permissions`,
  );
};

/**
 * 获取用户个人权限：额外授权与禁止两个菜单ID集合
 */
export const getUserPersonalPermissionsApi = async (userId: string) => {
  return requestClient.get<SystemUserApi.UserPersonalPermissionResult>(
    `/system/users/${userId}/personalPermissions`,
  );
};

/**
 * 保存用户个人权限：两个集合均按提交内容完整替换
 */
export const saveUserPersonalPermissionsApi = async (
  userId: string,
  data: SystemUserApi.SaveUserPersonalPermissionParams,
) => {
  return requestClient.put(`/system/users/${userId}/personalPermissions`, data);
};
