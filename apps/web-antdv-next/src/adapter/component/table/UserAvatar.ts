import { h } from 'vue';

import UserAvatar from '#/components/UserAvatar/index.vue';

export default {
  renderTableDefault(renderOpts: any, params: any) {
    const { _column, row } = params;

    const avatar = row[renderOpts.props?.avatarField || 'avatar'];
    const name = row[renderOpts.props?.nameField || 'realName'];

    return h(UserAvatar, { avatar, name });
  },
};
