import { FrmDict } from '../../FrmDict';
import { GloWF } from '/@/WF/Admin/GloWF';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_ListShowWay extends PageBaseGroupEdit {
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) return null;
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }
  }
  constructor() {
    super('GPE_ListShowWay');
    this.PageTitle = '展现方式';
  }

  Init() {
    this.entity = new FrmDict(); //对应的类.
    this.KeyOfEn = 'ListShowWay'; //要编辑的字段. ListShowWayKey

    this.AddGroup('A', '展现方式');
    this.Blank('0', '经典列表模式', this.Desc0);

    const sql = GloWF.SQLOfGpeListShowWay(this.PKVal);
    // `SELECT KeyOfEn as No,Name FROM Sys_MapAttr
    // WHERE FK_MapData='${this.PKVal}' AND UIVisible=1
    //  AND  (UIContralType=1 OR UIContralType=3) `;
    this.SelectItemsByList('1', '树干叶子模式', this.Desc1, false, sql, 'ListShowKey', '');
    this.Blank('2', '级联模式(未解析)', this.Desc0);
  }

  public readonly Desc0 = `
  #### 帮助
  - 展现方式,也称为数据的呈现方式.
  - 系统提供两种展现方式，经典列表模式与树干叶子模式.
  - 
 `;
  public readonly Desc1 = `
  #### 帮助
  - 请选择列表字段, 只有外键或者枚举，外部数据源字段才能出现在列表中.
  #### **效果图**
  ![输入图片说明](./resource/CCBill/SearchCond/ListShowWay.png "屏幕截图.png")
  `;
}
