import { MapDtl } from './MapDtl';
import { DataType } from '/@/bp/en/DataType';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_DtlVSTOEditModel extends PageBaseGroupEdit {
  constructor() {
    super('GPE_DtlVSTOEditModel');
    this.PageTitle = 'VSTO从表工作模式';
  }
  Init() {
    this.entity = new MapDtl(); //对应的类.
    this.KeyOfEn = 'VSTOEditModel'; //要修改的字段.
    //增加子页面.
    this.AddGroup('A', 'VSTO从表工作模式'); //增加分组.
    this.Blank('0', '普通类型展示', this.Desc0);
    this.SingleTB('1', '平铺从表展示', 'VSTOEditPara', this.Desc1, '输入平铺的从表数量，默认为2.', DataType.AppInt);
    this.SingleTB('2', '平铺从表子表展示', 'VSTOEditPara', this.Desc2, '输入平铺的从表子表数量，默认为2', DataType.AppInt);
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
  - excel中选中一个区域，插入从表，可记录多条数据。
  #### 图例
  - ![输入图片说明](./resource/WF/Admin/Vsto/1.png "普通类型展示")  
  `;

  public readonly Desc1 = `
  #### 帮助
  - excel中选中一个区域，插入从表，我们会根据从表平铺次数，自动在右侧扩充从表。
  #### 图例
  - ![输入图片说明](./resource/WF/Admin/Vsto/2.png "平铺从表展示")  
  `;

  public readonly Desc2 = `
  #### 帮助
  - 该模式针对从表带子表的情况，从表表头在左侧第一列竖排，从表子表表头在从表字段排完后向右横排。
  - 该模式下为了保证从表可填写，要确保从表的编辑模式为经典表单。
  #### 图例
  - ![输入图片说明](./resource/WF/Admin/Vsto/3.png "平铺从表子表展示") 
  - ![输入图片说明](./resource/WF/Admin/Vsto/4.png "编辑模式为经典表单") 
  `;
}
