import { h } from 'vue';

import UserAvatarGroup from '#/components/UserAvatarGroup/index.vue';
import UserAvatar from '#/components/UserAvatar/index.vue';

export default {
  renderTableDefault(renderOpts: any, params: any) {
    const { column, row } = params;
    const { props = {} } = renderOpts || {};

    // 优先从列绑定的 field 取值,兼容未配置 field 时回退到 userList
    const field = column?.field || 'userList';
    let userList = row?.[field];
    if (userList) {
      return h(UserAvatarGroup, {
        ...props,
        userList,
      });
    } else {
      userList = [
        {
          userId: row?.userId || '',
          realName: row?.realName || '',
          avatar: row?.avatar || '',
        },
      ];
      return h(UserAvatar, {
        ...props,
        avatar: userList[0].avatar,
        name: userList[0].realName,
      });
    }
  },
};
