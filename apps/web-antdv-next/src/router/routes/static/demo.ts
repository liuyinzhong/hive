import type { RouteRecordRaw } from 'vue-router';
const routes: RouteRecordRaw[] = [
  {
    name: 'productSkuMerge',
    path: '/demo/skuMerge',
    component: () => import('#/views/demo/product-sku-merge.vue'),
    meta: {
      title: 'SKU 合并',
      hideInMenu: true,
    },
  },
];

export default routes;
