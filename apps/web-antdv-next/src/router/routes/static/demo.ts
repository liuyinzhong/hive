import type { RouteRecordRaw } from 'vue-router';
const routes: RouteRecordRaw[] = [
  {
    name: 'demoIndex',
    path: '/demo/index',
    component: () => import('#/views/demo/index.vue'),
    meta: {
      title: '提示',
      hideInMenu: true,
    },
  },
];

export default routes;
