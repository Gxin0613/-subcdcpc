import { ClassFactory } from '../da/ClassFactory';
import { EnCfg } from './EnCfg';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_ShowCol extends PageBaseGroupEdit {
  constructor() {
    //构造方法里要输入类名,我们原则上需要 GPE_ 开头.
    //这个类要注册到 /Comm/UIEntity/ClassFactoryOfGroupPageEdit.ts 下.
    super('GPE_ShowCol');
    this.PageTitle = '显示列'; //GPE中文类名
  }
  async Init() {
    this.entity = new EnCfg(); //对应的实体类,就是要对这个实体的枚举值进行编辑.
    this.KeyOfEn = 'ShowColModel'; //要编辑的字段.
    //增加子页面.
    this.AddGroup('A', '显示列'); //增加分组.
    this.Blank('0', '所有的列', this.Desc0);
    this.SelectItemsByGroupList('1', '选择字段列', this.Desc1, true, await this.GenerGroups(), await this.GenerAttrs(), 'ShowCols');

    //this.SelectItemsByList('1', '指定的选择列', this.Desc1, true, await this.GenerAttrs(), 'ShowCols');
  }
  public async GenerGroups() {
    const en = await ClassFactory.GetEn(this.PKVal);
    const groups = en._enMap.attrs.groups.map((group) => {
      return {
        Name: group.key,
        No: group.name,
      };
    });
    return JSON.stringify(groups);
  }
  public async GenerAttrs() {
    const en = await ClassFactory.GetEn(this.PKVal);
    //.
    const attrs = en._enMap.attrs
      .filter((attr) => !!attr.UIVisible)
      .map((attr) => {
        return {
          Name: attr.Desc,
          No: attr.Key,
        };
      });
    //如何获取该实体的EnMap的 KeyOfEn, Name 两个属性生成json.返回过去.
    return JSON.stringify(attrs);
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
