import { baseRequestClient, requestClient } from '#/api/request';

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
}

/**
 * 登录
 */
export const loginApi = async (data: AuthApi.LoginParams) => {
  return requestClient.post<AuthApi.LoginResult>('/auth/login', data);
};

/**
 * 刷新accessToken
 */
export const refreshTokenApi = async () => {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
};

/**
 * 退出登录
 */
export const logoutApi = async () => {
  return baseRequestClient.post('/auth/logout', {
    withCredentials: true,
  });
};

/**
 * 获取用户权限码
 */
export const getAccessCodesApi = async () => {
  return requestClient.get<string[]>('/auth/codes');
};
