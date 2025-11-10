import { reactive } from 'vue';
import WebUser from '/@/bp/web/WebUser';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
interface MenuItem {
  No: string;
  Name: string;
  Icon: string;
  Enable: number;
}

interface MenuAdmin {
  menuList: MenuItem[];
  GroupMenuList?: MenuItem[]; // 可选属性
}
const menuUser = reactive<MenuAdmin>({
  menuList: [
    {
      No: 'toMiddle',
      Name: '切换中间件模式',
      Icon: 'tabler:directions',
      Enable: 1,
    },
    {
      No: 'toMobile',
      Name: '切换到移动端',
      Icon: 'tabler:device-mobile',
      Enable: 1,
    },
    {
      No: 'mySetting',
      Name: '我的设置',
      Icon: 'ion:settings-outline',
      Enable: 1,
    },
    // {
    //   No: 'Multilingual',
    //   Name: '多语言',
    //   Icon: ' icon-globe',
    //   Enable: 1,
    // },
    {
      No: 'doc',
      Name: '文档',
      Icon: 'ion:document-text-outline',
      Enable: 1,
    },
  ],
});

//集团版显示
const GroupMenuList = reactive([
  {
    No: 'changeOrgAdmin',
    Name: '管理组织(AdminOnly)',
    Icon: 'ion:settings-outline',
    Enable: 0,
  },
  {
    No: 'changeDept',
    Name: '切换部门',
    Icon: 'ion:ios-shuffle',
    Enable: 1,
  },
]);
if (WebUser.CCBPMRunModel == CCBPMRunModel.GroupInc) {
  menuUser.GroupMenuList = GroupMenuList;
}

export default menuUser;
