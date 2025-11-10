import { GloWF } from '../../../GloWF';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { MapDtl } from '/@/WF/Admin/FrmLogic/MapDtl';

export class GPE_DtlDTSearchWay extends PageBaseGroupEdit {
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) return null;
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }
  }
  constructor() {
    super('GPE_DtlDTSearchWay');
    this.PageTitle = '日期查询';
  }

  Init() {
    this.entity = new MapDtl(); //对应的类.
    this.KeyOfEn = 'DTSearchWay'; //日期查询方式.

    this.AddGroup('A', '日期查询');
    this.Blank('0', '不启用', this.Desc0);
    const sql = GloWF.SQLOfGpeDTSearchWay(this.PKVal);
    //`SELECT KeyOfEn as No,Name FROM Sys_MapAttr
    // WHERE FK_MapData='${this.PKVal}' AND UIVisible=1
    //  AND (MyDataType=6 or MyDataType=7)  AND UIContralType=0 `;

    this.SelectItemsByList('1', '按日期查询', this.Desc0, true, sql, 'DTSearchKey', 'DTSearchKeyT');
    this.SelectItemsByList('2', '按日期时间查询', this.Desc1, true, sql, 'DTSearchKey', 'DTSearchKeyT');
    //this.Blank('1', '特定关键字查询', this.Desc1);
  }

  public readonly Desc0 = `
  #### 帮助
  - 按照选择的日期型字段进行查询。
  - 在报表中根据 like 日期字段值 进行查询。
  
  #### 效果图
  ![输入图片说明](./resource/CCBill/SearchCond/SearchKeyData.png "屏幕截图.png")  
 `;
  public readonly Desc1 = `
  #### 帮助
  - 按照选择的日期型字段进行查询。
  - 在报表中根据 like 日期时间值 进行查询。
  `;
}
