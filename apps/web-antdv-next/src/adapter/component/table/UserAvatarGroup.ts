import { h } from 'vue';

import UserAvatarGroup from '#/components/UserAvatarGroup/index.vue';
import UserAvatar from '#/components/UserAvatar/index.vue';

export default {
  renderTableDefault(renderOpts: any, params: any) {
    const { _column, row } = params;
    const { props = {} } = renderOpts || {};

    let userList = row?.userList;
    if (!userList) {
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
    } else {
      return h(UserAvatarGroup, {
        ...props,
        userList,
      });
    }
  },
};
