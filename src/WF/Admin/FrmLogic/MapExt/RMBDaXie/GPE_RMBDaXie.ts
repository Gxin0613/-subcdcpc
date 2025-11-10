import { GloWF } from '../../../GloWF';
import { MapExt, MapExtAttr } from '/@/WF/Admin/FrmLogic/MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_RMBDaXie extends PageBaseGroupEdit {
  constructor() {
    super('GPE_RMBDaXie');
    this.PageTitle = '人民币大写';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //要编辑的字段.

    //特殊处理,初始化数据.
    await this.entity.InitDataForMapAttr('RMBDaXie', this.GetRequestVal('PKVal'));

    //增加子页面.
    this.AddGroup('A', '人民币大写'); //增加分组.
    this.Blank('0', '不启用', this.Desc0);

    //找出除自身以外显示状态的只读的文本类型的字段
    //const sql = `SELECT KeyOfEn as No, Name FROM Sys_MapAttr WHERE FK_MapData='@FK_MapData' AND UIVisible=1 AND UIIsEnable = 0 AND MyDataType=1`;
    this.SingleDDLSQL('1', '选择只读的人民币大写字段', MapExtAttr.Tag, this.Desc0, GloWF.SQLOfRMBDaXie, false);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly Desc0 = `
  #### 帮助
   - 定义：当前输入金额类型的数据，要实现对其他只读的文本框进行大写输出（在一个金额类型或者数值类型的字段输入时自动在另外一个文本框上显示该输入值的人民币大写.）。
   - 设置过程: 1.创建一个大写输出的文本框;2.设置只读状态;3.在需要转大小写的字段上点击属性;4.设置人民币大写.
   - 比如: **合同付款金额**需要转人民币大写，就可以在**合同付款金额**的字段属性中 => 基本设置 => 人民币大写 => 选择只读的人民币大写字段，选择输出人民币大写的字段点击保存即可。
   - 应用场景：银行、单位和个人在填写各种票据和结算凭证时必须遵守严格的标准和规范.
   #### 效果图
   - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/RMBDaXie/Img/RMBDaXieyanshi.png "屏幕截图.png") 

   ### 配置图
   - 配置图例1
   - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/RMBDaXie/Img/RMBDaXie2.png "屏幕截图.png") 
   - 配置图例2
   - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/RMBDaXie/Img/RMBDaXie1.png "屏幕截图.png") 
   - 配置图例3
   - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/RMBDaXie/Img/RMBDaXie.png "屏幕截图.png") 
   - 运行图例
   ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/RMBDaXie/Img/RMBDaXieyanshi.png "屏幕截图.png") 
 
   `;

  public readonly Desc1 = `
  #### 帮助
   - 不启用：不对其他文本框实现大写转换.
   - 人民币大写：当前输入金额类型的数据，要实现对其他只读的文本框进行大写输出。
  #### 效果图
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/RMBDaXie/Img/RMBDaXieyanshi.png "屏幕截图.png") 
  `;
}
