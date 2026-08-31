import { h } from 'vue';

import UserAvatarComponent from '#/components/UserAvatar/index.vue';

import { get } from '@vben/utils';

/* 示例
{
  field: 'avatar',
  title: '真实姓名',
  sortable: true,
  sortBy: 'realName',
  cellRender: {
    name: 'UserAvatar',
    props: {
      avatarField: 'avatar', // 或者 'userinfo.avatar'
      nameField: 'realName', // 或者 'userinfo.realName'
    },
  },
}, 
*/

export default {
  renderTableDefault(renderOpts: any, params: any) {
    const { _column, row } = params;

    const avatar = get(row, renderOpts.props?.avatarField || 'avatar');
    const name = get(row, renderOpts.props?.nameField || 'realName');

    return h(UserAvatarComponent, { avatar, name });
  },
};
