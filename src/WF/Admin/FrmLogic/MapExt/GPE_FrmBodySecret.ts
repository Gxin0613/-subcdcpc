import { MapExt, MapExtAttr } from '../MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_FrmBodySecret extends PageBaseGroupEdit {
  constructor() {
    super('GPE_FrmBodySecret');
    this.PageTitle = '背景保密';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //对应的字段.
    //多选.
    await this.entity.InitDataForMapData('FrmBodySecret', this.GetRequestVal('PKVal'), 'None');

    //增加子页面.
    this.AddGroup('A', '背景保密'); //增加分组.
    this.Blank('None', '不设置', this.HelpUn);
    this.SingleTB('Text', '文本模式', 'Tag1', this.Text, '格式示例:@WebUser.No - @RDT - @WebUser.DeptName', 1);
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

  public readonly Text = `
  #### 帮助
  - 配置格式: @WebUser.No - @RDT - @WebUser.DeptName

  `;
}
