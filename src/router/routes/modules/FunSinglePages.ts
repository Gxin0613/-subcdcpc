
import type { AppRouteModule } from '/@/router/types';
import FunSinglePageLayout from '/@/layouts/page/index.vue';

const FunSinglePages: AppRouteModule = {
  path: '/FunSinglePages',
  name: 'FunSinglePages',
  component: FunSinglePageLayout,
  redirect: '/',
  meta: {
    title: 'Fun单页面',
    hideMenu: true,
  },
  children: [
    {
      path: '/WF/FrmOnlyOffice',
      name: 'FrmOnlyOffice',
      meta: {
        title: 'FrmOnlyOffice',
      },
      component: () => import('/@/WF/FrmOnlyOffice.vue'),
    },
  ],
};

export default FunSinglePages;
