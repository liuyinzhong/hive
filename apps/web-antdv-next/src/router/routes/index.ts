import type { RouteRecordRaw } from "vue-router";

import { mergeRouteModules, traverseTreeValues } from "@vben/utils";

/** 基本路由 */
import { coreRoutes, fallbackNotFoundRoute } from "./core";

/** 动态路由本地文件。根据登录用户，在运行期间动态筛选和注册 */
const dynamicRouteFiles = import.meta.glob("./modules/**/*.ts", {
  eager: true,
});
const dynamicRoutes: RouteRecordRaw[] = mergeRouteModules(dynamicRouteFiles);

/**
 * 外部页面路由文件。它们会在应用启动时直接注册，不参与登录后的 generateAccess；
 * 是否允许匿名访问仍由全局路由守卫和 meta.ignoreAccess 决定。
 */
const externalRouteFiles = import.meta.glob("./public/**/*.ts", {
  eager: true,
});
const externalRoutes: RouteRecordRaw[] = mergeRouteModules(externalRouteFiles);

interface ExternalRouteCandidate {
  name: string;
  path: string;
  title: string;
}

const externalRouteCandidates = (() => {
  const candidates: ExternalRouteCandidate[] = [];
  const visit = (route: RouteRecordRaw) => {
    if (
      route.meta?.externalPage === true &&
      typeof route.name === "string" &&
      route.path.startsWith("/public/") &&
      !route.path.includes(":")
    ) {
      candidates.push({
        name: route.name,
        path: route.path,
        title: String(route.meta.title ?? route.name),
      });
    }
    route.children?.forEach((child) => visit(child));
  };
  externalRoutes.forEach((route) => visit(route));
  return candidates;
})();

function findExternalRouteCandidate(name: string) {
  return externalRouteCandidates.find((route) => route.name === name);
}

/** 静态路由本地文件。所有登录用户共有，不配置 authority */
const staticRouteFiles = import.meta.glob("./static/**/*.ts", { eager: true });
const staticRoutes: RouteRecordRaw[] = mergeRouteModules(staticRouteFiles);

/**
 * 应用启动时直接注册到 Vue Router 的初始路由。
 *
 * - coreRoutes：根路由、登录等框架基础路由；
 * - externalRoutes：不依赖登录后权限路由生成的独立外部页面；
 * - fallbackNotFoundRoute：匹配不到其他路由时使用的全局 404。
 *
 * 这些路由不参与登录后的 generateAccess 权限路由生成，但仍会经过全局路由守卫。
 * 是否允许匿名访问由守卫和 meta.ignoreAccess 决定；它们也不会因此自动显示在菜单中。
 */
const routes: RouteRecordRaw[] = [...coreRoutes, ...externalRoutes, fallbackNotFoundRoute];

/**
 * 提取 coreRoutes 及其子路由的 name，供全局守卫识别框架基础路由。
 * 命中这些名称的路由不进入登录后的业务权限路由生成流程。
 */
const coreRouteNames = traverseTreeValues(coreRoutes, (route) => route.name);

/**
 * 登录后参与 generateAccess 的前端路由候选列表。
 *
 * - dynamicRoutes：modules 目录中的前端权限路由，可通过 meta.authority 按角色过滤；
 * - staticRoutes：前端固定路由；不配置 authority 时可作为所有登录用户共有的页面。
 *
 * mixed 模式下还会与 /auth/menus 返回的后端路由按 name 合并，最终生成
 * accessibleRoutes，并由 accessibleRoutes 生成当前用户的 accessibleMenus。
 */
const accessRoutes = [...dynamicRoutes, ...staticRoutes];

/** 所有页面的路径。根据这些路径可以快速生成菜单 */
const componentKeys: string[] = Object.keys(import.meta.glob("../../views/**/*.vue"))
  .filter((item) => !item.includes("/modules/"))
  .map((v) => {
    const path = v.replace("../../views/", "/");
    return path.endsWith(".vue") ? path.slice(0, -4) : path;
  });

export {
  accessRoutes,
  componentKeys,
  coreRouteNames,
  externalRouteCandidates,
  externalRoutes,
  findExternalRouteCandidate,
  routes,
};
