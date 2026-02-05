import { requestClient } from '#/api/request';
import type { Recordable } from '@vben/types';
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
    bugStatus?: number;
    /** bug级别 */
    bugLevel?: number;
    /** bug环境 */
    bugEnv?: number;
    /** bug来源 */
    bugSource?: number;
    /** bug类型 */
    bugType?: number;
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
    createDate?: string | Date;
    /** 修改时间 (在TS中通常使用字符串格式的时间，也可根据实际情况用Date) */
    updateDate?: string | Date;
  }
}

async function getBugList(params: Recordable<any>) {
  return requestClient.get<Array<DevBugApi.DevBugFace>>('/dev/bug/list', {
    params,
  });
}

async function createBug(data: Omit<DevBugApi.DevBugFace, 'bugId'>) {
  return requestClient.post('/dev/bug', data);
}

/* 根据storyId查询Bug */
async function bugListByStoryId(params: Recordable<any>) {
  return requestClient.get<Array<DevBugApi.DevBugFace>>(
    '/dev/bug/bugListByStoryId',
    {
      params,
    },
  );
}

async function getBugDetail(bugNum: number) {
  return requestClient.get<DevBugApi.DevBugFace>('/dev/bug/get', {
    params: { bugNum },
  });
}

export { getBugList, createBug, bugListByStoryId, getBugDetail };
