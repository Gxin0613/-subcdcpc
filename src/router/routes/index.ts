import type { AppRouteRecordRaw, AppRouteModule } from '/@/router/types';

import { PAGE_NOT_FOUND_ROUTE, REDIRECT_ROUTE } from '/@/router/routes/basic';

import { PageEnum } from '/@/enums/pageEnum';
import { t } from '/@/hooks/web/useI18n';

const modules = import.meta.glob('./modules/*.ts', { eager: true });
const routeModuleList: AppRouteModule[] = [];

Object.keys(modules).forEach((key) => {
  const mod = (modules[key] as any).default || {};
  const modList = Array.isArray(mod) ? [...mod] : [mod];
  routeModuleList.push(...modList);
});

export const asyncRoutes = [PAGE_NOT_FOUND_ROUTE, ...routeModuleList];

export const RootRoute: AppRouteRecordRaw = {
  path: '/',
  name: 'Root',
  redirect: PageEnum.BASE_HOME,
  meta: {
    title: 'Root',
  },
};
// 如果执行单点退出，那么cookie就不存在
// 每次都判断这个cookie是否有效
// 如果有效 继续执行我们系统的逻辑
// 如果无效直接就退出到登录页面
export const LoginRoute: AppRouteRecordRaw = {
  path: '/login',
  name: 'Login',
  component: () =>
    import(/* @vite-ignore */ `${import.meta.env.VITE_BASE_HOME_PATH}`).catch((_err) => {
      return import('/@/Portal/Login.vue');
    }),
  meta: {
    title: t('routes.basic.login'),
  },
};
//
// export const PortalRoute: AppRouteRecordRaw = {
//   path: '/portal',
//   name: 'Portal',
//   component: () => import('/@/CCFast/components/Portal.vue'),
//   meta: {
//     title: t('routes.basic.portal'),
//   },
// };

export const RptPortalRoute: AppRouteRecordRaw = {
  path: '/rptPortal',
  name: 'RptPortal',
  component: () => import('/@/CCFast/components/RptWhitePortal.vue'),
  meta: {
    title: t('门户'),
  },
};

// export const RptContentRoute: AppRouteRecordRaw = {
//   path: '/rptContent',
//   name: 'RptContent',
//   component: () => import('/@/CCFast/components/RptContent.vue'),
//   meta: {
//     title: t('内容'),
//   },
// };

export const MobileLoginRoute: AppRouteRecordRaw = {
  path: '/CCMobile/login',
  name: 'CCMobileLogin',
  component: () => import('/src/CCMobilePortal/Login.vue'),
  meta: {
    title: t('routes.basic.login'),
  },
};

export const INStallRoute: AppRouteRecordRaw = {
  path: '/DBInstall',
  name: 'DBInstall',
  component: () => import('/@/WF/Admin/DBInstall.vue'),
  // component: () => import('/@/App/ceshi/ceshi.vue'),

  meta: {
    title: t('routes.basic.dbinstall'),
  },
};
//SSO登录验证
export const SSOROUTE: AppRouteRecordRaw = {
  path: '/sso',
  name: 'sso',
  component: () => import('/@/WF/SSO.vue'),
  meta: {
    title: 'sso验证',
  },
};
//海南国基平台登录验证
export const CommROUTE: AppRouteRecordRaw = {
  path: '/HNComm',
  name: 'HNComm',
  component: () => import('/@/App/Comm.vue'),
  meta: {
    title: '海南国基平台登录验证',
  },
};
//自定义组件
export const FlowAthROUTE: AppRouteRecordRaw = {
  path: '/FlowAth',
  name: 'FlowAth',
  component: () => import('/@/App/FlowAth.vue'),
  meta: {
    title: '详情',
  },
};
//WF/Port页面
export const WFPortROUTE: AppRouteRecordRaw = {
  path: '/WF/Port',
  name: 'SinglePort',
  component: () => import('/@/WF/Port.vue'),
  meta: {
    title: '页面接口',
  },
};
//移动端SSO登录验证
export const MobileSSOROUTE: AppRouteRecordRaw = {
  path: '/MobileSSO',
  name: 'MobileSSO',
  component: () => import('/@/WF/MobileSSO.vue'),
  meta: {
    title: '移动端MobileSSO验证',
  },
};
//账号加签验证免登录
export const SignSSOROUTE: AppRouteRecordRaw = {
  path: '/SSOSign',
  name: 'SSOSign',
  component: () => import('/@/WF/SSOSign.vue'),
  meta: {
    title: '验签免登录',
  },
};
//移动端Do页面跳转
export const CCMobileDoROUTE: AppRouteRecordRaw = {
  path: '/CCMobile/Do',
  name: 'Do',
  component: () => import('/@/CCMobile/Do.vue'),
  meta: {
    title: '',
  },
};

