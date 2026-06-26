import type { Recordable } from '@vben/types';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';
export namespace DevBugApi {
  export interface DevBugFace {
    [key: string]: any;
    /** bugID,UUID格式 */
    bugId?: string;
    /** bug名称 */
    bugTitle?: string;
    /** bug编号 */
    bugNum?: number;
    /** bug描述,富文本格式 */
    bugRichText?: string;
    /** bug状态 */
    bugStatus?: string;
    /** bug级别 */
    bugLevel?: string;
    /** bug环境 */
    bugEnv?: string;
    /** bug来源 */
    bugSource?: string;
    /** bug类型 */
    bugType?: string;
    /** 浏览器信息 navigator.userAgent */
    bugUa?: string;
    /** 修复人id */
    userId?: string;
    /** 修复人姓名 */
    realName?: string;
    /** 修复人头像 */
    avatar?: string;
    /** 创建人姓名 */
    creatorName?: string;
    /** 创建人id */
    creatorId?: string;
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
    /** 关联需求id */
    storyId?: string;
    /** 关联需求名称 */
    storyTitle?: string;
    /** 创建时间 (在TS中通常使用字符串格式的时间，也可根据实际情况用Date) */
    createDate?: Date | string;
    /** 修改时间 (在TS中通常使用字符串格式的时间，也可根据实际情况用Date) */
    updateDate?: Date | string;
  }
}

/**
 * 获取Bug列表
 */
export const getBugListApi = async (params: Recordable<any>) => {
  return requestClient.get<{
    items: Array<DevBugApi.DevBugFace>;
    total: number;
  }>('/dev/bugs', {
    params,
    paramsSerializer: 'comma',
  });
};

/**
 * 创建Bug
 */
export const createBugApi = async (
  data: Omit<DevBugApi.DevBugFace, 'bugId'>,
) => {
  const newData = objectOmit(data, ['bugId']);
  return requestClient.post('/dev/bugs', newData);
};

/**
 * 更新Bug
 */
export const updateBugApi = async (
  bugId: string,
  data: Omit<DevBugApi.DevBugFace, 'bugId'>,
) => {
  const newData = objectOmit(data, ['bugId']);
  return requestClient.put(`/dev/bugs/${bugId}`, newData);
};

/**
 * 获取Bug详情
 */
export const getBugDetailApi = async (bugNum: number) => {
  return requestClient.get<DevBugApi.DevBugFace>(`/dev/bugs/${bugNum}`);
};

/**
 * 删除Bug
 */
export const deleteBugApi = async (bugIds: string[]) => {
  return requestClient.delete(`/dev/bugs`, { data: bugIds });
};

/**
 * 流转Bug
 */
export const nextBugApi = async (bugId: string, data: Recordable<any>) => {
  const newData = objectOmit(data, ['bugId']);
  return requestClient.put(`/dev/bugs/${bugId}/next`, newData);
};

/**
 * 更新字段
 */
export const updateBugFieldApi = async (
  bugId: string,
  data: Recordable<any>,
) => {
  const newData = objectOmit(data, ['bugId']);
  return requestClient.put(`/dev/bugs/${bugId}/field`, newData);
};

/**
 * 确认Bug
 */
export const confirmBugApi = async (bugId: string, data: Recordable<any>) => {
  const newData = objectOmit(data, ['bugId']);
  return requestClient.put(`/dev/bugs/${bugId}/confirm`, newData);
};
