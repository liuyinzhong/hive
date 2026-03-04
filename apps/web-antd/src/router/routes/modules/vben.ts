import type { RouteRecordRaw } from 'vue-router';

/* 所有的路由都是在后台创建 */
/* 当前所选后台权限模式 */
/* 权限模式文档：https://doc.vben.pro/guide/in-depth/access.html#%E5%90%8E%E7%AB%AF%E8%AE%BF%E9%97%AE%E6%8E%A7%E5%88%B6 */
const routes: RouteRecordRaw[] = [
  /* {
    name: 'VbenAbout',
    path: '/vben-admin/about',
    component: () => import('#/views/_core/about/index.vue'),
    meta: {
      icon: 'lucide:copyright',
      title: $t('demos.vben.about'),
      order: 9999,
    },
  }, */
];

export default routes;
