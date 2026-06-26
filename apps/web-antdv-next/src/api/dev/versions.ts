import type { Recordable } from '@vben/types';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';
export namespace DevVersionApi {
  export interface VersionStatisticsSummary {
    storyTotal: number;
    storyDone: number;
    taskTotal: number;
    taskDone: number;
    bugTotal: number;
    bugFixed: number;
  }

  export interface DistItem {
    name: string;
    value: number;
  }

  export interface TaskWorkload {
    categories: string[];
    planHours: number[];
    actualHours: number[];
  }

  export interface ProgressTrend {
    dates: string[];
    taskDone: number[];
    bugFixed: number[];
  }

  export interface VersionStatisticsFace {
    summary: VersionStatisticsSummary;
    progressTrend: ProgressTrend;
    // 人员维度
    personTaskDist: DistItem[];
    personStoryDist: DistItem[];
    personHoursDist: DistItem[];
    moduleDist: DistItem[];
    // 需求面板
    storyTypeDist: DistItem[];
    storySourceDist: DistItem[];
    storyStatusFunnel: DistItem[];
    // 任务面板
    taskTypeDist: DistItem[];
    taskWorkload: TaskWorkload;
    // Bug 面板
    bugTypeDist: DistItem[];
    bugLevelDist: DistItem[];
    bugSourceDist: DistItem[];
    bugFixerDist: DistItem[];
  }

  export interface DevVersionFace {
    [key: string]: any;
    versionId?: string;
    version?: string;
    versionType?: string;
    remark?: string;
    creatorId?: string;
    creatorName?: string;
    createDate?: string;
    updateDate?: string;
    startDate?: string;
    endDate?: string;
    projectId?: string;
    releaseStatus?: string;
    releaseDate?: string;
    changeLogRichText?: string;
    changeLog?: string;
  }
}

/**
 * 获取版本列表数据
 */
export const getVersionsListApi = async (params: Recordable<any>) => {
  return requestClient.get<Array<DevVersionApi.DevVersionFace>>(
    '/dev/versions',
    { params },
  );
};

/**
 * 获取版本详情数据
 */
export const getVersionDetailApi = async (versionId: string) => {
  return requestClient.get<DevVersionApi.DevVersionFace>(
    `/dev/versions/${versionId}`,
  );
};

/**
 * 创建版本
 */
export const createVersionApi = async (
  data: Omit<DevVersionApi.DevVersionFace, 'versionId'>,
) => {
  const newData = objectOmit(data, ['versionId']);
  return requestClient.post('/dev/versions', newData);
};

/**
 * 更新版本
 */
export const updateVersionApi = async (
  versionId: string,
  data: Omit<DevVersionApi.DevVersionFace, 'versionId'>,
) => {
  const newData = objectOmit(data, ['versionId']);
  return requestClient.put(`/dev/versions/${versionId}`, newData);
};

/**
 * 获取最新版本
 */
export const getLastVersionApi = async (params: object) => {
  return requestClient.get<DevVersionApi.DevVersionFace>(
    '/dev/versions/getLastVersion',
    { params },
  );
};

/**
 * 获取版本统计数据
 */
export const getVersionStatisticsApi = async (versionId: string) => {
  return requestClient.get<DevVersionApi.VersionStatisticsFace>(
    '/dev/versions/statistics',
    { params: { versionId } },
  );
};

/**
 * 删除版本
 */
export const deleteVersionApi = async (versionIds: string[]) => {
  return requestClient.delete(`/dev/versions`, { data: versionIds });
};

/**
 * 流转
 */
export const nextVersionApi = async (
  versionId: string,
  data: Omit<DevVersionApi.DevVersionFace, 'versionId'>,
) => {
  const newData = objectOmit(data, ['versionId']);
  return requestClient.put(`/dev/versions/${versionId}/next`, newData);
};
