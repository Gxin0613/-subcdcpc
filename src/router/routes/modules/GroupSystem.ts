import type { AppRouteModule } from '/@/router/types';

const GroupSystem: AppRouteModule = {
  path: '/GroupHome',
  name: 'GroupHome',
  component: () => import('/@/Portal/Standard/Admin/Home.vue'),
  meta: {
    Icon: 'icon-grid',
    title: '系统管理',
    hideChildrenInMenu: true,
    hideMenu: true,
  },
  redirect: '/GroupHome/Dept?EnName=TreeEns_Dept2EmpAdminGrop',
  children: [
    {
      path: 'Dept',
      name: 'treeEnsOfDept',
      component: () => import('/@/WF/Comm/TreeEns.vue'),
      meta: {
        title: '部门树(全部)',
        No: 'TreeEns_Dept2EmpAdminGrop',
        enableCache: false,
        EnName: 'TreeEns_Dept2EmpAdminGrop',
        Icon: 'icon-people',
      },
    },
    {
      path: 'Org',
      name: 'treeEnsOfOrg',
      component: () => import('/@/WF/Comm/TreeEns.vue'),
      meta: {
        title: '组织树',
        No: 'TreeEns_Dept2EmpAdminGrop',
        enableCache: false,
        EnName: 'TreeEns_Dept2EmpAdminGrop',
        Icon: 'icon-globe',
      },
    },
    {
      path: 'Flow',
      name: 'treeEnsOfFlow',
      component: () => import('/@/WF/Comm/TreeEns.vue'),
      meta: {
        title: '流程树',
        No: 'TreeEns_FlowSort2FlowAdminGrop',
        enableCache: false,
        EnName: 'TreeEns_FlowSort2FlowAdminGrop',
        Icon: 'icon-share',
      },
    },
    {
      path: 'Form',
      name: 'treeEnsOfForm',
      component: () => import('/@/WF/Comm/TreeEns.vue'),
      meta: {
        title: '表单树',
        No: 'TreeEns_FrmSort2FrmAdminGrop',
        enableCache: false,
        EnName: 'TreeEns_FrmSort2FrmAdminGrop',
        Icon: 'icon-docs',
      },
    },
    {
      path: 'Search',
      name: 'searchOrgs',
      component: () => import('/@/WF/Comm/Search.vue'),
      meta: {
        title: '组织台账',
        No: 'Orgs',
        enableCache: false,
        EnName: 'TS.Port.AdminGroup.Org',
        Icon: 'icon-settings',
      },
    },
  ],
};

export default GroupSystem;
