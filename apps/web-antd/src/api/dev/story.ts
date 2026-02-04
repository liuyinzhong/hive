import { requestClient } from '#/api/request';
import type { Recordable } from '@vben/types';

interface userListFace {
  userId: string;
  realName: string;
  avatar?: string;
}

export namespace DevStoryApi {
  export interface DevStoryFace {
    [key: string]: any;
    storyId: string;
    pid: string;
    storyTitle: any;
    storyNum: number;
    creatorName?: string;
    creatorId?: string;
    storyRichText?: string;
    files?: string;
    storyType?: number;
    storyStatus?: number;
    storyLevel?: number;
    versionId?: string;
    moduleId?: string;
    source?: number;
    createDate?: string;
    updateDate?: string;
    userList?: userListFace[];
  }
}

async function getStoryList(params: Recordable<any>) {
  return requestClient.get<Array<DevStoryApi.DevStoryFace>>('/dev/story/list', {
    params,
  });
}

async function createStory(data: Omit<DevStoryApi.DevStoryFace, 'storyId'>) {
  return requestClient.post('/dev/story', data);
}

async function getStoryDetail(storyNum: number) {
  return requestClient.get<DevStoryApi.DevStoryFace>('/dev/story/get', {
    params: { storyNum },
  });
}

export { getStoryList, createStory, getStoryDetail };
