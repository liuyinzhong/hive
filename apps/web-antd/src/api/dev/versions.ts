import { requestClient } from '#/api/request';
import type { Recordable } from '@vben/types';
import { objectOmit } from '@vueuse/core';
export namespace DevVersionApi {
  export interface DevVersionFace {
    [key: string]: any;
    versionId: string;
    version: string;
    versionType: number;
    remark?: string;
    creatorId: string;
    creatorName: string;
    createDate: string;
    updateDate: string;
    startDate: string;
    endDate: string;
    projectId: string;
    releaseStatus: string;
    releaseDate: string;
    changeLogRichText: string;
    changeLog: string;
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
export const getLastVersion = async (params: Object) => {
  return requestClient.get<DevVersionApi.DevVersionFace>(
    '/dev/versions/getLastVersion',
    { params },
  );
};
