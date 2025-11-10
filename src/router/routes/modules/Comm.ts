import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';

const comm: AppRouteModule = {
  path: '/WF/Comm',
  name: 'Comm',
  component: LAYOUT,
  redirect: '/WF/Comm/PanelGroup',
  meta: {
    icon: 'ion:layers-outline',
    title: '通用',
    hideMenu: true,
  },
  children: [
    {
      path: 'Tabs',
      name: 'CommTabs',
      component: () => import('/@/components/Tabs/index.vue'),
      meta: {
        title: '选项卡页面',
      },
    },
    {
      path: 'PanelGroup',
      name: 'PanelGroup',
      component: () => import('/@/WF/Comm/PanelGroup.vue'),
      meta: {
        title: '看板',
      },
    },
    {
      path: 'TreeEns',
      name: 'TreeEns',
      component: () => import('/@/WF/Comm/TreeEns.vue'),
      meta: {
        title: 'loading..',
      },
    },
    // {
    //   path: 'DataV',
    //   name: 'DataV',
    //   component: () => import('/@/views/data_visualization/index.vue'),
    //   meta: {
    //     title: '数据',
    //     hideMenu: true,
    //   },
    // },
    {
      path: 'En',
      name: 'En',
      component: () => import('/@/WF/Comm/EnPage.vue'),
      meta: {
        title: '实体',
      },
    },
    {
      path: 'EnOnly',
      name: 'EnOnly',
      component: () => import('/@/WF/Comm/EnOnly.vue'),
      meta: {
        title: '实体编辑器',
      },
    },
    {
      path: 'GenerList',
      name: 'GenerList',
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: '待办列表',
      },
    },
    {
      path: 'GroupEdit',
      name: 'GroupEdit',
      component: () => import('/@/WF/Comm/UIEntity/GroupPageEdit.vue'),
      meta: {
        title: '节点属性编辑',
      },
    },
    {
      path: 'GroupPageNew',
      name: 'GroupPageNew',
      component: () => import('/@/WF/Comm/UIEntity/GroupPageNew.vue'),
      meta: {
        title: '节点属性新增',
      },
    },
    {
      path: 'Search',
      name: 'S_Search',
      component: () => import('/@/WF/Comm/Search.vue'),
      meta: {
        title: '查询',
      },
    },
    {
      path: 'Ens',
      name: 'Ens',
      component: () => import('/@/WF/Comm/Ens.vue'),
      meta: {
        title: '角色',
      },
    },
    {
      path: 'Tree',
      name: 'Tree',
      component: () => import('/@/WF/Comm/Tree.vue'),
      meta: {
        title: '部门',
      },
    },
    {
      // 相当于 在/WF/Comm/ 补充一个具体的路径
      path: 'DtlSearch',
      name: 'DtlSearch',
      component: () => import('/@/WF/Comm/Dtl/DtlSearch.vue'),
      meta: {
        title: '表单库',
      },
    },
    {
      //集团版选择组织页
      path: 'GroupSelectOrg',
      name: 'GroupSelectOrg',
      component: () => import('/@/Portal/Standard/SelectOneOrg.vue'),
      meta: {
        //title: t('routes.basic.GroupSelectOrg'),
        title: '集团版：选择组织',
      },
    },
    {
      // tab容器
      path: 'TabWrapper',
      name: 'CommTabWrapper',
      component: () => import('/@/WF/Comm/TabWrapper.vue'),
      meta: {
        title: 'tab-holder',
        enableCache: true, // 允许缓存
      },
    },
  ],
};

export default comm;
