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
    component: () => import('#/views/public/demo/index.vue'),
    meta: {
      ...META,
      title: $t('public.demo.title'),
    },
    name: 'publicDemo',
    path: '/public/demo',
  },
  {
    component: () => import('#/views/public/feedback/index.vue'),
    meta: {
      ...META,
      title: $t('public.feedback.title'),
    },
    name: 'publicFeedback',
    path: '/public/feedback',
  },
];

export default routes;
