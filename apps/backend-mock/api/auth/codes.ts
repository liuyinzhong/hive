import { eventHandler } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';
import { mockRoleData } from '~/api/system/role/list';
import { MOCK_MENU_LIST_V2 } from '~/api/menu/menuJSON';
import { uniqueArray } from '~/utils/arrayExtendApi';

export default eventHandler((event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  /* 过滤出当前用户所拥有的角色 */
  let roleList = mockRoleData.filter((item) =>
    userinfo.roleIds.includes(item.id),
  );

  /* 合并所有角色关联的菜单id */
  let menuIds = roleList.map((item) => item.permissions).flat();

  /* 根据菜单id过滤出当前用户所拥有的菜单权限码 */
  let authCodes = MOCK_MENU_LIST_V2.filter((item) =>
    menuIds.includes(item.id),
  ).map((item) => item.authCode);

  return useResponseSuccess(uniqueArray(authCodes));
});
