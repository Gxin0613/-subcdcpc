import type { AppRouteModule } from '/@/router/types';
import SinglePageLayout from '/@/layouts/page/index.vue';
export const THIRDPART_SYSTEM_ROUTES = [
  {
    path: '/WF/GenerList',
    name: 'SingleGenerList',
    component: () => import('/@/WF/views/GenerList.vue'),
    meta: {
      title: '工作流列表',
      enableCache: false,
    },
  },
  {
    path: '/RptPortal',
    name: 'CustomRptPortal',
    component: () => import('/@/CCFast/components/RptWhitePortal.vue'),
    meta: {
      title: '自定义门户',
      enableCache: false,
    },
  },
  {
    path: '/WF/Designer/Form',
    name: 'SingleForm',
    component: () => import('/@/WF/Admin/FormContainer/index.vue'),
    meta: {
      title: '表单设计器',
      enableCache: false,
    },
  },
  {
    path: '/WF/ChapterFrmDesigner/Form',
    name: 'SingleCharpetForm',
    component: () => import('/@/WF/Admin/FormContainer/index.vue'),
    meta: {
      title: '章节表单设计器',
      enableCache: false,
    },
  },
  {
    path: '/WF/CCForm/FrmDesignerView',
    name: 'SingleFormView',
    component: () => import('/@/WF/CCForm/FrmDesignerView.vue'),
    meta: {
      title: '表单页面设计',
    },
  },
  {
    path: '/WF/TreeEns',
    name: 'SingleTreeEns',
    component: () => import('/@/WF/Comm/TreeEns.vue'),
    meta: {
      title: '树/列组件',
      enableCache: false,
    },
  },
  {
    path: '/WF/Comm/En',
    name: 'SingleEn',
    component: () => import('/@/WF/Comm/EnPage.vue'),
    meta: {
      title: '实体属性',
      hideMenu: true,
      enableCache: false,
    },
  },
  {
    path: '/WF/Comm/EnPort',
    name: 'SingleEnPort',
    component: () => import('/@/WF/Comm/EnPort.vue'),
    meta: {
      title: '实体属性',
      hideMenu: true,
      enableCache: false,
    },
  },
  {
    path: '/WF/Designer/EditFlow',
    name: 'SingleEditFlow',
    component: () => import('/@flow/index.vue'),
    meta: {
      title: '流程设计器',
    },
  },
  {
    path: '/WF/Designer/List',
    name: 'SingleList',
    component: () => import('/@/WF/Admin/Cond2020/List.vue'),
    meta: {
      title: '列表',
    },
  },
  {
    path: '/WF/Comm/Entity',
    name: 'SingleEntity',
    component: () => import('/@/WF/Comm/En.vue'),
    meta: {
      title: '实体',
      enableCache: false,
    },
  },
  {
    path: '/WF/Comm/GPE',
    name: 'SingleGPE',
    component: () => import('/@/WF/views/Comm/GPEWrapper.vue'),
    meta: {
      title: '实体编辑',
    },
  },
  {
    path: '/WF/TestingContainer/TestFlow',
    name: 'SingleTestFlow',
    component: () => import('/@/WF/Admin/TestingContainer/TestFlow.vue'),
    meta: {
      title: '测试容器',
    },
  },
  {
    path: '/WF/TestingContainer/Default',
    name: 'SingleTestingContainer',
    component: () => import('/@/WF/Admin/TestingContainer/Default.vue'),
    meta: {
      title: '测试容器',
      enableCache: false,
    },
  },
  {
    path: '/WF/TestingContainer/FlowInstance',
    name: 'SingleFlowInstance',
    component: () => import('/@/WF/Admin/TestingContainer/FlowInstance.vue'),
    meta: {
      title: '流程实例',
    },
  },
  {
    path: '/WF/MyFlow',
    name: 'SingleMyFlow',
    component: () => import('/@/WF/MyFlow.vue'),
    meta: {
      title: '流程',
    },
  },
  {
    path: '/WF/MyFlowGener',
    name: 'SingleMyFlowGener',
    component: () => import('/@/WF/MyFlowGener.vue'),
    meta: {
      title: '流程',
    },
  },
  {
    path: '/WF/MyView',
    name: 'SingleMyView',
    component: () => import('/@/WF/MyView.vue'),
    meta: {
      title: '流程查看',
    },
  },
  {
    path: '/WF/MyViewGener',
    name: 'SingleMyViewGener',
    component: () => import('/@/WF/MyViewGener.vue'),
    meta: {
      title: '流程查看',
    },
  },
  {
    path: '/WF/FlowAth',
    name: 'SingleFlowAth',
    component: () => import('/@/App/FlowAth.vue'),
    meta: {
      title: '流程查看',
    },
  },
  {
    path: '/WF/MyCC',
    name: 'SingleMyCC',
    component: () => import('/@/WF/MyCC.vue'),
    meta: {
      title: '流程抄送',
    },
  },
  {
    path: '/WF/MyCCGener',
    name: 'SingleMyCCGener',
    component: () => import('/@/WF/MyCCGener.vue'),
    meta: {
      title: '流程抄送',
    },
  },
  {
    path: '/WF/MyFlowTree',
    name: 'SingleMyFlowTree',
    component: () => import('/@/WF/MyFlowTree.vue'),
    meta: {
      title: '树形流程',
    },
  },
  {
    path: '/WF/FrmDBGener',
    name: 'SingleFrmDBGener',
    component: () => import('/@/WF/CCForm/FrmDBGener.vue'),
    meta: {
      title: '数据版本',
    },
  },
  {
    path: '/WF/MyFlowSelfForm',
    name: 'SingleMyFlowSelfForm',
    component: () => import('/@/WF/MyFlowSelfForm.vue'),
    meta: {
      title: '嵌入式流程',
    },
  },
  {
    path: '/WF/MyCCSelfForm',
    name: 'SingleMyCCSelfForm',
    component: () => import('/@/WF/MyCCSelfForm.vue'),
    meta: {
      title: '抄送嵌入式流程',
    },
  },
  {
    path: '/WF/Search',
    name: 'SingleSearch',
    component: () => import('/@/WF/Comm/Search.vue'),
    meta: {
      title: '通用查询',
    },
  },
  {
    path: '/WF/Frm',
    name: 'SingleFrm',
    component: () => import('/@/WF/Frm.vue'),
    meta: {
      title: '查看表单',
    },
  },
  {
    path: '/WF/MyFrm',
    name: 'SingleMyFrm',
    component: () => import('/@/WF/MyFrm.vue'),
    meta: {
      title: '查看表单',
    },
  },
  {
    path: '/WF/MyFLDealThread',
    name: 'SingleMMyFLDealThread',
    component: () => import('/@/WF/MyFLDealThread.vue'),
    meta: {
      title: '查看表单',
    },
  },

  {
    path: '/WF/WorkOpt/Batch/BatchWorkCheckModel',
    name: 'BatchWorkCheckModel',
    component: () => import('/@/WF/WorkOpt/Batch/BatchWorkCheckModel.vue'),
    meta: {
      title: '批处理',
    },
  },

  {
    path: '/WF/SJXFlowAth',
    name: 'SJXFlowAth',
    component: () => import('/@/App/SJXFlowAth.vue'),
    meta: {
      title: '数据项流程查看',
    },
  },
];
const SinglePages: AppRouteModule = {
  path: '/SinglePages',
  name: 'SinglePages',
  component: SinglePageLayout,
  redirect: '/',
  meta: {
    title: '单页面',
    hideMenu: true,
  },
  children: THIRDPART_SYSTEM_ROUTES,
};

export default SinglePages;
