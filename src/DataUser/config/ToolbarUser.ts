import { reactive } from 'vue';
import WebUser from '/@/bp/web/WebUser';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();
//单据跳转页面
//start
const isSaaS = (url) => {
  let linkUrl = url + '?PKVal=' + WebUser.No;
  if (WebUser.CCBPMRunModel == CCBPMRunModel.SAAS) {
    linkUrl += '_' + WebUser.OrgNo;
  }
  return linkUrl;
};
//end

interface MenuList {
  No: string;
  Name: string;
  Url: string;
  FileUrl: string;
  Path: string;
  Paras: string;
  Icon: string;
  Enable: number;
  ShowBadge: boolean;
}
const menuListLeft = reactive<MenuList[]>([
  {
    No: 'GL_Start',
    Name: '发起',
    Url: '/WF/GL/Start',
    FileUrl: '/src/WF/views/GenerList.vue',
    Path: 'GenerList',
    Paras: '?EnName=GL_Start',
    Icon: 'icon-paper-plane',
    Enable: 1,
    ShowBadge: false,
  },
  {
    No: 'GL_Todolist',
    Name: '待办',
    Url: '/WF/GL/Todolist',
    FileUrl: '/src/WF/views/GenerList.vue',
    Path: 'GenerList',
    Paras: '?EnName=GL_Todolist',
    Icon: 'icon-clock',
    Enable: 1,
    ShowBadge: true,
  },
  {
    No: 'GL_Runing',
    Name: '在途',
    Url: '/WF/GL/Running',
    FileUrl: '/src/WF/views/GenerList.vue',
    Path: 'GenerList',
    Paras: '?EnName=GL_Runing',
    Icon: 'icon-hourglass',
    Enable: 1,
    ShowBadge: false,
  },
  {
    No: 'GL_Recent',
    Name: '近期',
    Url: '/WF/GL/Recent',
    FileUrl: '/src/WF/views/GenerList.vue',
    Path: 'GenerList',
    Paras: '?EnName=GL_Recent',
    Icon: 'icon-envelope',
    Enable: 1,
    ShowBadge: false,
  },
  {
    No: 'GL_Complete',
    Name: '已完成',
    Url: '/WF/GL/Complete',
    FileUrl: '/src/WF/views/GenerList.vue',
    Path: 'GenerList',
    Paras: '?EnName=GL_Complete',
    Icon: 'icon-check',
    Enable: 1,
    ShowBadge: false,
  },
  {
    No: 'GL_CC',
    Name: '抄送',
    Url: '/WF/GL/CC',
    FileUrl: '/src/WF/views/GenerList.vue',
    Path: 'GenerList',
    Paras: '?EnName=GL_CC',
    Icon: 'icon-bag',
    Enable: 1,
    ShowBadge: true,
  },
  {
    No: 'GL_Draft',
    Name: '草稿',
    Url: '/WF/GL/Draft',
    FileUrl: '/src/WF/views/GenerList.vue',
    Path: 'GenerList',
    Paras: '?EnName=GL_Draft',
    Icon: 'icon-note',
    Enable: 0,
    ShowBadge: false,
  },
  {
    No: 'GL_Focus',
    Name: '收藏',
    Url: '/WF/GL/Focus',
    FileUrl: '/src/WF/views/GenerList.vue',
    Path: 'GenerList',
    Paras: '?EnName=GL_Focus',
    Icon: 'icon-star',
    Enable: 0,
    ShowBadge: false,
  },
  {
    No: 'Bill',
    Name: '单据',
    Url: isSaaS('/WF/GL/GenerBill'),
    FileUrl: '/src/WF/Comm/En.vue',
    Path: 'En',
    Paras: '?EnName=TS.Bill.&PKVal=admin',
    Icon: 'icon-notebook',
    Enable: 1,
    ShowBadge: false,
  },
  {
    No: 'AskFrm',
    Name: '活动',
    Url: isSaaS('/WF/AskFrm'),
    FileUrl: '/src/WF/Comm/En.vue',
    Path: 'En',
    Paras: '?EnName=TS.CCBill.AskFrmSetting&PKVal=admin',
    Icon: 'icon-feed',
    Enable: 1,
    ShowBadge: true,
  },
]);

export default menuListLeft;

// {"@EnName=GL_Focus,GL_Draft,GL_CC,GL_Complete
//   @Title=收藏,草稿,抄送,已完成
//   @Icon=icon-check,icon-bag,icon-note,icon-star
//   @Idx=5,6,7,8"}
// let newMenuListLeft = reactive<MenuList[]>([]);
// export default async function getMenuListLeft(): Promise<MenuList[]> {
//   try {
//     const en = new MySetting(WebUser.No);
//     await en.RetrieveFromDBSources();
//     const list = en.GetParaString('EnName').split(',');
//     menuListLeft.forEach((item) => {
//       item.Enable = list.includes(item.No) || item.No === 'Bill' ? 1 : 0;
//     });
//     return menuListLeft;
//   } catch (e: any) {
//     message.error(e);
//     throw e; // 抛出错误，使 Promise 被拒绝
//   }
// }
