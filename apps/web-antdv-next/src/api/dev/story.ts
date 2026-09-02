import type { Recordable } from '@vben/types';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';

interface userListFace {
  userId: string;
  realName?: string;
  avatar?: string;
  /** 负责的需求状态(需求推进至该状态时指定),字典STORY_STATUS值 */
  storyStatus?: string;
}

export namespace DevStoryApi {
  /**
   * 需求附件文件
   */
  export interface DevStoryFileFace {
    fileId: string;
    url: string;
    name: string;
    type: string;
    size: number;
    fileExt: string;
    originalName: string;
    path: string;
    fullPath: string;
    thumbnailPath?: string;
    thumbnailUrl?: string;
    creatorId?: string;
    creatorName?: string;
    createDate?: string;
  }

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
    fileList?: DevStoryFileFace[];
    storyType?: string;
    storyStatus?: string;
    /** 当前状态负责人(参与人中story_status等于需求当前状态的用户,由流转时指定),无负责人时为undefined */
    thisUser?: userListFace;
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
    userList?: userListFace[];
    /** 关联流程实例编号,未绑定流程时为 undefined */
    workflowInstanceNo?: string;
    /** 关联流程实例ID,未绑定流程时为 undefined */
    workflowInstanceId?: string;
    /** 关联流程实例状态:0运行中 1已完成 2已拒绝 3已取消,未绑定为 undefined */
    workflowStatus?: string;
  }
}

/**
 * 获取需求列表
 */
export const getStoryListApi = async (params: Recordable<any>) => {
  return requestClient.get<{
    items: Array<DevStoryApi.DevStoryFace>;
    total: number;
  }>('/dev/storys', {
    params,
    paramsSerializer: 'comma',
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
 * 批量创建需求
 */
export const createStorysApi = async (
  data: Omit<DevStoryApi.DevStoryFace, 'storyId'>[],
) => {
  return requestClient.post('/dev/storys/batch', data);
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
 * 查询需求当前绑定的流程实例摘要,未绑定时返回 null
 */
export const getStoryWorkflowBindingApi = async (storyNum: number) => {
  return requestClient.get(`/dev/storys/${storyNum}/workflow`);
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

/**
 * 批量流转
 */
export const batchNextStoryApi = async (data: Recordable<any>) => {
  return requestClient.put('/dev/storys/batch-next', data);
};
