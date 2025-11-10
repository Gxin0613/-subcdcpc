import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';

const wf: AppRouteModule = {
  path: '/WF',
  name: 'WF',
  component: LAYOUT,
  redirect: '/WF/MyFlow',
  meta: {
    orderNo: 30,
    icon: 'ion:layers-outline',
    title: '流程',
    hideMenu: true,
  },

  children: [
    {
      path: 'MyFlow',
      name: 'S_MyFlow',
      component: () => import('/@/WF/MyFlow.vue'),
      meta: {
        title: '发起流程',
      },
    },
    {
      path: 'MyFlowGener',
      name: 'S_MyFlowGener',
      component: () => import('/@/WF/MyFlowGener.vue'),
      meta: {
        title: '发起流程',
      },
    },
    {
      path: 'MyView',
      name: 'S_MyView',
      component: () => import('/@/WF/MyView.vue'),
      meta: {
        title: '流程查看',
      },
    },
    {
      path: '/FlowAth',
      name: 'S_FlowAth',
      component: () => import('/@/App/FlowAth.vue'),
      meta: {
        title: '流程查看',
      },
    },
    {
      path: 'MyViewGener',
      name: 'S_MyViewGener',
      component: () => import('/@/WF/MyViewGener.vue'),
      meta: {
        title: '流程查看',
      },
    },
    {
      path: 'MyCC',
      name: 'S_MyCC',
      component: () => import('/@/WF/MyCC.vue'),
      meta: {
        title: '流程抄送',
      },
    },
    {
      path: 'MyCCGener',
      name: 'S_MyCCGener',
      component: () => import('/@/WF/MyCCGener.vue'),
      meta: {
        title: '流程抄送',
      },
    },
    {
      path: 'MyCCTree',
      name: 'S_MyCCTree',
      component: () => import('/@/WF/MyCCTree.vue'),
      meta: {
        title: '抄送',
      },
    },
    {
      path: 'MyCCSelfForm',
      name: 'S_MyCCSelfForm',
      component: () => import('/@/WF/MyCCSelfForm.vue'),
      meta: {
        title: '抄送表单',
      },
    },
    {
      path: 'MyFlowTree',
      name: 'S_MyFlowTree',
      component: () => import('/@/WF/MyFlowTree.vue'),
      meta: {
        title: '树形流程',
      },
    },
    {
      path: 'MyFlowSelfForm',
      name: 'S_MyFlowSelfForm',
      component: () => import('/@/WF/MyFlowSelfForm.vue'),
      meta: {
        title: '树形流程',
      },
    },
    {
      path: 'FrmDBGener',
      name: 'S_FrmDBGener',
      component: () => import('/@/WF/CCForm/FrmDBGener.vue'),
      meta: {
        title: '数据版本',
      },
    },
    {
      path: 'GL/Start',
      name: 'GLStart',
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: '发起',
        EnName: 'GL_Start',
      },
    },
    {
      path: 'GL/TodoList',
      name: 'GLTodoList',
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: '待办',
        EnName: 'GL_Todolist',
      },
    },
    {
      path: 'GL/Draft',
      name: 'GLDraft',
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: '草稿',
        EnName: 'GL_Draft',
      },
    },
    {
      path: 'GL/Focus',
      name: 'GLFocus',
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: '收藏',
        EnName: 'GL_Focus',
      },
    },
    {
      path: 'GL/Running',
      name: 'GLRunning',
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: '在途',
        EnName: 'GL_Runing',
      },
    },
    {
      path: 'GL/Recent',
      name: 'GLRecent',
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: '近期',
        EnName: 'GL_RecentWork',
      },
    },
    {
      path: 'GL/GenerBill',
      name: 'GenerBill',
      component: () => import('/@/WF/Comm/En.vue'),
      meta: {
        title: '单据',
        EnName: 'TS.CCBill.BillSetting',
      },
    },
    {
      path: 'AskFrm',
      name: 'W_AskFrm',
      component: () => import('/@/WF/Comm/En.vue'),
      meta: {
        title: '活动',
        EnName: 'TS.CCBill.AskFrmSetting',
      },
    },
    {
      path: 'GL/System',
      name: 'GLSystem',
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: '低代码',
        EnName: 'GL_System',
      },
    },
    {
      path: 'GL/Msg',
      name: 'GLMessage',
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: '消息列表',
        EnName: 'GL_Msg',
      },
    },
    {
      path: 'GL/CC',
      name: 'GLCC',
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: '抄送列表',
        EnName: 'GL_CC',
      },
    },
    {
      path: 'GL/TSDemo',
      name: 'GLTSDemo',
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: '抄送列表',
        EnName: 'GL_TSClassDemo',
      },
    },
    {
      path: 'GL/SelectDeptLogin',
      name: 'GL_SelectDeptLogin',
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: '切换部门',
        EnName: 'GL_SelectDeptLogin',
      },
    },
    {
      path: 'GL/Complete',
      name: 'GL_Complete',
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: '已完成',
        EnName: 'GL_Complete',
      },
    },

    // WF/GL/Start
    // GenerList?xxxx
    // WF/GL?xxxx=xxx
  ],
};

export default wf;
