import type { RouteRecordRaw } from 'vue-router';
import { $t } from '#/locales';
/* 权限模式文档：https://doc.vben.pro/guide/in-depth/access.html#%E5%90%8E%E7%AB%AF%E8%AE%BF%E9%97%AE%E6%8E%A7%E5%88%B6 */
const routes: RouteRecordRaw[] = [
  {
    name: 'VbenAbout',
    path: '/vben-admin/about',
    component: () => import('#/views/_core/about/index.vue'),
    meta: {
      icon: 'lucide:copyright',
      title: $t('demos.vben.about'),
      order: 9999,
    },
  },
  {
    name: 'Profile',
    path: '/profile',
    component: () => import('#/views/_core/profile/index.vue'),
    meta: {
      icon: 'lucide:user',
      hideInMenu: true,
      title: $t('page.auth.profile'),
    },
  },
];

export default routes;
