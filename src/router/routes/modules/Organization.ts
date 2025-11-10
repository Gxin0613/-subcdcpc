import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';

const Organization: AppRouteModule = {
  path: '/org',
  name: 'OrgSetting',
  component: LAYOUT,
  redirect: '/org/treeEns',
  meta: {
    Icon: 'icon-organization',
    title: '组织结构',
    hideMenu: true,
  },
  children: [
    {
      path: 'treeEns',
      name: 'OrgTreeEns',
      component: () => import('/@/WF/Comm/TreeEns.vue'),
      meta: {
        title: '人员组织维护',
        enableCache: false,
        EnName: 'TreeEns_Dept2Emp',
        Icon: 'icon-people',
      },
    },
    {
      path: 'jobTypes',
      name: 'OrgJobTypes',
      component: () => import('/@/WF/Comm/Ens.vue'),
      meta: {
        title: '岗位类型维护',
        enableCache: false,
        EnName: 'TS.Port.StationType',
        Icon: 'icon-book-open',
      },
    },
    {
      path: 'jobs',
      name: 'OrgJobs',
      component: () => import('/@/WF/Comm/Search.vue'),
      meta: {
        title: '岗位维护',
        enableCache: false,
        EnName: 'TS.Port.Station',
        Icon: 'icon-list',
      },
    },
    {
      path: 'employee',
      name: 'OrgEmployee',
      component: () => import('/@/WF/Comm/Search.vue'),
      meta: {
        title: '人员维护',
        enableCache: false,
        EnName: 'TS.Port.Emp',
        Icon: 'icon-list',
      },
    },
  ],
};

export default Organization;
