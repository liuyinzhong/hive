import type { Recordable } from '@vben/types';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';

interface userListFace {
  userId: string;
  realName: string;
  avatar?: string;
}

export namespace DevStoryApi {
  export interface DevStoryFace {
    [key: string]: any;
    storyId: string;
    pid?: string;
    storyTitle?: any;
    storyNum?: any;
    creatorName?: string;
    creatorId?: string;
    storyRichText?: string;
    fileIds?: string[];
    fileList?: string[];
    storyType?: string;
    storyStatus?: string;
    storyLevel?: string;
    /** 关联版本id */
    versionId?: string;
    /** 关联版本名称 */
    version?: string;
    /** 关联模块id */
    moduleId?: string;
    /** 关联模块名称 */
    moduleTitle?: string;
    /** 关联项目id */
    projectId?: string;
    /** 关联项目名称 */
    projectTitle?: string;
    source?: string;
    createDate?: string;
    updateDate?: string;
    userList?: userListFace[] | string[];
    userIds?: string[];
  }
}

/**
 * 获取需求列表
 */
export const getStoryListApi = async (params: Recordable<any>) => {
  return requestClient.get<Array<DevStoryApi.DevStoryFace>>('/dev/storys', {
    params,
  });
};

/**
 * 创建需求
 */
export const createStoryApi = async (
  data: Omit<DevStoryApi.DevStoryFace, 'storyId'>,
) => {
  const newData = objectOmit(data, ['storyId']);
  return requestClient.post('/dev/storys', newData);
};

/**
 * 更新需求
 */
export const updateStoryApi = async (
  storyId: string,
  data: Omit<DevStoryApi.DevStoryFace, 'storyId'>,
) => {
  const newData = objectOmit(data, ['storyId']);
  return requestClient.put(`/dev/storys/${storyId}`, newData);
};

/**
 * 根据storyNum查询需求详情
 */
export const getStoryDetailApi = async (storyNum: number) => {
  return requestClient.get<DevStoryApi.DevStoryFace>(`/dev/storys/${storyNum}`);
};

/**
 * 删除需求
 */
export const deleteStoryApi = async (storyId: string[]) => {
  return requestClient.delete(`/dev/storys`, { data: storyId });
};

/**
 * 更新需求字段
 */
export const updateStoryFieldApi = async (
  storyId: string,
  data: Recordable<any>,
) => {
  const newData = objectOmit(data, ['storyId']);
  return requestClient.put(`/dev/storys/${storyId}/field`, newData);
};

/**
 * 流转
 */
export const nextStoryApi = async (storyId: string, data: Recordable<any>) => {
  const newData = objectOmit(data, ['storyId']);
  return requestClient.put(`/dev/storys/${storyId}/next`, newData);
};
