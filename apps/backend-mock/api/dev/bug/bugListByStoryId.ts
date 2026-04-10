import { eventHandler } from 'h3';
import { mockBugData } from '~/api/dev/bug/list';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  let listData = structuredClone(mockBugData);

  const { storyId } = getQuery(event);

  if (storyId) {
    listData = listData.filter((item) => item.storyId === storyId);
  }

  /* 全量响应 */
  return useResponseSuccess(listData);
});
