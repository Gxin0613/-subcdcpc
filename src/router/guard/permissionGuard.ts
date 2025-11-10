import type { Router, RouteRecordRaw } from 'vue-router';
import { usePermissionStoreWithOut } from '/@/store/modules/permission';
import { PageEnum } from '/@/enums/pageEnum';
import { useUserStoreWithOut } from '/@/store/modules/user';
import { PAGE_NOT_FOUND_ROUTE } from '/@/router/routes/basic';
import { RootRoute } from '/@/router/routes';
import { message } from 'ant-design-vue';
import { getAppEnvConfig } from '/@/utils/env';

const LOGIN_PATH = PageEnum.BASE_LOGIN;
const DB_INSTALL = PageEnum.DB_INSTALL;
const SSO = PageEnum.SSO;
const ScanGuide = PageEnum.ScanGuide;
const SELECT_ORG = PageEnum.SELECT_ORG;
const SAAS_ADMIN_LOGIN = PageEnum.SAAS_ADMIN_LOGIN;
const SAAS_LOGIN = PageEnum.SAAS_LOGIN;
const SAAS_LOGIN_Model = PageEnum.SAAS_LOGIN_Model;
const SAAS_ADMIN_HOME = PageEnum.SAAS_ADMIN_HOME;
const GROUP_ADMIN_HOME = PageEnum.GROUP_ADMIN_HOME;
const GROUP_LOGIN = PageEnum.GROUP_LOGIN;
const ROOT_PATH = RootRoute.path;
const SAAS_OP_Login = PageEnum.SAAS_OP_Login;
const SAAS_OP_ChooseRegister = PageEnum.SAAS_OP_ChooseRegister;
const SAAS_OP_Register = PageEnum.SAAS_OP_Register;
const DingDing = PageEnum.DingDing;
const WeChatEnterprise = PageEnum.WeChatEnterprise;
const WeChatOauth2 = PageEnum.WeChatOauth2;
const SSOSign = PageEnum.SSOSign;
const WeChatService = PageEnum.WeChatService;
const MobileSSO = PageEnum.MobileSSO;
const WXApplet = PageEnum.WXApplet;
const Do = PageEnum.Do;
const WF_Port = PageEnum.WF_Port;
const CommonPage = PageEnum.CommonPage;

const whitePathList: PageEnum[] = [
  LOGIN_PATH,
  DB_INSTALL,
  SSO,
  SELECT_ORG,
  SAAS_ADMIN_LOGIN,
  SAAS_LOGIN,
  SAAS_LOGIN_Model,
  SAAS_ADMIN_HOME,
  GROUP_ADMIN_HOME,
  GROUP_LOGIN,
  SAAS_OP_Login,
  SAAS_OP_ChooseRegister,
  SAAS_OP_Register,
  DingDing,
  WeChatEnterprise,
  WeChatOauth2,
  SSOSign,
  WeChatService,
  MobileSSO,
  WXApplet,
  Do,
  WF_Port,
  PageEnum.FEForward,
  ScanGuide,
  // CommonPage,
];

export function createPermissionGuard(router: Router) {
  const userStore = useUserStoreWithOut();
  const permissionStore = usePermissionStoreWithOut();
  router.beforeEach(async (to, from, next) => {
    if (from.path === ROOT_PATH && to.path === PageEnum.BASE_HOME && userStore.getUserInfo.homePath && userStore.getUserInfo.homePath !== PageEnum.BASE_HOME) {
      next(userStore.getUserInfo.homePath);
      return;
    }
    const token = userStore.getToken;

    // Whitelist can be directly entered 包括DBInstall安装页面
    if (whitePathList.includes(to.path as PageEnum)) {
      if (to.path === LOGIN_PATH && token) {
        const isSessionTimeout = userStore.getSessionTimeout;
        try {
          await userStore.afterLoginAction();
          if (!isSessionTimeout) {
            next((to.query?.redirect as string) || '/');
            return;
          }
        } catch {}
      }
      next();
      return;
    }

    // token does not exist
    if (!token) {
      // You can access without permission. You need to set the routing meta.ignoreAuth to true
      if (to.meta.ignoreAuth || to.path.toLocaleLowerCase().includes('login')) {
        next();
        return;
      }
      const { VITE_GLOB_IS_THIRDPART_SYSTEM } = getAppEnvConfig();
      if (VITE_GLOB_IS_THIRDPART_SYSTEM) {
        next(false);
        message.error('登录已过期');
        const appDiv = document.getElementById('app');
        appDiv!.innerHTML = '登录已过期';
        const allowedOrigin = `http://${window.location.hostname}`;
        window.parent.postMessage('loginTimeout', allowedOrigin);
        return;
      }
      //判断是否启用SSO统一验证平台
      const isSSO = import.meta.env.VITE_GLOB_SSO;
      // redirect login page
      const redirectData: { path: string; replace: boolean; query?: Recordable<string> } = {
        path: isSSO == 'true' ? SSO : LOGIN_PATH,
        replace: true,
      };
      if (to.path) {
        redirectData.query = {
          ...redirectData.query,
          redirect: to.path,
        };
      }
      next(redirectData);
      return;
    }

    // Jump to the 404 page after processing the login
    if (from.path === LOGIN_PATH && to.name === PAGE_NOT_FOUND_ROUTE.name && to.fullPath !== (userStore.homePath || PageEnum.BASE_HOME)) {
      next(userStore.getUserInfo.homePath || PageEnum.BASE_HOME);
      return;
    }

    // get userinfo while last fetch time is empty
    if (userStore.getLastUpdateTime === 0) {
      try {
        //如果是移动端，清空Token信息（周总：移动端需要清空Token重新登录）
        // if (IsMobile()) {
        //   userStore.setToken(undefined);
        // }
        await userStore.getUserInfoAction();
      } catch (err) {
        next('/login');
        return;
      }
    }

    if (permissionStore.getIsDynamicAddedRoute) {
      next();
      return;
    }

    await permissionStore.buildCCFastRoutes();
    const routes = await permissionStore.buildRoutesAction();

    routes.forEach((route) => {
      router.addRoute(route as unknown as RouteRecordRaw);
    });

    router.addRoute(PAGE_NOT_FOUND_ROUTE as unknown as RouteRecordRaw);

    permissionStore.setDynamicAddedRoute(true);

    if (to.name === PAGE_NOT_FOUND_ROUTE.name) {
      // 动态添加路由后，此处应当重定向到fullPath，否则会加载404页面内容
      next({ path: to.fullPath, replace: true, query: to.query });
    } else {
      const redirectPath = (from.query.redirect || to.path) as string;
      const redirect = decodeURIComponent(redirectPath);
      const nextData = to.path === redirect ? { ...to, replace: true } : { path: redirect };
      next(nextData);
    }
  });
}
