import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    /** 由 external 路由目录注册、并由 sys_menu 控制启停的外部页面。 */
    externalPage?: boolean;
  }
}

export {};
