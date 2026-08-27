import { requestClient } from '#/api/request';
import type { SystemMenuApi, SystemUserApi } from '../system';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }

  /** 更新用户资料接口参数 */
  export interface UpdateProfileParams {
    /** 头像URL；null 表示不修改，空字符串表示清空 */
    avatar?: null | string;
    /** 邮箱；null 表示不修改，空字符串表示清空 */
    email?: null | string;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/auth/login', data, {
    withCredentials: true,
  });
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return requestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', null, {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return requestClient.post('/auth/logout', null, {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/auth/codes');
}

/**
 * 获取用户信息
 */
export async function getProfileApi() {
  return requestClient.get<SystemUserApi.SystemUserFace>('/auth/profile');
}

/**
 * 更新当前用户资料（头像、邮箱），返回更新后的用户信息
 */
export async function updateProfileApi(data: AuthApi.UpdateProfileParams) {
  return requestClient.put<SystemUserApi.SystemUserFace>(
    '/auth/profile',
    data,
  );
}

/**
 * 获取当前登录用户菜单
 */
export async function getMyMenusApi() {
  return requestClient.get<Array<SystemMenuApi.SystemMenuFace>>('/auth/menus');
}
