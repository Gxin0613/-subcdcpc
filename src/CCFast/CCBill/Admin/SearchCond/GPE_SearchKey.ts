import { FrmDict } from '../../FrmDict';
import { GloWF } from '/@/WF/Admin/GloWF';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_SearchKey extends PageBaseGroupEdit {
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) return null;
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }
  }
  constructor() {
    super('GPE_SearchKey');
    this.PageTitle = '关键字查询';
  }

  Init() {
    this.entity = new FrmDict(); //对应的类.
    this.KeyOfEn = 'IsSearchKey'; //要编辑的字段.
    this.AddGroup('A', '关键字查询');
    this.Blank('0', '不启用', this.Desc0);
    this.Blank('1', '关键字查询', this.Desc1);
    const sql = GloWF.SQLOfGpeSearchKey(this.PKVal);
    this.SelectItemsByList('2', '特定关键字查询', this.Desc2, true, sql, 'StringSearchKeys', 'StringSearchKeysT');
  }

  public readonly Desc0 = `
  #### 帮助
  - 禁用关键字查询功能。
  - 对应实体列表页面将隐藏关键字搜索框。
  #### 效果图
  -  ![输入图片说明](./resource/CCBill/SearchCond/SearchKeyOff.png "屏幕截图.png")  
 `;
  public readonly Desc1 = `
  #### 帮助
  - 关键字查询功能支持用户输入一个关键词，对实体中所有显示列执行模糊匹配（LIKE查询）。**该功能自动排除外键字段、枚举类型字段及数值型字段**，仅适用于文本类内容的检索。
  - 搜索框默认提示文本为：“请输入关键字…”。
  #### 效果图
  -  ![输入图片说明](./resource/CCBill/SearchCond/SearchKey.png "屏幕截图.png")  
 `;
  public readonly Desc2 = `
  #### 帮助
  - **字段选择**：勾选一个或多个文本类型字段作为查询条件；
  - **模糊搜索**：在某个字段的搜索框输入内容，点击查询按钮后系统将对此字段执行模糊匹配（LIKE查询）。
  #### 配置图
  ![输入图片说明](./resource/CCBill/SearchCond/StringSearchKeysetting.png "屏幕截图.png")  
  #### 效果图
  ![输入图片说明](./resource/CCBill/SearchCond/StringSearchKey.png "屏幕截图.png")  
  `;
}
