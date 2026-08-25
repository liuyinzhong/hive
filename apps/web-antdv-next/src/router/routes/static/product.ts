import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'productSpuDetail',
    path: '/product/spu/detail/:spuId',
    component: () => import('#/views/product/spu/detail.vue'),
    meta: {
      activePath: '/product/spu/list',
      hideInMenu: true,
      maxNumOfOpenTab: 3,
      title: '产品详情',
    },
  },
];

export default routes;
