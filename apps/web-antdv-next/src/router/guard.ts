import type { Router } from "vue-router";

import { LOGIN_PATH } from "@vben/constants";
import { preferences } from "@vben/preferences";
import { useAccessStore, useUserStore } from "@vben/stores";
import { startProgress, stopProgress } from "@vben/utils";

import { accessRoutes, coreRouteNames, findExternalRouteCandidate } from "#/router/routes";
import { getPublicExternalPageApi } from "#/api/system";
import { useAuthStore } from "#/store";

import { generateAccess } from "./access";

/**
 * 通用守卫配置
 * @param router
 */
function setupCommonGuard(router: Router) {
  // 记录已经加载的页面
  const loadedPaths = new Set<string>();

  router.beforeEach((to) => {
    to.meta.loaded = loadedPaths.has(to.path);

    // 页面加载进度条
    if (!to.meta.loaded && preferences.transition.progress) {
      startProgress();
    }
    return true;
  });

  router.afterEach((to) => {
    // 记录页面是否加载,如果已经加载，后续的页面切换动画等效果不在重复执行

    loadedPaths.add(to.path);

    // 关闭页面加载进度条
    if (preferences.transition.progress) {
      stopProgress();
    }
  });
}

/**
 * 权限访问守卫配置
 * @param router
 */
function setupAccessGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const accessStore = useAccessStore();
    const userStore = useUserStore();
    const authStore = useAuthStore();

    // 基本路由，这些路由不需要进入权限拦截
    if (coreRouteNames.includes(to.name as string)) {
      if (to.path === LOGIN_PATH && accessStore.accessToken) {
        return decodeURIComponent(
          (to.query?.redirect as string) ||
            userStore.userInfo?.homePath ||
            preferences.app.defaultHomePath,
        );
      }
      return true;
    }

    if (to.meta.ignoreAccess) {
      return true;
    }

    // accessToken 检查
    if (!accessStore.accessToken) {
      // 没有访问权限，跳转登录页面
      if (to.fullPath !== LOGIN_PATH) {
        return {
          path: LOGIN_PATH,
          // 如不需要，直接删除 query
          query:
            to.fullPath === preferences.app.defaultHomePath
              ? {}
              : { redirect: encodeURIComponent(to.fullPath) },
          // 携带当前跳转的页面，登录后重新跳转该页面
          replace: true,
        };
      }
      return to;
    }

    // 是否已经生成过动态路由
    if (accessStore.isAccessChecked) {
      return true;
    }

    // 生成路由表
    // 当前登录用户拥有的角色标识列表
    const userInfo = userStore.userInfo || (await authStore.fetchUserInfo());
    const userRoles = userInfo.roles ?? [];

    // 生成菜单和路由
    const { accessibleMenus, accessibleRoutes } = await generateAccess({
      roles: userRoles,
      router,
      // 则会在菜单中显示，但是访问会被重定向到403
      routes: accessRoutes,
    });

    // 保存菜单信息和路由信息
    accessStore.setAccessMenus(accessibleMenus);
    accessStore.setAccessRoutes(accessibleRoutes);
    accessStore.setIsAccessChecked(true);
    const redirectPath = (from.query.redirect ??
      (to.path === preferences.app.defaultHomePath
        ? userInfo.homePath || preferences.app.defaultHomePath
        : to.fullPath)) as string;

    return {
      ...router.resolve(decodeURIComponent(redirectPath)),
      replace: true,
    };
  });
}

/** 外部页面必须同时存在于静态路由和启用的数据库记录中。 */
function setupExternalPageGuard(router: Router) {
  router.beforeEach(async (to) => {
    if (!to.meta.externalPage) {
      return true;
    }
    if (typeof to.name !== "string") {
      return { name: "FallbackNotFound", replace: true };
    }
    const candidate = findExternalRouteCandidate(to.name);
    if (!candidate || candidate.path !== to.path) {
      return { name: "FallbackNotFound", replace: true };
    }
    try {
      const registered = await getPublicExternalPageApi(to.name);
      if (registered.name !== candidate.name || registered.path !== candidate.path) {
        return { name: "FallbackNotFound", replace: true };
      }
      return true;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return { name: "FallbackNotFound", replace: true };
      }
      return false;
    }
  });
}

/**
 * 项目守卫配置
 * @param router
 */
function createRouterGuard(router: Router) {
  /** 通用 */
  setupCommonGuard(router);
  /** 外部页面启用状态 */
  setupExternalPageGuard(router);
  /** 权限访问 */
  setupAccessGuard(router);
}

export { createRouterGuard };
