import { requestClient } from '#/api/request';
import type { Recordable } from '@vben/types';
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
  return requestClient.post('/dev/versions', data);
}

async function getLastVersion(params: Object) {
  return requestClient.get<DevVersionApi.DevVersionFace>(
    '/dev/versions/getLastVersion',
    { params },
  );
}

export { getVersionsList, createVersion, getLastVersion };
