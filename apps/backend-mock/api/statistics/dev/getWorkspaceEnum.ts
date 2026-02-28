import { eventHandler, getQuery } from 'h3';
import { useResponseSuccess } from '~/utils/response';
import { mockStoryData } from '~/api/dev/story/list';
import { mockTaskData } from '~/api/dev/task/list';
import { mockBugData } from '~/api/dev/bug/list';
import { mockVersionData } from '~/api/dev/versions/list';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  return useResponseSuccess({
    storyTotalNum: mockStoryData.length,
    storyNum: 0,
    taskTotalNum: mockTaskData.length,
    taskNum: 0,
    bugTotalNum: mockBugData.length,
    bugNum: 0,
    versionTotalNum: mockVersionData.length,
    versionNum: 0,
  });
});
