import type { Router, RouteLocationNormalized } from 'vue-router';
import { useAppStoreWithOut } from '/@/store/modules/app';
import { useUserStoreWithOut } from '/@/store/modules/user';
import { useTransitionSetting } from '/@/hooks/setting/useTransitionSetting';
import { Modal, notification } from 'ant-design-vue';
import { warn } from '/@/utils/log';
import { unref } from 'vue';
import { setRouteChange } from '/@/logics/mitt/routeChange';
import { createPermissionGuard } from './permissionGuard';
import { createStateGuard } from './stateGuard';
import nProgress from 'nprogress';
import projectSetting from '/@/settings/projectSetting';
import { createParamMenuGuard } from './paramMenuGuard';
import { useUserStore } from '/@/store/modules/user';
import { getAllRequestParams } from '/@/utils/request/decode';
import { IsMobile } from '/@/utils/gener/StringUtils';
import { useMultipleTabStore } from '/@/store/modules/multipleTab';
// Don't change the order of creation
export function setupRouterGuard(router: Router) {
  createRedirectPageGuard(router);
  createPlatformRedirectGuard(router);
  createPageGuard(router);
  createPageLoadingGuard(router);
  // createHttpGuard(router);
  createScrollGuard(router);
  createMessageGuard(router);
  createProgressGuard(router);
  createPermissionGuard(router);
  createParamMenuGuard(router); // must after createPermissionGuard (menu has been built.)
  createStateGuard(router);
}

// 处理对接系统逻辑
function createRedirectPageGuard(router: Router) {
  const userStore = useUserStore();
  // const isDevModel = true; //是不是开发模式，开发模式下直接传入 UserNo/Token 可以登录。
  // const inDev = import.meta.env.DEV;
  router.beforeEach(async (to, _from, next) => {
    try {
      const urlParams = getAllRequestParams(window.location.href);
      // 不管是不是开发模式，判断有没有token
      const { DoWhat = '', Token = '', ...rest } = urlParams;
      if (!!Token) {
        userStore.setToken(Token);
      }
      //企业微信服务商处理
      if (DoWhat == 'WeChatOauth2') {
        window.location.href = window.location.origin + '/#/WeChatOauth2?' + new URLSearchParams(rest).toString();
        return;
      }
      if (!DoWhat) {
        next();
        return false;
      }
      if (DoWhat == 'GotoUrl') {
        const Url = decodeURIComponent(urlParams.Url) || '';
        if (Url) {
          const { origin, pathname } = window.location;
          window.location.href = origin + pathname + Url;
          next();
          return false;
        }
        next();
        return true;
      }

      if (DoWhat == 'DealWork' && window.location.href.includes('WF/Port')) {
        next();
        return true;
      }

      next();
      return true;
    } catch (e: any) {
      next(false);
      return true;
    }
  });
}

// 处理移动端
function createPlatformRedirectGuard(router: Router) {
  const userStore = useUserStoreWithOut();
  const token = userStore.getToken;

  const platformPagesMap = new Map([
    ['/WF/GL/TodoList', { link: '/CCMobilePortal/Home', query: { EnName: 'GL_Todolist' } }], // 这里就是待办的PC和移动端对应的代码
    ['/Middle/GenerList', { link: '/CCMobilePortal/Home', query: { EnName: 'GL_Todolist' } }], // 这里就是待办的PC和移动端对应的代码
    ['/CCMobile/GenerList', { link: '/WF/GL/TodoList', query: {} }], // 下面就是反过来绑定，因为第一个是key
    ['/WF/Port', { link: '/CCMobile/Do', query: {} }], // 下面就是反过来绑定，因为第一个是key
    ['/WF/MyFlow', { link: '/CCMobile/MyFlow', query: {} }],
    ['/Wf/MyView', { link: '/CCMobile/MyFlow', query: {} }],
  ]);

  router.beforeEach((to, from, next) => {
    if (token) {
      // 如果不是移动端，根据页面映射关系跳转, 没有映射关系则跳转到移动端首页
      // 比如电脑的todolist跳转到手机的todolist
      if (to.path === '/login') {
        next();
        return;
      }

      //如果是移动端从表放行
      if (to.path.includes('/CCMobile') || to.path.includes('/CCFastMobile')) {
        next();
        return;
      }

      // 用参数控制比较好，有可能经过iframe打开，用store就不生效
      if (to.query['skipPlatformCheck'] == '1') {
        next();
        return;
      }
      // 跳过路由守卫的判断
      // if (userStore.skipRouteCheck) {
      //   userStore.setSkipRouteCheck(false);
      //   next();
      //   return;
      // }
      if (to.path === '/MobileSSO') {
        next();
        return;
      }
      if (IsMobile() && !to.path.startsWith('/CCMobile')) {
        if (to.path == '/DingDing' || to.path == '/HNComm' || to.path === '/WeChatEnterprise' || to.path === '/WeChatService' || to.path === '/WXApplet') {
          console.log('111111111', to.path);
          next();
          return;
        }
        // @李玲杰 实现对应页面的跳转
        const PCPage = platformPagesMap.get(to.path);
        console.log('platformPagesMap', platformPagesMap);
        console.log('PCPage', PCPage);
        if (PCPage) {
          next({
            path: PCPage.link,
            query: to.query || PCPage.query || {},
          });
          return;
        }
        next({ path: '/CCMobilePortal/Home' });
        return;
      }
      if (!IsMobile() && to.path.startsWith('/CCMobile')) {
        // @李玲杰 实现对应页面的跳转
        const mobilePage = platformPagesMap.get(to.path);
        console.log('platformPagesMap', platformPagesMap);
        console.log('mobilePage', mobilePage);
        if (mobilePage) {
          next({
            path: mobilePage.link,
            query: mobilePage.query || to.query || {},
          });
          return;
        }
        next({ path: '/' });
        return;
      }
    }
    // alert(to);
    // if (to.fullPath.startsWith('/WeChatOauth2?') && to.fullPath.indexOf('noTZ') == -1) {
    //   console.log('topath', to);
    //   window.location.href = window.location.href + '&noTZ=1';
    //   return;
    // }
    next();
  });
}

