import type { AppRouteRecordRaw, Menu } from '/@/router/types';
import { defineStore } from 'pinia';
import { store } from '/@/store';
import { useI18n } from '/@/hooks/web/useI18n';
import { useUserStore } from './user';
import { useAppStoreWithOut } from './app';
import { toRaw } from 'vue';
import { flatMultiLevelRoutes, transformObjToRoute } from '/@/router/helper/routeHelper';
import { transformRouteToMenu } from '/@/router/helper/menuHelper';
import projectSetting from '/@/settings/projectSetting';
import { PermissionModeEnum } from '/@/enums/appEnum';
import { asyncRoutes } from '/@/router/routes';
import { ERROR_LOG_ROUTE, PAGE_NOT_FOUND_ROUTE } from '/@/router/routes/basic';
import { filter } from '/@/utils/helper/treeHelper';
import { useMessage } from '/@/hooks/web/useMessage';
import { PageEnum } from '/@/enums/pageEnum';
import { cloneDeep } from 'lodash-es';
import { EMPTY_MODULE_LAYOUT, getParentLayout, LAYOUT } from '/@/router/constant';
import { MenuModel } from '/@/CCFast/GPM/CCMenu/MenuModel';
import useComponentLoader from '/@/hooks/ens/useComponentLoader';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { getAppEnvConfig } from '/@/utils/env';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
import { getRequestParams } from '/@/utils/request/decode';
import WebUser from '/@/bp/web/WebUser';

const isHttpUrl = (str: string) => !!str && (str.startsWith('http://') || str.startsWith('https://'));
const isSelfUrl = (str: string) => !!str && str.startsWith('self://');
const isUrl = (str: string) => isHttpUrl(str) || isSelfUrl(str);

let configRoutes: AppRouteRecordRaw[] = [];

interface PermissionState {
  // Permission code list
  permCodeList: string[] | number[];
  // Whether the route has been dynamically added
  isDynamicAddedRoute: boolean;
  // To trigger a menu update
  lastBuildMenuTime: number;
  // Backstage menu list
  backMenuList: Menu[];
  frontMenuList: Menu[];
}

