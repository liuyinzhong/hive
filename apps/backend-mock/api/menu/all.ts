import { eventHandler } from 'h3';
import { convertMenuToTree, MOCK_MENU_LIST_V2 } from '~/api/menu/menuJSON';
import { mockRoleData } from '~/api/system/role/list';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

/*
  获取用户所有菜单
 */
export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  /* 过滤出当前用户所拥有的角色 */
  const roleList = mockRoleData.filter((item) =>
    userinfo.roleIds.includes(item.id),
  );

  /* 合并所有角色关联的菜单id */
  const menuIds = new Set(roleList.flatMap((item) => item.permissions));

  /* 根据菜单id过滤出当前用户所拥有的菜单 */
  const menus = MOCK_MENU_LIST_V2.filter(
    (item) => menuIds.has(item.id) || item.menuVisibleWithForbidden,
  );

  return useResponseSuccess(convertMenuToTree(menus, false));
});
