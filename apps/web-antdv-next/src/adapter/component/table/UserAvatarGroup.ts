import { h } from 'vue';

import UserAvatarGroup from '#/components/UserAvatarGroup/index.vue';
import { get } from '@vben/utils';

/* 示例
{
      width: 165,
      field: 'userList',
      showOverflow: true,
      title: $t('dev.story.storyUsers'),
      cellRender: {
        name: 'UserAvatarGroup',
      },
    },
*/

export default {
  renderTableDefault(renderOpts: any, params: any) {
    const { column, row } = params;
    const { props = {} } = renderOpts || {};

    const _userIdField = get(row, renderOpts.props?.userIdField || 'userId');
    const _nameField = get(row, renderOpts.props?.nameField || 'realName');
    const _avatarField = get(row, renderOpts.props?.avatarField || 'avatar');

    // 优先从列绑定的 field 取值,兼容未配置 field 时回退到 userList
    const field = column?.field || 'userList';
    let userList = row?.[field] || [];

    if (userList.length > 0) {
      userList = userList.map((item: any) => ({
        userId: item[_userIdField] || '',
        realName: item[_nameField] || '',
        avatar: item[_avatarField] || '',
      }));
      return h(UserAvatarGroup, {
        ...props,
        userList,
      });
    } else {
      userList = [
        {
          userId: row[_userIdField] || '',
          realName: row[_nameField] || '',
          avatar: row[_avatarField] || '',
        },
      ];
      return h(UserAvatarGroup, {
        ...props,
        userList,
      });
    }
  },
};
