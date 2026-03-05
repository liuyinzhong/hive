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
 */
async function getVersionsList(params: Recordable<any>) {
  return requestClient.get<Array<DevVersionApi.DevVersionFace>>(
    '/dev/versions/list',
    { params },
  );
}

async function createVersion(
  data: Omit<DevVersionApi.DevVersionFace, 'versionId'>,
) {
  const newData = objectOmit(data, ['versionId']);
  return requestClient.post('/dev/versions', newData);
}

/**
 * 更新版本
 *
 * @param id 版本 ID
 * @param data 版本 数据
 */
async function updateVersion(
  id: string,
  data: Omit<DevVersionApi.DevVersionFace, 'versionId'>,
) {
  const newData = objectOmit(data, ['versionId']);
  return requestClient.put(`/dev/versions/${id}`, newData);
}

async function getLastVersion(params: Object) {
  return requestClient.get<DevVersionApi.DevVersionFace>(
    '/dev/versions/getLastVersion',
    { params },
  );
}

export { getVersionsList, createVersion, updateVersion, getLastVersion };
