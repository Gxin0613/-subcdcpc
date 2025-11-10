import type { AppRouteModule } from '/@/router/types';

const QingJia: AppRouteModule = {
  path: '/QingJia',
  name: 'QingJia',
  component: () => import('/@/App/Demo/VueSelfFrm/QingJia.vue'),
  meta: {
    title: '嵌入式表单QingJia',
    hideMenu: true,
  },
};
export default QingJia;
