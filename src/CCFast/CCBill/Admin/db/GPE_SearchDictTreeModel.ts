import { FrmDict } from '/@/CCFast/CCBill/FrmDict';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';

export class GPE_SearchDictTreeModel extends PageBaseGroupEdit {
  constructor() {
    super('GPE_SearchDictTreeModel');
    this.PageTitle = '树结构';
  }
  async Init() {
    this.entity = new FrmDict(); //对应的实体类,就是要对这个实体的枚举值进行编辑.
    this.KeyOfEn = 'ShowColTree'; //要编辑的字段.
    //增加子页面.
    this.AddGroup('A', '树结构显示');
    this.Blank('0', '不显示', this.Desc0);
    this.SelectItemsByList('1', '显示指定的外键字段', this.Desc1, true, await this.GenerAttrs(), 'ColTree');
  }
  public async GenerAttrs() {
    const myattrs = new MapAttrs();
    await myattrs.Retrieve('FK_MapData', this.PKVal);

    const attrs = myattrs
      .filter((attr) => !!attr.UIVisible)
      .map((attr) => {
        return {
          Name: attr.Name,
          No: attr.KeyOfEn,
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
