import { GenerAskFrm } from './GenerAskFrm';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_RecAddModel extends PageBaseGroupEdit {
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) return null;
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }
  }
  constructor() {
    super('GPE_RecAddModel');
    this.PageTitle = '记录增加模式';
  }

  Init() {
    this.entity = new GenerAskFrm(); //对应的类.
    this.KeyOfEn = 'RecAddModel'; //要编辑的字段.
    this.AddGroup('A', '按照微信');
    this.Blank('0', '增加一次', '一个微信ID只能增加一次');
    this.Blank('Day', '每天1次', '一个微信ID，每天可以填写一次.');
    this.Blank('Week', '每周1次', '一个微信ID，每周可，以填写一次.');
    this.Blank('Week2', '每2周', '一个微信ID，每2周，可以填写一次.');
    this.Blank('M', '每月', '一个微信ID，每月可以填写一次.');
    this.Blank('JD', '每极度', '一个微信ID，每季度可以填写一次.');
    this.Blank('HalfYear', '半年', '一个微信ID，每半年可以填写一次.');
    this.Blank('Year', '年度', '一个微信ID，每年可以填写一次.');
  }

  public readonly Desc0 = `
  #### 帮助
  - 关键字查询是接受用户输入一个关键字，在整个报表的显示列中使用like查询(外键、枚举、数值类型的除外)
  - 关键字搜索提示, 默认为:请输入关键字...
  #### 效果图
  -  ![输入图片说明](./resource/CCBill/SearchCond/SearchKey.png "屏幕截图.png")  
 `;
  public readonly Desc1 = `
  #### 帮助
  - 选择特定字段，在报表中根据 like 模糊查询
  #### 配置图
  ![输入图片说明](./resource/CCBill/SearchCond/StringSearchKeysetting.png "屏幕截图.png")  
  #### 效果图
  ![输入图片说明](./resource/CCBill/SearchCond/StringSearchKey.png "屏幕截图.png")  
  `;
}
