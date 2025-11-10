import { FrmDict } from '../../FrmDict';
import { GloWF } from '/@/WF/Admin/GloWF';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_DTSearchWay extends PageBaseGroupEdit {
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) return null;
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }
  }
  constructor() {
    super('GPE_DTSearchWay');
    this.PageTitle = '日期查询';
  }

  Init() {
    this.entity = new FrmDict(); //对应的类.
    this.KeyOfEn = 'DTSearchWay'; //日期查询方式.

    this.AddGroup('A', '日期查询');
    this.Blank('0', '不启用', this.Desc0);
    this.Blank('1', '所有日期字段查询', this.Desc0);
    const sql = GloWF.SQLOfGpeDTSearchWay(this.PKVal);
    this.SelectItemsByList('2', '按指定的日期字段查询', this.Desc1, true, sql, 'DTSearchKey', '');
  }

  public readonly Desc0 = `
  #### 帮助
  - 按照选择的日期型字段进行查询。
  
  #### 效果图
  ![输入图片说明](./resource/CCBill/SearchCond/SearchKeyData.png "屏幕截图.png")  
 `;
  public readonly Desc1 = `
  #### 帮助
  - 按照选择的日期型字段进行查询。
  `;
}
