import { MapDtl, MapDtlAttr } from '../../MapDtl';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_EditModel extends PageBaseGroupEdit {
  constructor() {
    super('GPE_EditModel');
    this.PageTitle = '编辑模式';
  }
  Init() {
    this.entity = new MapDtl(); //对应的类.
    this.KeyOfEn = MapDtlAttr.EditModel; //要修改的字段.

    //增加子页面.
    this.AddGroup('A', '展示模式'); //增加分组.
    this.Blank('0', '表格模式(默认)', this.Desc0);
    this.Blank('1', '经典表单', this.Desc1);
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }
    // throw new Error('Method not implemented.');
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) {
      //const idx = 1;
    }
  }

  public readonly Desc0 = `  
  #### 帮助
  - 使用表格的方式编辑数据，如下图.
  - 适用于列较少，数据量小，编辑简单直观. 
  #### 图例
  - 表格模式
  -
  `;
  public readonly Desc1 = `
  #### 帮助
  - 使用表单的方式编辑数据，如下图.
  - 适用于列较多，有孙表，编辑新建需要弹窗.  
  #### 列表图例
  - 点击红色的区域，新建与编辑.
  - 列表的数据都是只读的.
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapDtl/EditModel/Card1.png "表格模式")  
  #### 编辑图例
  - 从表就是一个新的表单.
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapDtl/EditModel/Card2.png "表格模式")  
  - 可以使用【保存并新建】，【删除】等操作.
  `;
  public readonly Desc2 = `
  #### 帮助
  - 同经典表单，只是表单的展示不同.

  
  `;
}
