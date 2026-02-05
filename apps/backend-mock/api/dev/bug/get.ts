import { eventHandler } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';
import { mockBugData } from './list';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const { bugNum } = getQuery(event);
  return useResponseSuccess(
    mockBugData.find((item) => item.bugNum == bugNum) || null,
  );
});
