import { MapExt, MapExtAttr } from '/@/WF/Admin/FrmLogic/MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_FieldInputStyle extends PageBaseGroupEdit {
  constructor() {
    super('GPE_FieldInputStyle');
    this.PageTitle = '数值输入样式';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //要编辑的字段.

    //特殊处理,初始化数据.
    await this.entity.InitDataForMapAttr('FieldInputStyle', this.GetRequestVal('PKVal'));
    //增加子页面.
    this.AddGroup('A', '数值输入样式'); //增加分组.
    this.Blank('0', '手动输入', this.Desc0);
    this.Blank('1', '左右增减', this.Desc0);
    this.Blank('2', '上下按钮增减', this.Desc0);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly Desc0 = `
  #### 帮助
   - 数值输入样式:提供两种种输入样式，上下按钮增减和左右加减。
   - 一般用于数值类型的字段,比如:请假天数，采购数量等的处理字段.
   - 此功能金额类型字段除外。
  #### 运行图例
  - 上下按钮增减：光标移到当前字段时，显示上下按钮增减
   ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/FieldInputStyle/Img/FieldInputStyle1.png "屏幕截图.png") 
  - 左右增减
   ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/FieldInputStyle/Img/FieldInputStyle2.png "屏幕截图.png") 
  

  `;
}
