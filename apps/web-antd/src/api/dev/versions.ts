import { requestClient } from '#/api/request';
import type { Recordable } from '@vben/types';
import { objectOmit } from '@vueuse/core';
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
    versionType?: number;
    remark?: string;
    creatorId?: string;
    creatorName?: string;
    createDate?: string;
    updateDate?: string;
    startDate?: string;
    endDate?: string;
    projectId?: string;
    releaseStatus?: number;
    releaseDate?: string;
    changeLogRichText?: string;
    changeLog?: string;
  }
}

/**
 * 获取版本列表数据
 *
 * @param params 查询参数
 */
export const getVersionsList = async (params: Recordable<any>) => {
  return requestClient.get<Array<DevVersionApi.DevVersionFace>>(
    '/dev/versions/list',
    { params },
  );
};

/**
 * 获取版本详情数据
 *
 * @param params 查询参数
 */
export const getVersionDetail = async (versionId: string) => {
  return requestClient.get<DevVersionApi.DevVersionFace>('/dev/versions/get', {
    params: { versionId },
  });
};

/**
 * 创建版本
 *
 * @param data 版本 数据
 */
export const createVersion = async (
  data: Omit<DevVersionApi.DevVersionFace, 'versionId'>,
) => {
  const newData = objectOmit(data, ['versionId']);
  return requestClient.post('/dev/versions', newData);
};

/**
 * 更新版本
 *
 * @param id 版本 ID
 * @param data 版本 数据
 */
export const updateVersion = async (
  id: string,
  data: Omit<DevVersionApi.DevVersionFace, 'versionId'>,
) => {
  const newData = objectOmit(data, ['versionId']);
  return requestClient.put(`/dev/versions/${id}`, newData);
};

/**
 * 获取最新版本
 *
 * @param params 查询参数
 */
export const getLastVersion = async (params: object) => {
  return requestClient.get<DevVersionApi.DevVersionFace>(
    '/dev/versions/getLastVersion',
    { params },
  );
};

/**
 * 获取版本统计数据
 *
 * @param versionId 版本 ID
 */
export const getVersionStatistics = async (versionId: string) => {
  return requestClient.get<DevVersionApi.VersionStatisticsFace>(
    '/dev/versions/statistics',
    { params: { versionId } },
  );
};
