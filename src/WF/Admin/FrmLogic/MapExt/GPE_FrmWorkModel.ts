import { MapExt, MapExtAttr } from '../MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_FrmWorkModel extends PageBaseGroupEdit {
  constructor() {
    super('GPE_FrmWorkModel');
    this.PageTitle = '工作模式';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //对应的字段.
    //多选.
    await this.entity.InitDataForMapData('FrmWorkModel', this.GetRequestVal('PKVal'), 'None');

    //增加子页面.
    this.AddGroup('A', '工作模式'); //增加分组.
    this.Blank('None', '常规模式', this.HelpUn);

    this.AddGroup('B', '操作人同期模式'); //增加分组.
    this.Blank('D1Year', '年度同期模式', this.HelpUn);
    this.Blank('D2JD', '季度同期模式', this.HelpUn);
    this.Blank('D2Month', '月份同期模式', this.HelpUn);
    //    this.SingleTB('Text', '文本模式', 'Tag1', this.Text, '格式示例:@WebUser.No - @RDT - @WebUser.DeptName', 1);
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
