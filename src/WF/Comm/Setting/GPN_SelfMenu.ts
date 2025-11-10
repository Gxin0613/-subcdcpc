import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import WebUser from '/@/bp/web/WebUser';
import { MySetting } from './MySetting';
export class GPN_SelfMenu extends PageBaseGroupNew {
  constructor() {
    super('GPN_SelfMenu');
    this.PageTitle = '常用菜单';
  }

  public async Init() {
    this.SelectItemsByList('SelfMenu', '常用菜单', this.Docs0, true, this.getSelfMenu);
  }

  public async getSelfMenu() {
    //获得数据源.
    const list = [
      {
        No: 'GL_Start',
        Name: '发起',
        Icon: 'icon-paper-plane',
        Idx: 1,
      },
      {
        No: 'GL_Todolist',
        Name: '待办',
        Icon: 'icon-clock',
        Idx: 2,
      },
      {
        No: 'GL_Runing',
        Name: '在途',
        Icon: 'icon-hourglass',
        Idx: 3,
      },
      {
        No: 'GL_Recent',
        Name: '近期',
        Icon: 'icon-envelope',
        Idx: 4,
      },
      {
        No: 'GL_Complete',
        Name: '已完成',
        Icon: 'icon-check',
        Idx: 5,
      },
      {
        No: 'GL_CC',
        Name: '抄送',
        Icon: 'icon-bag',
        Idx: 6,
      },
      {
        No: 'GL_Draft',
        Name: '草稿',
        Icon: 'icon-note',
        Idx: 7,
      },
      {
        No: 'GL_Focus',
        Name: '收藏',
        Icon: 'icon-star',
        Idx: 8,
      },
    ];
    return JSON.stringify(list);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, _1: string, _2: string, _3: string, _4: string) {
    const glArray = _2.split(',');
    const menuList = JSON.parse(await this.getSelfMenu());
    const result = menuList
      .filter((item) => glArray.includes(item.No))
      .map((item) => ({
        icon: item.Icon,
        idx: item.Idx,
      }));

    const icons = result.map((item) => item.icon).join(',');
    const idxs = result.map((item) => item.idx).join(',');
    if (pageNo === 'SelfMenu') {
      const en = new MySetting(WebUser.No);
      await en.RetrieveFromDBSources();
      en.SetPara('EnName', _2);
      en.SetPara('Title', _3);
      en.SetPara('Icon', icons);
      en.SetPara('Idx', idxs);
      // en.DelPara('EnName');
      // en.DelPara('Title');
      // en.DelPara('Icon');
      // en.DelPara('Idx');
      await en.Update();
      //修改后刷新页面
      window.location.reload();
      return;
    }
  }
  // 按表单字段计算
  public readonly Docs0 = `
  #### 帮助
  - 低代码顶部左侧菜单展示.
  - 如果不选择，显示默认配置，如果选择最少选择一个.
  #### 运行图例
  ![输入图片说明](./resource/WF/Comm/Setting/default.png "屏幕截图.png")  
  ![输入图片说明](./resource/WF/Comm/Setting/allocate.png "屏幕截图.png")  
  - .

`;
}
