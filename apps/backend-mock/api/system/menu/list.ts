import { eventHandler } from 'h3';
import { convertMenuToTree, MOCK_MENU_LIST_V2 } from '~/api/menu/menuJSON';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';
export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }
  const { hasButton } = getQuery(event);
  return useResponseSuccess(
    convertMenuToTree(
      MOCK_MENU_LIST_V2,
      Number(hasButton) === 1 ? true : false,
    ),
  );
});
