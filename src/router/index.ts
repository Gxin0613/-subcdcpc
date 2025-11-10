import type { RouteRecordRaw } from 'vue-router';
import type { App } from 'vue';

import { createRouter, createWebHashHistory } from 'vue-router';
import { basicRoutes } from './routes';
import { THIRDPART_SYSTEM_ROUTES } from './routes/modules/SinglePages';
import { PAGE_NOT_FOUND_ROUTE, REDIRECT_ROUTE } from './routes/basic';
import { getAppEnvConfig } from '/@/utils/env';

// 白名单应该包含基本静态路由
const WHITE_NAME_LIST: string[] = ['/WF/Comm/EnPort'];
const getRouteNames = (array: any[]) =>
  array.forEach((item) => {
    WHITE_NAME_LIST.push(item.name);
    getRouteNames(item.children || []);
  });
getRouteNames(basicRoutes);

const getBasicRoutes = () => {
  const { VITE_GLOB_IS_THIRDPART_SYSTEM } = getAppEnvConfig();
  if (VITE_GLOB_IS_THIRDPART_SYSTEM) {
    return [...basicRoutes, ...THIRDPART_SYSTEM_ROUTES, REDIRECT_ROUTE, PAGE_NOT_FOUND_ROUTE];
  }
  return basicRoutes;
};

// app router
export const router = createRouter({
  history: createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH),
  routes: getBasicRoutes() as unknown as RouteRecordRaw[],
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// reset router
export function resetRouter() {
  router.getRoutes().forEach((route) => {
    const { name } = route;
    if (name && !WHITE_NAME_LIST.includes(name as string)) {
      router.hasRoute(name) && router.removeRoute(name);
    }
  });
}

// config router
export function setupRouter(app: App<Element>) {
  app.use(router);
}
