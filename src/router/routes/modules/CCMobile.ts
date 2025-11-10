// import MobileLayout from '/@/Portal/Middleware/Layout.vue';
// import { propRouter } from '/@/Portal/Middleware/global';
import type { AppRouteModule } from '/@/router/types';
import SinglePageLayout from '/@/layouts/page/index.vue';

const CCMobile: AppRouteModule = {
  path: '/CCMobile',
  name: 'CCMobilePages',
  component: SinglePageLayout,
  redirect: '/CCMobilePortal/Home',
  meta: {
    title: '移动端',
    hideChildrenInMenu: true,
    hideMenu: true,
  },
  children: [
    {
      path: 'Tabs',
      name: 'CCMobileTabs',
      component: () => import('/src/components/Tabs/index.vue'),
      meta: {
        title: 'Tabs',
        enableCache: true,
      },
    },
    {
      path: 'Search',
      name: 'CCMobileSearch',
      component: () => import('/src/CCMobile/Comm/Search.vue'),
      meta: {
        title: '搜索',
        enableCache: true,
      },
    },
    {
      path: 'GenerList',
      name: 'CCMobileGenerList',
      component: () => import('/src/CCMobile/GenerList.vue'),
      meta: {
        title: '列表',
        enableCache: false,
      },
    },
    {
      path: 'MyOA',
      name: 'CCMobileMyOA',
      component: () => import('/src/CCMobile/MyOA.vue'),
      meta: {
        title: '企业微信集成（免登录）',
        enableCache: false,
      },
    },

    {
      path: 'MyFlow',
      name: 'CCMobileMyFlow',
      component: () => import('/src/CCMobile/MyFlow.vue'),
      meta: {
        title: '流程处理器',
        enableCache: false,
      },
    },
    {
      path: 'MyFlowGener',
      name: 'CCMobileMyFlowGener',
      component: () => import('/@/CCMobile/MyFlowGener.vue'),
      meta: {
        title: '发起流程',
      },
    },
    {
      path: 'MyView',
      name: 'CCMobileMyView',
      component: () => import('/@/CCMobile/MyView.vue'),
      meta: {
        title: '流程查看',
      },
    },
    {
      path: 'MyViewGener',
      name: 'CCMobileMyViewGener',
      component: () => import('/@/CCMobile/MyViewGener.vue'),
      meta: {
        title: '流程查看',
      },
    },
    {
      path: 'MyCC',
      name: 'CCMobileMyCC',
      component: () => import('/@/CCMobile/MyCC.vue'),
      meta: {
        title: '流程抄送',
      },
    },
    {
      path: 'MyCCGener',
      name: 'CCMobileMyCCGener',
      component: () => import('/@/CCMobile/MyCCGener.vue'),
      meta: {
        title: '流程抄送',
      },
    },
    {
      path: 'MyCCSelfForm',
      name: 'CCMobileMyCCSelfForm',
      component: () => import('/@/CCMobile/MyCCSelfForm.vue'),
      meta: {
        title: '流程抄送',
      },
    },
    {
      path: 'MyFlowTree',
      name: 'CCMobileMyFlowTree',
      component: () => import('/@/CCMobile/MyFlowTree.vue'),
      meta: {
        title: '树形流程',
      },
    },
    {
      path: 'MyFlowSelfForm',
      name: 'CCMobileMyFlowSelfForm',
      component: () => import('/@/CCMobile/MyFlowSelfForm.vue'),
      meta: {
        title: '树形流程',
      },
    },
    {
      path: 'CCForm/Dtl',
      name: 'CCMobileDtl',
      component: () => import('/@/CCMobile/CCForm/Dtl.vue'),
      meta: {
        title: '从表',
      },
    },
    {
      path: 'Comm/En',
      name: 'CCMobileEn',
      component: () => import('/@/CCMobile/Comm/EnPage.vue'),
      meta: {
        title: '实体查询',
      },
    },
    {
      path: 'CCForm/Frm',
      name: 'Frm',
      component: () => import('/@/CCMobile/CCForm/Frm.vue'),
      meta: {
        title: '表单',
      },
    },
    {
      path: 'WorkOpt/Batch/BatchWorkCheckModel',
      name: 'BatchWorkCheckModel',
      component: () => import('/src/CCMobile/WorkOpt/Batch/BatchWorkCheckModel.vue'),
      meta: {
        title: '批处理',
      },
    },
    // {
    //   path: 'Do',
    //   name: 'CCMobileDo',
    //   component: () => import('/@/CCMobile/Do.vue'),
    //   meta: {
    //     title: 'Port接口页面',
    //   },
    // },
  ],
};

export default CCMobile;
