import { ClassFactory } from '../da/ClassFactory';
import { EnCfg } from './EnCfg';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_HideMethod extends PageBaseGroupEdit {
  constructor() {
    super('GPE_HideMethod');
    this.PageTitle = '隐藏方法'; //GPE中文类名
  }
  async Init() {
    this.entity = new EnCfg(); //对应的实体类,就是要对这个实体的枚举值进行编辑.
    this.KeyOfEn = this.GetRequestVal('KeyOfEn'); //要编辑的字段.
    //增加子页面.
    this.AddGroup('A', '隐藏方法'); //增加分组.
    this.Blank('0', '不隐藏', this.Desc0);
    this.SelectItemsByGroupList('1', '隐藏指定的方法', this.Desc1, true, await this.GenerGroups(), await this.GenerAttrs(), this.GetRequestVal('SaveToAttr'));
  }
  public async GenerGroups() {
    debugger
    const en = await ClassFactory.GetEn(this.PKVal);
    const groups = Array.from(new Set(en.EnMap.rms.map((rm) => rm.GroupName))).map((groupName) => {
      return {
        No: groupName,
        Name: groupName,
      };
    });
    return JSON.stringify(groups);
  }
  public async GenerAttrs() {
    const en = await ClassFactory.GetEn(this.PKVal);
    const rms = en.EnMap.rms.map((rm) => {
      return {
        Name: rm.Title,
        No: rm.Title,
        GroupNo: rm.GroupName,
      };
    });
    return JSON.stringify(rms);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly Desc0 = `
  #### 帮助
   - 显示所有的列.
   - 这些列是按照实体的Attr是否可见与顺序决定的.
`;
  public readonly Desc1 = `
  #### 帮助
  - 选择要显示的列.
  - 系统列出的是所有可以显示的列.
  `;
}
