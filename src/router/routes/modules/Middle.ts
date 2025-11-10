// import MobileLayout from '/@/Portal/Middleware/Layout.vue';
// import { propRouter } from '/@/Portal/Middleware/global';
import type { AppRouteModule } from '/@/router/types';

const MiddlePage: AppRouteModule = {
  path: '/Middle',
  name: 'MiddleMode',
  component: () => import('/@/Portal/Middleware/Layout.vue'),
  redirect: '/Middle/GenerList?EnName=GL_Todolist',
  meta: {
    title: '中间件模式',
    hideChildrenInMenu: true,
    hideMenu: true,
  },
  children: [
    {
      path: 'PanelGroup',
      name: 'PalGroup',
      meta: {
        title: '分组列表页',
        No: '999-04',
        EnName: 'PG_FlowSort2Flow',
        Icon: 'icon-star',
      },
      component: () => import('/src/WF/Comm/PanelGroup.vue'),
    },
    {
      path: 'TreeEns',
      name: 'TrEns',
      meta: {
        title: '组织结构',
        No: '999-06',
        EnName: 'TreeEns_Dept2Emp',
        Icon: 'icon-star',
      },
      component: () => import('/@/WF/Comm/TreeEns.vue'),
    },
    {
      path: 'En',
      name: 'MiddleMySettingPage',
      meta: {
        title: '个人设置',
        No: '999-14',
        EnName: 'TS.User.MySetting',
        Icon: 'icon-user',
      },
      component: () => import('/@/WF/Comm/EnPage.vue'),
    },
    {
      path: 'Ens',
      name: 'MiddleEnsPage',
      meta: {
        title: '个人设置',
        No: '999-15',
        EnName: 'TS.User.MySetting',
        Icon: 'icon-user',
      },
      component: () => import('/@/WF/Comm/Ens.vue'),
    },
    {
      path: 'Search',
      name: 'MiddleSearchPage',
      meta: {
        title: '查询页面',
        No: '999-16',
        EnName: 'TS.Port.Search',
        Icon: 'icon-user',
      },
      component: () => import('/@/WF/Comm/Search.vue'),
    },
    // ...propRouter(),
    {
      // WF/GL/start GenerList.vue
      path: 'GenerList', // Middle/GenerList?params=xxx
      name: 'MiddleGenerList', // 别名 alias
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: 'GenerList',
        No: '999-17',
        Icon: 'icon-star',
      },
    },
    {
      path: 'MyFlow',
      name: 'M_MyFlow',
      component: () => import('/@/WF/MyFlow.vue'),
      meta: {
        title: '发起流程',
      },
    },
    {
      path: 'MyFlowGener',
      name: 'M_MyFlowGener',
      component: () => import('/@/WF/MyFlowGener.vue'),
      meta: {
        title: '发起流程',
      },
    },
    {
      path: 'MyView',
      name: 'M_MyView',
      component: () => import('/@/WF/MyView.vue'),
      meta: {
        title: '流程查看',
      },
    },
    // {
    //   path: '/FlowAth',
    //   name: 'M_FlowAth',
    //   component: () => import('/@/App/FlowAth.vue'),
    //   meta: {
    //     title: '流程查看',
    //   },
    // },
    {
      path: 'MyViewGener',
      name: 'M_MyViewGener',
      component: () => import('/@/WF/MyViewGener.vue'),
      meta: {
        title: '流程查看',
      },
    },
    {
      path: 'MyCC',
      name: 'M_MyCC',
      component: () => import('/@/WF/MyCC.vue'),
      meta: {
        title: '流程抄送',
      },
    },
    {
      path: 'MyCCGener',
      name: 'M_MyCCGener',
      component: () => import('/@/WF/MyCCGener.vue'),
      meta: {
        title: '流程抄送',
      },
    },
    {
      path: 'MyCCTree',
      name: 'M_MyCCTree',
      component: () => import('/@/WF/MyCCTree.vue'),
      meta: {
        title: '流程抄送',
      },
    },
    {
      path: 'MyCCSelfForm',
      name: 'M_MyCCSelfForm',
      component: () => import('/@/WF/MyCCSelfForm.vue'),
      meta: {
        title: '流程抄送表单',
      },
    },
    {
      path: 'MyFlowTree',
      name: 'M_MyFlowTree',
      component: () => import('/@/WF/MyFlowTree.vue'),
      meta: {
        title: '树形流程',
      },
    },
    {
      path: 'FrmDBGener',
      name: 'M_FrmDBGener',
      component: () => import('/@/WF/CCForm/FrmDBGener.vue'),
      meta: {
        title: '数据版本',
      },
    },
    {
      path: 'MyFlowSelfForm',
      name: 'M_MyFlowSelfForm',
      component: () => import('/@/WF/MyFlowSelfForm.vue'),
      meta: {
        title: '嵌入式流程',
      },
    },
    {
      path: 'ApiList',
      name: 'ApiList',
      component: () => import('/@/Portal/Middleware/ApiList.vue'),
      meta: {
        title: 'api列表',
      },
    },
    {
      // tab容器
      path: 'TabWrapper',
      name: 'MiddleTabWrapper',
      component: () => import('/@/WF/Comm/TabWrapper.vue'),
      meta: {
        title: 'tab-holder',
        enableCache: true,
      },
    },
  ],
};

export default MiddlePage;
