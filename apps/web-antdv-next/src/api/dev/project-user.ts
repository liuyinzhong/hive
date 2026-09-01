import { requestClient } from '#/api/request';

export namespace DevProjectUserApi {
  /** 项目用户响应 */
  export interface ProjectUserFace {
    /** 用户ID */
    userId: string;
    /** 真实姓名 */
    realName: string;
    /** 头像 */
    avatar?: string;
  }

  /** 项目用户单项(保存用) */
  export interface ProjectUserItemFace {
    /** 用户ID */
    userId: string;
  }

  /** 项目用户全量保存请求 */
  export interface SaveProjectUserFace {
    /** 项目ID */
    projectId: string;
    /** 用户列表 */
    users: ProjectUserItemFace[];
  }
}

/**
 * 获取项目用户列表
 * @param projectId 项目ID
 */
export const getProjectUsersApi = async (projectId: string) => {
  if (!projectId) {
    return [];
  }
  return requestClient.get<Array<DevProjectUserApi.ProjectUserFace>>(
    '/dev/project-users',
    { params: { projectId } },
  );
};

/**
 * 全量保存项目用户
 * @param data 项目用户信息
 */
export const saveProjectUsersApi = async (
  data: DevProjectUserApi.SaveProjectUserFace,
) => {
  return requestClient.put('/dev/project-users', data);
};
