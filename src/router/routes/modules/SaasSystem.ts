import type { AppRouteModule } from '/@/router/types';

const SaasSystem: AppRouteModule = {
  path: '/SaasHome',
  name: 'SaasHome',
  component: () => import('/@/Portal/SaaS/Admin/Home.vue'),
  meta: {
    Icon: 'icon-grid',
    title: '系统管理',
    hideChildrenInMenu: true,
    hideMenu: true,
  },
  redirect: '/SaasHome/SaaSWelcome',
  children: [
    {
      path: 'SaaSWelcome',
      name: 'SaaSWelcome',
      component: () => import('/@/Portal/SaaS/Admin/Welcome.vue'),
      meta: {
        title: '主页',
        No: 'HomePage',
        enableCache: false,
        Icon: 'icon-home',
        hideMenu: true,
      },
    },
    {
      path: 'TreeEns',
      name: 'treeEns',
      component: () => import('/@/WF/Comm/TreeEns.vue'),
      meta: {
        title: '组织树',
        No: 'TreeEns_Dept2Emp',
        enableCache: false,
        EnName: 'TreeEns_Dept2Emp',
        Icon: 'icon-globe',
      },
    },
    {
      path: 'Search',
      name: 'search',
      component: () => import('/@/WF/Comm/Search.vue'),
      meta: {
        title: '组织',
        No: 'Orgs',
        enableCache: false,
        EnName: 'TS.SaaS.OrgAdmin',
        Icon: 'icon-settings',
      },
    },
    {
      path: 'treeEns',
      name: 'treeEns',
      component: () => import('/@/WF/Comm/TreeEns.vue'),
      meta: {
        title: '流程',
        No: 'TreeEns_FlowSort2Flow',
        enableCache: false,
        EnName: 'TreeEns_FlowSort2Flow',
        Icon: 'icon-share',
      },
    },
    {
      path: 'treeEns',
      name: 'treeEns',
      component: () => import('/@/WF/Comm/TreeEns.vue'),
      meta: {
        title: '表单',
        No: 'TreeEns_FrmSort2Frm',
        enableCache: false,
        EnName: 'TreeEns_FrmSort2Frm',
        Icon: 'icon-docs',
      },
    },
  ],
};

export default SaasSystem;
