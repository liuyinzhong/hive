import { eventHandler } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

import { mockVersionData } from './list';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const { versionId } = getQuery(event);
  return useResponseSuccess(
    mockVersionData.find((item) => item.versionId === Number(versionId)) ||
      null,
  );
});
