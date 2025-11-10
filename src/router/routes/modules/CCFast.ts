import type { AppRouteModule } from '/@/router/types';
import SinglePageLayout from '/@/layouts/page/index.vue';

const CCFast: AppRouteModule = {
  path: '/CCFast',
  name: 'CCFastModules',
  component: SinglePageLayout,
  redirect: '/CCFast/CCBill/SearchDict',
  meta: {
    title: '单页面',
    hideMenu: true,
  },
  children: [
    {
      path: '/CCFast/CCBill/SearchDict',
      name: 'CCFastSearchDict',
      component: () => import('/@/CCFast/CCBill/SearchDict.vue'),
      meta: {
        title: '实体管理',
        enableCache: false,
      },
    },
    {
      path: '/CCFast/CCBill/MyDictFrameWork',
      name: 'CCFastMyDictFrameWork',
      component: () => import('/@/CCFast/CCBill/MyDictFrameWork.vue'),
      meta: {
        title: '实体相关功能',
        enableCache: false,
      },
    },
    {
      path: '/CCFast/CCBill/MyBill',
      name: 'CCFastMyBill',
      component: () => import('/@/CCFast/CCBill/MyBill.vue'),
      meta: {
        title: '单据',
        enableCache: false,
      },
    },
    {
      path: '/CCFast/CCBill/MyDict',
      name: 'CCFastMyDict',
      component: () => import('/@/CCFast/CCBill/MyDict.vue'),
      meta: {
        title: '实体',
        enableCache: false,
      },
    },
    {
      path: '/CCFast/CCBill/MyEntityNoName',
      name: 'CCFastMyEntityNoName',
      component: () => import('/@/CCFast/CCBill/MyEntityNoName.vue'),
      meta: {
        title: '实体',
        enableCache: false,
      },
    },
    {
      path: '/WF/Comm/EnPage',
      name: 'CommEn',
      component: () => import('/@/WF/Comm/EnPage.vue'),
      meta: {
        title: '实体管理',
        enableCache: false,
      },
    },
    {
      path: '/FrmAskQRCode',
      name: 'FrmAskQRCode',
      component: () => import('/@/CCFast/CCBill/AskFrm/FrmAskQRCode.vue'),
      meta: {
        title: '活动',
        enableCache: false,
      },
    },
    {
      path: '/ShareUrl',
      name: 'ShareUrl',
      component: () => import('/@/CCFast/CCBill/AskFrm/ShareUrl.vue'),
      meta: {
        title: '活动',
        enableCache: false,
      },
    },
  ],
};

export default CCFast;