/**
 * Hooks for handling page state
 * modified by wanglu
 * 配合tab处理缓存问题，避免内部api调用bug。
 */
function createPageGuard(router: Router) {
  const loadedPageMap = new Map<string, boolean>();
  const versionMap = new Map<string, number>();
  const tabStore = useMultipleTabStore();

  router.beforeEach(async (to) => {
    // The page has already been loaded, it will be faster to open it again, you don’t need to do loading and other processing
    to.meta.loaded = !!loadedPageMap.get(to.path);
    if (tabStore.getClosedTabList.includes(to.fullPath)) {
      const currentVersion = versionMap.get(to.fullPath) || 0;
      versionMap.set(to.fullPath, currentVersion + 1);
      tabStore.removeClosedTab(to.fullPath);
    }
    to.meta.version = versionMap.get(to.fullPath) || 0;
    // Notify routing changes
    setRouteChange(to);
    return true;
  });
  router.afterEach((to) => {
    loadedPageMap.set(to.path, true);
  });
}

// Used to handle page loading status
function createPageLoadingGuard(router: Router) {
  const userStore = useUserStoreWithOut();
  const appStore = useAppStoreWithOut();
  const { getOpenPageLoading } = useTransitionSetting();
  router.beforeEach(async (to) => {
    if (!userStore.getToken) {
      return true;
    }
    if (to.meta.loaded) {
      return true;
    }

    if (unref(getOpenPageLoading)) {
      await appStore.setPageLoadingAction(true);
      return true;
    }

    return true;
  });
  router.afterEach(async () => {
    if (unref(getOpenPageLoading)) {
      // TODO Looking for a better way
      // The timer simulates the loading time to prevent flashing too fast,
      setTimeout(() => {
        appStore.setPageLoading(false);
      }, 220);
    }
    return true;
  });
}

/**
 * The interface used to close the current page to complete the request when the route is switched
 * @param router
 */

// Routing switch back to the top
function createScrollGuard(router: Router) {
  const isHash = (href: string) => {
    return /^#/.test(href);
  };

  const body = document.body;

  router.afterEach(async (to) => {
    // scroll top
    isHash((to as RouteLocationNormalized & { href: string })?.href) && body.scrollTo(0, 0);
    return true;
  });
}

/**
 * Used to close the message instance when the route is switched
 * @param router
 */
export function createMessageGuard(router: Router) {
  const { closeMessageOnSwitch } = projectSetting;

  router.beforeEach(async () => {
    try {
      if (closeMessageOnSwitch) {
        Modal.destroyAll();
        notification.destroy();
      }
    } catch (error) {
      warn('message guard error:' + error);
    }
    return true;
  });
}

export function createProgressGuard(router: Router) {
  const { getOpenNProgress } = useTransitionSetting();
  router.beforeEach(async (to) => {
    if (to.meta.loaded) {
      return true;
    }
    unref(getOpenNProgress) && nProgress.start();
    return true;
  });

  router.afterEach(async () => {
    unref(getOpenNProgress) && nProgress.done();
    return true;
  });
}
