import { faker } from '@faker-js/faker';
import { eventHandler } from 'h3';
import { verifyAccessToken, compareVersion } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';
import { mockUserData } from './list';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  let listData = structuredClone(
    mockUserData.filter((item) => item.disabled === 0),
  );

  const { realName } = getQuery(event);

  if (realName) {
    listData = listData.filter((item) => item.realName.includes(realName));
  }

  /* 全量响应 */
  return useResponseSuccess(listData);
});
