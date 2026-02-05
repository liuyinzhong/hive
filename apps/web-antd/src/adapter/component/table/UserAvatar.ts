import { h } from 'vue';
import UserAvatar from '#/components/UserAvatar/index.vue';

export default {
  renderTableDefault(renderOpts: any, params: any) {
    const { column, row } = params;

    let avatar = row[renderOpts.props.avatarField];
    let name = row[renderOpts.props.nameField];

    return h(UserAvatar, { avatar, name });
  },
};
