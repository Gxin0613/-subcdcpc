import { MapExt, MapExtAttr } from '/@/WF/Admin/FrmLogic/MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { DataType } from '/@/bp/en/DataType';

export class GPE_EndLabEnum extends PageBaseGroupEdit {
  constructor() {
    super('GPE_EndLabEnum');
    this.PageTitle = '后置枚举选项';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //要编辑的字段.

    //特殊处理,初始化数据.
    await this.entity.InitDataForMapAttr('EndLabEnum', this.GetRequestVal('PKVal'));

    //增加子页面.
    this.AddGroup('A', '后置枚举选项'); //增加分组.
    this.Blank('0', '不启用', this.Desc1);
    //找出除自身以外显示状态的只读的文本类型的字段
    this.SingleTB('1', '启用', MapExtAttr.Doc, this.Desc1, '人民币,美元,欧元', DataType.AppString);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly Desc1 = `
  #### 后缀提示
  - 人民币,美元,欧元
  - 吨,公斤,千克,克
  - 
  #### 配置项存储
  - Sys_MapExt
  - 
  #### 数据存储
  - AtPara里面.
  - xxx
   `;
}
