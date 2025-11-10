import { GloWF } from '../../GloWF';
import { MapDtl } from '../MapDtl';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_IsBatchUpdate extends PageBaseGroupEdit {
  constructor() {
    super('GPE_IsBatchUpdate');
    this.PageTitle = '批量编辑规则';
  }
  Init() {
    this.entity = new MapDtl(); //对应的类.
    this.KeyOfEn = 'IsBatchUpdate'; //要修改的字段.

    //增加子页面.
    this.AddGroup('A', '批量编辑规则'); //增加分组.
    this.Blank('0', '不启用', this.Desc0);
    //const sql = `SELECT KeyOfEn AS No,Name From Sys_MapAttr WHERE FK_MapData='${this.RefPKVal}' AND UIVisible=1`;
    this.SelectItemsByList('1', '启用', this.Desc1, true, GloWF.SQLOfIsBatchUpdateAttrs(this.RefPKVal), 'IsBatchUpdateAttrs');
    //this.SingleTextArea('1', '启用', 'IsBatchUpdateAttrs', '多个字段用逗号分开', this.Desc1);
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
  - 不启用批量编辑

  `;
  public readonly Desc1 = `
  #### 帮助
  - 选择多个可以编辑的字段，批量处理的时候显示选择的字段
  ...`;
}
