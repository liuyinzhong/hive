import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:users-round',
      order: 1,
      title: $t('page.user.title'),
    },
    name: 'user',
    path: '/user',
    children: [
      {
        name: 'userList',
        path: '/user/list',
        component: () => import('#/views/user/user/list.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:user-pen',
          title: '人员管理',
        },
      },
    ],
  },
];

export default routes;
