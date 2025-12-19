import { requestClient } from '#/api/request';
import type { Recordable } from '@vben/types';
export namespace SystemVersionApi {
  export interface SystemVersion {
    [key: string]: any;
    versionId: string;
    version: string;
    versionType: any;
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
  return requestClient.get<Array<SystemVersionApi.SystemVersion>>(
    '/dev/versions/list',
    { params },
  );
}

async function createVersion(
  data: Omit<SystemVersionApi.SystemVersion, 'versionId'>,
) {
  return requestClient.post('/dev/versions', data);
}

async function getLastVersion(params: string) {
  return requestClient.get<SystemVersionApi.SystemVersion>(
    '/dev/versions/getLastVersion',
    { params },
  );
}

export { getVersionsList, createVersion, getLastVersion };
