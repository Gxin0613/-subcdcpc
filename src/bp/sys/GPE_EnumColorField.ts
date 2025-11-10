import { ClassFactory } from '../da/ClassFactory';
import { EnCfg } from './EnCfg';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_EnumColorField extends PageBaseGroupEdit {
  constructor() {
    //构造方法里要输入类名,我们原则上需要 GPE_ 开头.
    //这个类要注册到 /Comm/UIEntity/ClassFactoryOfGroupPageEdit.ts 下.
    super('GPE_EnumColorField');
    this.PageTitle = '枚举字段颜色'; //GPE中文类名
  }
  async Init() {
    this.entity = new EnCfg(); //对应的实体类,就是要对这个实体的枚举值进行编辑.
    this.KeyOfEn = 'IsEnableEnumColor'; //要编辑的字段.
    //增加子页面.
    this.AddGroup('A', '不启用'); //增加分组.
    this.Blank('0', '启用', this.Desc0);
    // const sql = 'SELECT No,Name FROM Port_Emp ';
    this.SelectItemsByList('1', '选择颜色枚举字段', this.Desc1, true, await this.GenerAttrs(), 'EnumColorField');
  }
  public async GenerAttrs() {
    const en = await ClassFactory.GetEn(this.PKVal);
    const attrs = en._enMap.attrs
      .filter((attr) => attr.IsEnum == true)
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
   - 对于枚举字段用不同的颜色显示出来.
`;
  public readonly Desc1 = `
  #### 帮助
  - 对于枚举字段用不同的颜色显示出来.
  - 选择的枚举字段就会标记颜色.
  `;
}
