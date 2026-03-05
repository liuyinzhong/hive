import { eventHandler } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';
import { MOCK_MENU_LIST_V2, convertMenuToTree } from '~/api/menu/menuJSON';
export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  return useResponseSuccess(convertMenuToTree(MOCK_MENU_LIST_V2, true));
});
