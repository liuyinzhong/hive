import { h } from 'vue';

import UserAvatar from '#/components/UserAvatar/index.vue';

export default {
  renderTableDefault(renderOpts: any, params: any) {
    const { column, row } = params;

    const avatar = row[renderOpts.props.avatarField];
    const name = row[renderOpts.props.nameField];

    return h(UserAvatar, { avatar, name });
  },
};