//钉钉登录验证
export const DingDingROUTE: AppRouteRecordRaw = {
  path: '/DingDing',
  name: 'DingDing',
  component: () => import('/@/CCMobilePortal/DingDing.vue'),
  meta: {
    title: '钉钉集成验证',
  },
};
//微信小程序
export const AppletROUTE: AppRouteRecordRaw = {
  path: '/WXApplet',
  name: 'WXApplet',
  component: () => import('/@/CCMobilePortal/WXAppletOA.vue'),
  meta: {
    title: '微信小程序',
  },
};
//Copilot
export const Copilot: AppRouteRecordRaw = {
  path: '/Copilot',
  name: 'Copilot',
  component: () => import('/@/Copilot/index.vue'),
  meta: {
    title: 'Copilot',
  },
};

//demo1
export const Demo: AppRouteRecordRaw = {
  path: '/Demo',
  name: 'Demo',
  component: () => import('/@/App/Demo/Demo.vue'),
  meta: {
    title: '例子1',
  },
};
//微信登录验证
export const WeChatEnterpriseROUTE: AppRouteRecordRaw = {
  path: '/WeChatEnterprise',
  name: 'WeChatEnterprise',
  component: () => import('/@/CCMobilePortal/WeChatEnterprise.vue'),
  meta: {
    title: '微信集成验证',
  },
};
//企业微信第三方应用
export const WeChatOauth2ROUTE: AppRouteRecordRaw = {
  path: '/WeChatOauth2',
  name: 'WeChatOauth2',
  component: () => import('/@/CCMobilePortal/WeChatOauth2.vue'),
  meta: {
    title: '微信集成验证',
  },
};
//微信服务号验证
export const WeChatServiceROUTE: AppRouteRecordRaw = {
  path: '/WeChatService',
  name: 'WeChatService',
  component: () => import('/@/CCMobilePortal/WeChatService.vue'),
  meta: {
    title: '微信服务号验证',
  },
};
//SSO登录验证
export const ScanGuideROUTE: AppRouteRecordRaw = {
  path: '/CCMobile/ScanGuide',
  name: 'ScanGuide',
  component: () => import('/@/WF/WorkOpt/QRCode/ScanGuide.vue'),
  meta: {
    title: '二维码扫描',
  },
};

