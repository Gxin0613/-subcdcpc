import { MapExt, MapExtAttr } from '../MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_KeepSecret extends PageBaseGroupEdit {
  constructor() {
    super('GPE_KeepSecret');
    this.PageTitle = '保密格式';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //对应的字段.
    //多选.
    await this.entity.InitDataForMapAttr('KeepSecret', this.GetRequestVal('PKVal'), 'None');

    //增加子页面.
    this.AddGroup('A', '保密格式'); //增加分组.
    this.Blank('None', '不设置', this.Desc0);
    this.Blank('IDCard', '身份证格式', this.HelpUn);
    this.Blank('Tel', '手机号格式', this.HelpUn);
    this.Blank('Bank', '银行卡号', this.HelpUn);
  }

  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public async AfterSave(pageID: string, pageVal: any) {
    // if (pageID != 'None') {
    //   let pkval = this.GetRequestVal('PKVal');
    //   if (pkval.endsWith('_MultipleChoiceSearch')) pkval = pkval.replace('_MultipleChoiceSearch', '');
    //   const en = new MapAttr();
    //   const mypk = pkval;
    //   en.setPKVal(pkval + 'T');
    //   //插入一条对应的T字段
    //   if ((await en.RetrieveFromDBSources()) == 0) {
    //     en.setPKVal(mypk);
    //     await en.RetrieveFromDBSources();
    //     en.MyPK = en.MyPK + 'T';
    //     en.KeyOfEn = en.KeyOfEn + 'T';
    //     en.UIVisible = false;
    //     en.UIIsEnable = false;
    //     await en.Insert();
    //   }
    // }
    // if (pageID == pageVal) throw new Error('Method not implemented.');
  }

  public readonly Desc0 = `
  #### 帮助
   - 保密字段，在只读的情况下需要隐藏给那些用户.
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/MultipleChoiceSearch/Img/MultipleChoiceSearch.png "屏幕截图.png")
  `;
}
