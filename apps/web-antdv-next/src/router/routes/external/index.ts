import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const META = {
  hideInBreadcrumb: true,
  hideInMenu: true,
  hideInTab: true,
  externalPage: true,
  ignoreAccess: true,
};

const routes: RouteRecordRaw[] = [
  {
    component: () => import('#/views/external/demo/index.vue'),
    meta: {
      ...META,
      title: $t('external.demo.title'),
    },
    name: 'externalDemo',
    path: '/external/demo',
  },
  {
    component: () => import('#/views/external/feedback/index.vue'),
    meta: {
      ...META,
      title: $t('external.feedback.title'),
    },
    name: 'externalFeedback',
    path: '/external/feedback',
  },
];

export default routes;
