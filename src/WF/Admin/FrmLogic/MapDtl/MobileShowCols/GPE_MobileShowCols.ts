import { MapDtl, MapDtlAttr } from '../../MapDtl';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { GloWF } from '/@/WF/Admin/GloWF';

export class GPE_MobileShowCols extends PageBaseGroupEdit {
  constructor() {
    super('GPE_MobileShowCols');
    this.PageTitle = '字段展现模式';
  }
  Init() {
    this.entity = new MapDtl(); //对应的类.
    this.KeyOfEn = MapDtlAttr.MobileShowModel; //要修改的字段.

    //增加子页面.
    this.AddGroup('A', '展示模式'); //增加分组.
    this.Blank('0', '新页面展示', this.Desc0);
    this.Blank('1', '表格展示', this.Desc0);
    //this.SelectItemsByList('2', '列表展示', this.Desc1, true, GloWF.sqlFields(this.PKVal), MapDtlAttr.MobileShowField);
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }
    // throw new Error('Method not implemented.');
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) {
      //const idx = 1;
    }
  }

  public readonly Desc0 = `
  #### 帮助
  - 多个字段用逗号分开
  - 比如: File1,FIle2

  `;
  public readonly Desc1 = `
  #### 帮助
  - 多个字段用逗号分开
  - 比如: File1,FIle2

  ...`;
}
