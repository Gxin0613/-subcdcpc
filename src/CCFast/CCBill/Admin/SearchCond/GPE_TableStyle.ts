import { FrmBill } from '../../FrmBill';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_TableStyle extends PageBaseGroupEdit {
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) return null;
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }
  }
  constructor() {
    super('GPE_TableStyle');
    this.PageTitle = '表格内容展示形式';
  }

  Init() {
    this.entity = new FrmBill(); //对应的类.
    this.KeyOfEn = 'TableStyle'; //要编辑的字段.

    this.AddGroup('A', '表格内容展示类型');
    this.Blank('0', '不设置', this.Desc0);
    this.Blank('1', '表格内容提示框显示', this.Desc1);

    // const frmID = this.RefPKVal;
    // const sql = `SELECT KeyOfEn as No,Name FROM Sys_MapAttr WHERE FK_MapData='${frmID}' AND UIVisable=1 `;
    // this.SelectItemsByList('1', '特定关键字查询', this.Desc1, true, sql, '', '');
    //this.Blank('1', '特定关键字查询', this.Desc1);
  }

  public readonly Desc0 = `
  #### 帮助
  - 不设置：表格内容换行显示。
  #### 效果图
  ![输入图片说明](./resource/CCBill/SearchCond/TableNoSetting.png "屏幕截图.png") 
 `;
  public readonly Desc1 = `
  #### 帮助
  - 表格内容提示框显示:表格内容不进行换行,溢出隐藏,鼠标移入提示框显示表格内隐藏的内容.
  #### 效果图
  ![输入图片说明](./resource/CCBill/SearchCond/TableSetting.png "屏幕截图.png")  
  `;
}
