import { requestClient } from '#/api/request';
import type { Recordable } from '@vben/types';

interface userListFace {
  userId: string;
  realName: string;
  avatar?: string;
}

export namespace SystemStoryApi {
  export interface SystemStory {
    [key: string]: any;
    storyId: string;
    pid: string;
    storyTitle: any;
    storyNum?: string;
    creatorName?: string;
    creatorId?: string;
    storyRichText?: string;
    pmLink?: string;
    storyRemark?: string;
    files?: string;
    storyType?: string;
    storyStatus?: string;
    storyLevel?: string;
    versionId?: string;
    moduleId?: string;
    source?: string;
    createDate?: string;
    updateDate?: string;
    userList?: userListFace[];
  }
}

async function getStoryList(params: Recordable<any>) {
  return requestClient.get<Array<SystemStoryApi.SystemStory>>(
    '/dev/story/list',
    { params },
  );
}

async function createStory(data: Omit<SystemStoryApi.SystemStory, 'storyId'>) {
  return requestClient.post('/dev/story', data);
}

export { getStoryList, createStory };
