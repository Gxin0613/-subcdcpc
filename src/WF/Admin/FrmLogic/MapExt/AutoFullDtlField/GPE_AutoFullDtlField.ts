import { MapExt, MapExtAttr } from '/@/WF/Admin/FrmLogic/MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { GPEAutoFullDtlField } from './GPEAutoFullDtlField';

export class GPE_AutoFullDtlField extends PageBaseGroupEdit {
  constructor() {
    super('GPE_AutoFullDtlField');
    this.PageTitle = '对从表列求值';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //要编辑的字段.

    //特殊处理,初始化数据.
    await this.entity.InitDataForMapAttr('NumEnterLimit', this.GetRequestVal('PKVal'));

    //增加子页面.
    this.AddGroup('A', '对从表列求值'); //增加分组.
    this.Blank('0', '不启用', this.Desc0);
    this.AddEntity('1', '启用设置', new GPEAutoFullDtlField(), this.Desc1);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly Desc0 = `
  #### 帮助
   - 不启用：不对主表字段进行从表列的数学计算。
   - 对从表列求值：当前是主表字段，对从表的列进行求和、平均、最大、最小计算. 
  #### 效果图
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/AutoFullDtlField/Img/AutoFull.png "屏幕截图.png") 
  `;
  public readonly Desc1 = `

  #### 帮助
  - 当前是主表字段，对从表的列进行求和、平均、最大、最小计算.  
  - 点击设置进入详细设置.
  - 配置图例1
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/AutoFullDtlField/Img/AutoFullBiaodan.png "屏幕截图.png") 
  - 配置图例2
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/AutoFullDtlField/Img/AutoFullBiaodan2.png "屏幕截图.png") 

  - 运行图例
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/AutoFullDtlField/Img/AutoFull.png "屏幕截图.png") 

  `;
}
