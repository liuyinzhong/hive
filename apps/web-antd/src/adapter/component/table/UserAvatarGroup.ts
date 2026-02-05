import { h } from 'vue';
import UserAvatarGroup from '#/components/UserAvatarGroup/index.vue';

export default {
  renderTableDefault(renderOpts: any, params: any) {
    const { column, row } = params;
    const { props = {} } = renderOpts || {};
    const userList = row?.userList || [];
    return h(UserAvatarGroup, {
      ...props,
      userList,
    });
  },
};