export const usePermissionStore = defineStore({
  id: 'app-permission',
  state: (): PermissionState => ({
    permCodeList: [],
    // Whether the route has been dynamically added
    isDynamicAddedRoute: false,
    // To trigger a menu update
    lastBuildMenuTime: 0,
    // Backstage menu list
    backMenuList: [],
    // menu List
    frontMenuList: [],
  }),
  getters: {
    getPermCodeList(): string[] | number[] {
      return this.permCodeList;
    },
    getBackMenuList(): Menu[] {
      return this.backMenuList;
    },
    getFrontMenuList(): Menu[] {
      return this.frontMenuList;
    },
    getLastBuildMenuTime(): number {
      return this.lastBuildMenuTime;
    },
    getIsDynamicAddedRoute(): boolean {
      return this.isDynamicAddedRoute;
    },
  },
  actions: {
    setPermCodeList(codeList: string[]) {
      this.permCodeList = codeList;
    },

    setBackMenuList(list: Menu[]) {
      this.backMenuList = list;
      list?.length > 0 && this.setLastBuildMenuTime();
    },

    setFrontMenuList(list: Menu[]) {
      this.frontMenuList = list;
    },

    setLastBuildMenuTime() {
      this.lastBuildMenuTime = new Date().getTime();
    },

    setDynamicAddedRoute(added: boolean) {
      this.isDynamicAddedRoute = added;
    },
    resetState(): void {
      this.isDynamicAddedRoute = false;
      this.permCodeList = [];
      this.backMenuList = [];
      this.lastBuildMenuTime = 0;
    },

    async buildCCFastRoutes() {
      const { VITE_GLOB_IS_THIRDPART_SYSTEM } = getAppEnvConfig();
      if (VITE_GLOB_IS_THIRDPART_SYSTEM) return;
      let authorizeMenus;
      if (CommonConfig.IsHN) {
        const appNo = localStorage.getItem('GJPT-AppNo');
        const ry_token = localStorage.getItem('ry-token');
        const handler = new HttpHandler('bp.App.Handler.AppHandler');
        handler.AddPara('isVue3', 1);
        handler.AddPara('appNo', appNo);
        handler.AddPara('ry-token', ry_token);
        authorizeMenus = await handler.DoMethodReturnJson<{
          System: Recordable[];
          Module: Recordable[];
          Menu: Recordable[];
        }>('Default_InitRy');
      } else {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
        handler.AddPara('isVue3', 1);
        authorizeMenus = await handler.DoMethodReturnJson<{
          System: Recordable[];
          Module: Recordable[];
          Menu: Recordable[];
        }>('Default_Init');
      }

      const { loadComponent } = useComponentLoader();

      const sysLang = WebUser.SysLang || 'CH';

      // //获取Url存储到本地的AppNo应用编号
      // if (getRequestParams('SystemNo')) {
      //   localStorage.setItem('SystemNo', getRequestParams('SystemNo'));
      // }
      // const getSystemNo = localStorage.getItem('SystemNo');
      // //判断是否存在AppNo与应用编号AppNo是否有存在一致的
      // const hasMatchingAppNo = authorizeMenus.System.some((sys) => !!sys.No && sys.No === getSystemNo);
      // //如果有就执行过滤，如果没有就返回全部
      // const SystemAppNo = hasMatchingAppNo
      //   ? authorizeMenus.System.filter((sys) => !!sys.No && sys.No === getSystemNo)
      //   : authorizeMenus.System.filter((sys) => sys.SystemType !== 3); // 如果存在匹配项，则过滤；否则返回除了独立系统的全部

      //获取Url存储到本地的AppNo应用编号
      if (getRequestParams('AppNo')) {
        localStorage.setItem('AppNo', getRequestParams('AppNo'));
      }
      const getAppNo = localStorage.getItem('AppNo');

      const appNoArray = getAppNo ? getAppNo.split(',').map((item) => item.trim()) : [];

      const hasMatchingAppNo = authorizeMenus.System.some((sys) => sys.AppNo && appNoArray.includes(sys.AppNo.toString()));

      const SystemAppNo = hasMatchingAppNo ? authorizeMenus.System.filter((sys) => sys.AppNo && appNoArray.includes(sys.AppNo.toString())) : authorizeMenus.System;

      const systems = SystemAppNo;
      const modules = authorizeMenus.Module;
      const menus = authorizeMenus.Menu.map((menu: Recordable) => ({
        ...menu,
        UrlExt: menu.Url,
      }));

      const lastCreateMenuId = localStorage.getItem('lastCreateMenuId');
      let redirectMenuAlias = '';
      // 获取url和参数
      const getRouterInfo = (url: string) => {
        let path = '',
          params = {};
        if (!!url?.trim()) {
          const result = url.split('?');
          path = result[0];
          if (result.length > 1) {
            params = Object.fromEntries(result[1].split('&').map((item) => item.split('=')));
          }
        }
        // if (path.startsWith('/')) path = path.substring(1);
        return [path, params];
      };
      const handleSelfUrl = (url: string) => {
        const urlPrefix = window.location.origin + '/#/';
        return url.replace('self://', urlPrefix);
      };
      // 处理目录加载
      const handleMenu = (menu: Recordable) => {
        let Alias = menu.Alias + (Math.random() * 10000).toFixed(3);
        Alias = Alias.replace(/-/g, '_').replace(/\./g, '_');
        if (menu.No === lastCreateMenuId) {
          redirectMenuAlias = Alias;
        }
        if (isSelfUrl(menu.UrlExt)) {
          return {
            path: menu.No,
            name: Alias,
            component: () => import('/@/views/sys/iframe/FrameBlank.vue'),
            meta: {
              title: menu['Name' + sysLang] || menu.Name,
              frameSrc: handleSelfUrl(menu.UrlExt),
              Icon: menu.Icon,
              menuInfo: {
                ...menu,
              },
              enableCache: menu.EnableCache == 1,
              Idx: menu.Idx,
            },
          };
        }
        // 优先处理url连接
        if (isHttpUrl(menu.UrlExt)) {
          if (menu.IframeOpenType === 'inner') {
            return {
              path: menu.No,
              name: Alias,
              component: () => import('/@/views/sys/iframe/FrameBlank.vue'),
              meta: {
                title: menu['Name' + sysLang] || menu.Name,
                frameSrc: menu.UrlExt,
                Icon: menu.Icon,
                menuInfo: {
                  ...menu,
                },
                enableCache: menu.EnableCache == 1,
                Idx: menu.Idx,
              },
            };
          }
          return {
            path: menu.UrlExt,
            name: Alias,
            component: () => import('/@/views/sys/iframe/FrameBlank.vue'),
            meta: {
              title: menu['Name' + sysLang] || menu.Name,
            },
          };
        }
        if (menu.MenuModel === MenuModel.FixedUrl) {
          const url = typeof menu.UrlExt === 'string' ? menu.UrlExt.replace(/&&/g, '&') : '';
          // if (url.startsWith('/')) url = url.substring(1);
          const [_, params] = getRouterInfo(url);
          const path = url.replace(/\?/g, '_').replace(/&/g, '_').replace(/=/g, '_').replace(/\./g, '_');
          const meta = {
            title: menu['Name' + sysLang] || menu.Name,
            Icon: menu.Icon,
            menuInfo: {
              ...menu,
            },
            urlQuery: {
              FrmID: menu.FrmID,
              ...params,
            },
            Alias,
            enableCache: menu.EnableCache == 1,
            Idx: menu.Idx,
          };
          return {
            path,
            name: Alias,
            // component: () => import(/* @vite-ignore */ menu.UrlPath.replace('@/', 'src/')),
            component: loadComponent(menu.UrlPath.replace('@/', 'src/')),
            meta,
          };
        }
        // 如果是自定义url
        const [path, params] = getRouterInfo(menu.UrlExt);
        if (menu.MenuModel === MenuModel.LinkFlowFunc) {
          return {
            path: menu.UrlExt,
            name: Alias,
            component: loadComponent(menu.UrlPath.replace('@/', 'src/')),
            meta: {
              title: menu['Name' + sysLang] || menu.Name,
              Icon: menu.Icon,
              menuInfo: {
                ...menu,
              },
              urlQuery: {
                FrmID: menu.FrmID,
                ...params,
              },
              enableCache: menu.EnableCache == 1,
              Idx: menu.Idx,
            },
          };
        }
        return {
          path,
          name: Alias,
          // component: () => import(/* @vite-ignore */ menu.UrlPath.replace('@/', 'src/')),
          component: loadComponent(menu.UrlPath.replace('@/', 'src/')),
          meta: {
            title: menu['Name' + sysLang] || menu.Name,
            Icon: menu.Icon,
            menuInfo: {
              ...menu,
            },
            urlQuery: {
              FrmID: menu.FrmID,
              ...params,
            },
            enableCache: menu.EnableCache == 1,
            Idx: menu.Idx,
          },
        };
      };

      // 构建模块树结构的递归函数
      const buildModuleTree = (parentNo: string | null, allModules: Recordable[]): any[] => {
        return allModules
          .filter((module) => {
            const moduleParentNo = module.ParentNo || null;
            return moduleParentNo === parentNo && module.Path !== '' && parseInt(module.IsEnable) !== 0;
          })
          .map((module: Recordable) => {
            // 查找当前模块的子模块
            const childModules = buildModuleTree(module.No, allModules);

            // 查找当前模块的直接菜单
            const directMenus = menus
              .filter((menu: Recordable) => menu.ModuleNo === module.No)
              .filter((menu: Recordable) => parseInt(menu.IsEnable) !== 0)
              .filter((menu: Recordable) => isUrl(menu.UrlExt) || menu?.UrlPath?.includes('.vue'))
              .map((menu: Recordable) => handleMenu(menu));

            // 合并子模块和直接菜单作为children
            const children = [...childModules, ...directMenus];

            return {
              path: module.No,
              name: module.No,
              component: children.length > 0 ? getParentLayout() : EMPTY_MODULE_LAYOUT,
              meta: {
                title: module['Name' + sysLang] || module.Name,
                moduleCode: module.No,
                Icon: module.Icon,
                menuInfo: {
                  ...module,
                },
                Idx: module.Idx,
              },
              children,
            };
          });
      };

      // 正常流程
      let customRoutes = cloneDeep(
        // 过滤系统
        systems
          .filter((system) => {
            return system.Path !== '' && parseInt(system.IsEnable) !== 0;
          })
          .map((system) => {
            // 构建该系统下的模块树结构（从根模块开始，ParentNo为null或空）
            const systemModules = buildModuleTree(
              null,
              modules.filter((module: Recordable) => module.SystemNo === system.No),
            );

            // 查找直接属于该系统的菜单（没有ModuleNo或ModuleNo为空，但有SystemNo的菜单）
            const directSystemMenus = menus
              .filter((menu: Recordable) => {
                return menu.SystemNo === system.No && (!menu.ModuleNo || menu.ModuleNo === '');
              })
              .filter((menu: Recordable) => parseInt(menu.IsEnable) !== 0)
              .filter((menu: Recordable) => isUrl(menu.UrlExt) || menu?.UrlPath?.includes('.vue'))
              .map((menu: Recordable) => handleMenu(menu));

            // 合并模块树和直接系统菜单
            const children = [...directSystemMenus, ...systemModules].sort((a, b) => {
              return (a.meta?.Idx || 0) - (b.meta?.Idx || 0);
            });

            return {
              path: '/' + system.No.replace(/\//g, ''),
              name: system.No,
              component: LAYOUT,
              meta: {
                title: system['Name' + sysLang] || system.Name,
                Icon: system.Icon,
                systemCode: system.No,
                menuInfo: {
                  ...system,
                },
              },
              // 合并模块树和直接系统菜单
              children,
            };
          }),
      );

      // 如果只有一个系统，仅保留模块菜单
      const { VITE_GLOB_HIDDEN_SYSTEM_WHEN_SINGLE_ITEM } = getAppEnvConfig();
      if (VITE_GLOB_HIDDEN_SYSTEM_WHEN_SINGLE_ITEM === 'true' && customRoutes.length === 1) {
        const routes = customRoutes[0].children || [];
        for (const r of routes) {
          r.component = LAYOUT;
          if (!r.path.startsWith('/')) {
            r.path = '/' + r.path;
          }
        }
        customRoutes = routes;
      }

      configRoutes = customRoutes as unknown as AppRouteRecordRaw[];
      for (const sys of configRoutes) {
        if (Array.isArray(sys.children)) {
          // const children = sys.children.filter((module) => module.children?.length && module.children.length > 0);
          // sys.children = children.length > 0 ? children : undefined;
          sys.children = sys.children;
        }
      }
      console.log({ configRoutes });
      configRoutes = configRoutes.filter((route) => Array.isArray(route.children) && route.children.length > 0);
      localStorage.setItem('redirectMenuAlias', redirectMenuAlias);
    },

    async buildRoutesAction(): Promise<AppRouteRecordRaw[]> {
      const { t } = useI18n();
      const userStore = useUserStore();
      const appStore = useAppStoreWithOut();

      let routes: AppRouteRecordRaw[] = [];
      const roleList = toRaw(userStore.getRoleList) || [];
      const { permissionMode = projectSetting.permissionMode } = appStore.getProjectConfig;

      const routeFilter = (route: AppRouteRecordRaw) => {
        const { meta } = route;
        const { roles } = meta || {};
        if (!roles) return true;
        return roleList.some((role) => roles.includes(role));
      };

      const routeRemoveIgnoreFilter = (route: AppRouteRecordRaw) => {
        const { meta } = route;
        const { ignoreRoute } = meta || {};
        return !ignoreRoute;
      };

      /**
       * @description 根据设置的首页path，修正routes中的affix标记（固定首页）
       * */
      const patchHomeAffix = (routes: AppRouteRecordRaw[]) => {
        if (!routes || routes.length === 0) return;
        let homePath: string = userStore.getUserInfo.homePath || PageEnum.BASE_HOME;

        function patcher(routes: AppRouteRecordRaw[], parentPath = '') {
          if (parentPath) parentPath = parentPath + '/';
          routes.forEach((route: AppRouteRecordRaw) => {
            const { path, children, redirect } = route;
            const currentPath = path.startsWith('/') ? path : parentPath + path;
            if (currentPath === homePath) {
              if (redirect) {
                homePath = route.redirect! as string;
              } else {
                route.meta = Object.assign({}, route.meta, { affix: true });
                throw new Error('end');
              }
            }
            children && children.length > 0 && patcher(children, currentPath);
          });
        }

        try {
          patcher(routes);
        } catch (e) {
          // 已处理完毕跳出循环
        }
        return;
      };

      switch (permissionMode) {
        case PermissionModeEnum.ROLE:
          routes = filter([...asyncRoutes, ...configRoutes], routeFilter);
          // routes = filter(asyncRoutes, routeFilter);
          routes = routes.filter(routeFilter);
          // Convert multi-level routing to level 2 routing
          routes = flatMultiLevelRoutes(routes);
          break;

        case PermissionModeEnum.ROUTE_MAPPING:
          routes = filter([...asyncRoutes, ...configRoutes], routeFilter);
          // routes = filter(asyncRoutes, routeFilter);
          routes = routes.filter(routeFilter);
          const menuList = transformRouteToMenu(routes, true);
          routes = filter(routes, routeRemoveIgnoreFilter);
          routes = routes.filter(routeRemoveIgnoreFilter);
          menuList.sort((a, b) => {
            return (a.meta?.orderNo || 0) - (b.meta?.orderNo || 0);
          });

          this.setFrontMenuList(menuList);
          // Convert multi-level routing to level 2 routing
          routes = flatMultiLevelRoutes(routes);
          break;

        //  If you are sure that you do not need to do background dynamic permissions, please comment the entire judgment below
        case PermissionModeEnum.BACK:
          const { createMessage } = useMessage();

          createMessage.loading({
            content: '菜单加载中...',
            duration: 1,
          });

          // !Simulate to obtain permission codes from the background,
          // this function may only need to be executed once, and the actual project can be put at the right time by itself
          let routeList: AppRouteRecordRaw[] = [];

          // Dynamically introduce components
          routeList = transformObjToRoute(routeList);

          //  Background routing to menu structure
          const backMenuList = transformRouteToMenu(routeList);
          this.setBackMenuList(backMenuList);

          // remove meta.ignoreRoute item
          routeList = filter(routeList, routeRemoveIgnoreFilter);
          routeList = routeList.filter(routeRemoveIgnoreFilter);

          routeList = flatMultiLevelRoutes(routeList);
          routes = [PAGE_NOT_FOUND_ROUTE, ...routeList];
          break;
      }

      routes.push(ERROR_LOG_ROUTE);
      patchHomeAffix(routes);
      return routes;
    },
  },
});

// Need to be used outside the setup
export function usePermissionStoreWithOut() {
  return usePermissionStore(store);
}
