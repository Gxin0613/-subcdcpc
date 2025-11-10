import type { AppRouteModule } from '/@/router/types';
import SinglePageLayout from '/@/layouts/page/index.vue';

const CCFastMobile: AppRouteModule = {
  path: '/CCFastMobile',
  name: 'CCFastMobilePage',
  component: SinglePageLayout,
  redirect: '/CCMobilePortal/Home',
  meta: {
    title: '移动端',
    hideChildrenInMenu: true,
    hideMenu: true,
  },
  children: [
    {
      path: 'Apps',
      name: 'Apps',
      component: () => import('/src/CCFastMobile/Apps.vue'),
      meta: {
        title: '应用中心',
      },
    },
    {
      path: 'FastRoute',
      name: 'FastRoute',
      component: () => import('/src/CCFastMobile/FastRoute.vue'),
      meta: {
        title: '菜单页面跳转路由',
        enableCache: false,
      },
    },
    {
      path: 'SearchRoute',
      name: 'SearchRoute',
      component: () => import('/src/CCFastMobile/SearchRoute.vue'),
      meta: {
        title: '查询页面操作跳转路由',
        enableCache: false,
      },
    },
    {
      path: 'MyBill',
      name: 'MyBill',
      component: () => import('/src/CCFastMobile/MyBill.vue'),
      meta: {
        title: '单据',
        enableCache: false,
      },
    },
    {
      path: 'MyEntityNoName',
      name: 'MyEntityNoName',
      component: () => import('/src/CCFastMobile/MyEntityNoName.vue'),
      meta: {
        title: '实体',
        enableCache: false,
      },
    },
  ],
};

export default CCFastMobile;
