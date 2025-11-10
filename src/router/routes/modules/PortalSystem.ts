import type { AppRouteModule } from '/@/router/types';

const rptPortal: AppRouteModule = {
  path: '/portal',
  name: 'Root',
  component: () => import('/@/CCFast/components/RptWhitePortal.vue'),
  redirect: '/portal/rptContent',
  meta: {
    Icon: 'icon-grid',
    title: '门户系统',
    hideChildrenInMenu: true,
    hideMenu: true,
  },
  children: [
    {
      path: 'rptContent',
      name: 'RptContent',
      component: () => import('/src/CCFast/components/RptContent.vue'),
      meta: {
        title: '门户内容',
      },
    },
    {
      path: 'rptWhite',
      name: 'RptWhite',
      component: () => import('/src/CCFast/components/RptWhite.vue'),
      meta: {
        title: '设计门户',
      },
    },
    {
      path: 'GL/PtCC',
      name: 'GLPtCC',
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: '抄送',
        EnName: 'GL_CC',
      },
    },
    {
      path: 'GL/PtStart',
      name: 'GLPtStart',
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: '发起',
        EnName: 'GL_Start',
      },
    },
    {
      path: 'GL/PtTodoList',
      name: 'GLPtTodoList',
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: '待办',
        EnName: 'GL_Todolist',
      },
    },
    {
      path: 'GL/PtDraft',
      name: 'GLPtDraft',
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: '草稿',
        EnName: 'GL_Draft',
      },
    },
    {
      path: 'GL/PtRunning',
      name: 'GLPtRunning',
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: '在途',
        EnName: 'GL_Runing',
      },
    },
    {
      path: 'GL/PtRecent',
      name: 'GLPtRecent',
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: '近期',
        EnName: 'GL_RecentWork',
      },
    },
    {
      path: 'GL/PtMsg',
      name: 'GLPtMessage',
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: '消息列表',
        EnName: 'GL_Msg',
      },
    },
    {
      path: 'GL/PtComplete',
      name: 'GL_PtComplete',
      component: () => import('/@/WF/views/GenerList.vue'),
      meta: {
        title: '已完成',
        EnName: 'GL_Complete',
      },
    },

  ],
};

export default rptPortal;
