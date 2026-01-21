import { faker } from '@faker-js/faker';
import { eventHandler } from 'h3';
import { verifyAccessToken, compareVersion } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';
import { mockVersionData } from './list';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  let listData = structuredClone(mockVersionData);

  const { page = 1, pageSize = 20, projectId } = getQuery(event);

  if (projectId) {
    listData = listData.filter((item) => item.projectId === projectId);
  }

  listData.sort((a, b) => compareVersion(b.version, a.version));

  /* 全量响应 */
  return useResponseSuccess(listData[0]);
});
