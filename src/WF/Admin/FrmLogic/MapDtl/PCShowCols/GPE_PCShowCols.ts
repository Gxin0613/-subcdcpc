import { MapDtl, MapDtlAttr } from '../../MapDtl';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_PCShowCols extends PageBaseGroupEdit {
  constructor() {
    super('GPE_PCShowCols');
    this.PageTitle = '字段展现模式';
  }
  Init() {
    this.entity = new MapDtl(); //对应的类.
    this.KeyOfEn = MapDtlAttr.EditModel; //要修改的字段.

    //增加子页面.
    this.AddGroup('A', '展示模式'); //增加分组.
    this.Blank('0', '显示全部', this.Desc0);
    this.SingleTextArea('1', '显示部分字段', MapDtlAttr.ShowCols, '多个字段用逗号分开', this.Desc1);
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