//SAASOperation相关路由
export const SAASOPROUTE: AppRouteRecordRaw[] = [
  {
    //登录页面
    path: '/OpLogin',
    name: 'OpLogin',
    component: () => import('/@/Portal/SaaSOperation/Login.vue'),
    meta: {
      title: t('routes.basic.OpLogin'),
    },
  },
  {
    //选择注册方式
    path: '/ChooseRegister',
    name: 'ChooseRegister',
    component: () => import('/@/Portal/SaaSOperation/ChooseRegister.vue'),
    meta: {
      //title: t('routes.basic.OpLogin'),
      title: '注册方式',
    },
  },
  {
    //注册页面
    path: '/Register',
    name: 'Register',
    component: () => import('/@/Portal/SaaSOperation/Register.vue'),
    meta: {
      // title: t('routes.basic.OpLogin'),
      title: '注册',
    },
  },
];
//SAAS登录相关路由
export const SAASROUTE: AppRouteRecordRaw[] = [
  {
    //超级管理员登录
    path: '/SaasAdminLogin',
    name: 'SaasAdminLogin',
    component: () => import('/@/Portal/SaaS/Admin/LoginAdmin.vue'),
    meta: {
      title: t('routes.basic.SaasAdminLogin'),
    },
  },
  {
    //普通登录
    path: '/SaasLogin',
    name: 'SaasLogin',
    component: () => import('/@/Portal/SaaS/Login.vue'),
    meta: {
      title: t('routes.basic.SaasLogin'),
    },
  },
  {
    //通用模式登录
    path: '/SaasLoginModel',
    name: 'SaasLoginModel',
    component: () => import('/@/Portal/SaaS/Model/Login.vue'),
    meta: {
      title: t('routes.basic.SaasLoginModel'),
    },
  },
  {
    //选择组织页面
    path: '/SelectOrg',
    name: 'SelectOrg',
    component: () => import('/@/Portal/SaaS/SelectOneOrg.vue'),
    meta: {
      title: t('routes.basic.selectorg'),
    },
  },
  {
    //saas home页面
    path: '/SaasHome',
    name: 'SaasHome',
    component: () => import('/@/Portal/SaaS/Admin/Home.vue'),
    meta: {
      title: t('routes.basic.SaasHome'),
      hideMenu: true,
    },
  },
];
//集团登录相关路由
export const GroupRoute: AppRouteRecordRaw[] = [
  {
    //集团版登录页
    path: '/GroupLogin',
    name: 'GroupLogin',
    component: () => import('/@/Portal/Standard/Login.vue'),
    meta: {
      title: t('routes.basic.GroupLogin'),
    },
  },
  {
    //集团版选择组织页
    path: '/GroupSelectOrg',
    name: 'GroupSelectOrg',
    component: () => import('/@/Portal/Standard/SelectOneOrg.vue'),
    meta: {
      //title: t('routes.basic.GroupSelectOrg'),
      title: '集团版：选择组织',
    },
  },
  {
    //Group home页面
    path: '/GroupHome',
    name: 'GroupHome',
    component: () => import('/@/Portal/Standard/Admin/Home.vue'),
    meta: {
      title: t('routes.basic.GroupHome'),
      hideMenu: true,
    },
  },
];

const dataVisualization = {
  path: '/DataV',
  name: 'DataV',
  component: () => import('/@/views/data_visualization/index.vue'),
  meta: {
    title: t('routes.basic.DataVisualization'),
    hideMenu: true,
  },
};

// 前端转发
const FEForward = {
  path: '/FEForward',
  name: 'FEForward',
  component: () => import('/@/WF/FEForward.vue'),
  meta: {
    title: '页面接口',
  },
};


export const CommonPageRoutes: AppRouteRecordRaw = {
  path: '/CommonPage/:key',
  name: 'CommonPage',
  component: () => import('/@/App/ceshi/ceshi.vue'),
  meta: {
    title: t('routes.basic.CommonPage'),
  },
};

// Basic routing without permission
export const basicRoutes = [
  FEForward,
  ...SAASROUTE,
  ...GroupRoute,
  ...SAASOPROUTE,
  dataVisualization,
  INStallRoute,
  LoginRoute,
  // PortalRoute,
  RptPortalRoute,
  // RptContentRoute,
  MobileLoginRoute,
  RootRoute,
  SSOROUTE,
  DingDingROUTE,
  CommROUTE,
  WeChatEnterpriseROUTE,
  WeChatOauth2ROUTE,
  WeChatServiceROUTE,
  MobileSSOROUTE,
  SignSSOROUTE,
  CCMobileDoROUTE,
  WFPortROUTE,
  ScanGuideROUTE,
  //RootMRoute,
  REDIRECT_ROUTE,
  PAGE_NOT_FOUND_ROUTE,
  AppletROUTE,
  Copilot,
  Demo,
  CommonPageRoutes,
];
