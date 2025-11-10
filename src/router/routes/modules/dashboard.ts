import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';
const dashboard: AppRouteModule = {
  path: '/WF/Comm',
  name: 'DataVisualization',
  redirect: '/WF/Comm/DataV',
  component: LAYOUT,
  meta: {
    Icon: 'icon-compass',
    title:  t('routes.basic.DataVisualization'),
    hideChildrenInMenu: true, // 隐藏子菜单，只显示父级
  },
  children: [
    {
      path: 'DataV',
      name: 'DataV',
      component: () => import('/@/views/data_visualization/index.vue'),
      meta: {
        Icon: 'icon-layers',
        title: '工作台',
      },
    },
  ],
};

export default dashboard;
