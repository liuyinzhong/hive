import { eventHandler } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';
import { mockRoleData } from '~/api/system/role/list';
import { MOCK_MENU_LIST_V2, convertMenuToTree } from '~/api/menu/menuJSON';

/* 
  获取用户所有菜单
 */
export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  /* 过滤出用户角色对应的菜单 */
  let list = mockRoleData.filter((item) => userinfo.roleIds.includes(item.id));

  /* 合并所有角色的菜单id */
  let menuIds = list.map((item) => item.permissions).flat();

  /* 过滤出用户角色对应的菜单 */
  let menus = MOCK_MENU_LIST_V2.filter((item) => menuIds.includes(item.id));

  return useResponseSuccess(convertMenuToTree(menus));
});
