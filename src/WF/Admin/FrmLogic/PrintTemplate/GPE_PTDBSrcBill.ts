import { GloWF } from '../../GloWF';
import { PTDBSrcBill } from './PTDBSrcBill';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_PTDBSrcBill extends PageBaseGroupEdit {
  constructor() {
    super('GPE_PTDBSrcBill');
    this.PageTitle = '单据/实体:关联宿主表';
  }
  async Init() {
    this.entity = new PTDBSrcBill(); //对应的类.
    this.KeyOfEn = 'FrmRefPKModel'; //要编辑的字段.

    //增加子页面.
    this.AddGroup('A', '关联关系'); //增加分组.
    this.Blank('0', '不需要关联', this.Desc0);

    //const sql = ` SELECT KeyOfEn as No, Name FROM Sys_MapAttr WHERE FK_MapData='@FrmID' `;
    this.SelectItemsByList('1', '需要关联', this.Desc1, false, GloWF.SQLOfToFieldKey(), 'FrmRefPKAttrKey', 'FrmRefPKAttrName');
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }
  public readonly Desc0 = `
  #### 帮助
  - 选择的数据源是单据或者实体的时候.
 
  `;
  public readonly Desc1 = `
  #### 帮助
  

  `;
}
