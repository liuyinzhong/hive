import { eventHandler } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';
import { mockTaskData } from './list';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const { taskNum } = getQuery(event);
  return useResponseSuccess(
    mockTaskData.find((item) => item.taskNum == taskNum) || null,
  );
});
