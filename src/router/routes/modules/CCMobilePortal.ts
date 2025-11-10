import type { AppRouteModule } from '/@/router/types';
import SinglePageLayout from '/@/layouts/page/index.vue';

const CCMobilePortal: AppRouteModule = {
  path: '/CCMobilePortal',
  name: 'CCMobilePortal',
  component: SinglePageLayout,
  redirect: '/CCMobilePortal/Home',
  meta: {
    title: '移动端',
    hideChildrenInMenu: true,
    hideMenu: true,
  },
  children: [
    {
      path: 'Login',
      name: 'CCMobilePortalLogin',
      component: () => import('/src/CCMobilePortal/Login.vue'),
      meta: {
        title: '首页',
        enableCache: false,
      },
    },
    {
      path: 'Home',
      name: 'CCMobilePortalHome',
      component: () =>
        import(/* @vite-ignore */ `${import.meta.env.VITE_GLOB_MOBILE_HOME}`).catch((_err) => {
          return import('/src/CCMobilePortal/Home.vue');
        }),
      meta: {
        title: '首页',
        enableCache: false,
      },
    },
  ],
};

export default CCMobilePortal;
