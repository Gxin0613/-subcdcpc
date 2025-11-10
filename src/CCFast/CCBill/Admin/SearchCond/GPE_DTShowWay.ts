import { FrmDict } from '../../FrmDict';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_DTShowWay extends PageBaseGroupEdit {
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) return null;
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }
  }
  constructor() {
    super('GPE_DTShowWay');
    this.PageTitle = '日期展示方式';
  }

  Init() {
    this.entity = new FrmDict(); //对应的类.
    this.KeyOfEn = 'DTShowWay'; //日期查询方式.

    this.AddGroup('A', '日期查询格式');
    this.Blank('0', '字段方式（日期从，到）', this.Desc0);
    this.Blank('1', '日期Tab页（月份、季度、年度）', this.Desc0);
    this.Blank('2', '日期Tab页（月份、季度、年度、自定义）(未解析)', this.Desc0);
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
