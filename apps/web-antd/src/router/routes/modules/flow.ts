import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:workflow',
      order: 9996,
      title: $t('flow.title'),
    },
    name: 'Flow',
    path: '/flow',
    children: [
      {
        path: '/flow/demo',
        name: 'FlowDemo',
        meta: {
          icon: 'mdi:account-group',
          title: $t('flow.demo.title'),
        },
        component: () => import('#/views/flow/demo/index.vue'),
      },
      {
        path: '/flow/list',
        name: 'FlowList',
        meta: {
          icon: 'mdi:menu',
          title: $t('flow.list.title'),
        },
        component: () => import('#/views/flow/list/index.vue'),
      },
    ],
  },
];

export default routes;
