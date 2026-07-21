import type { RouteRecordRaw } from "vue-router";

import { $t } from "#/locales";

const routes: RouteRecordRaw[] = [
  {
    component: () => import("#/views/external/demo/index.vue"),
    meta: {
      hideInBreadcrumb: true,
      hideInMenu: true,
      hideInTab: true,
      externalPage: true,
      ignoreAccess: true,
      title: $t("page.externalDemo.title"),
    },
    name: "externalDemo",
    path: "/external/demo",
  },
];

export default routes;
