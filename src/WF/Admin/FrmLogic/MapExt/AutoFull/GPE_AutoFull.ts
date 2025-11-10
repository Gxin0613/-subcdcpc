import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { DataType } from '/@/bp/en/DataType';
import { MapExt, MapExtAttr } from '../../MapExt';
import { MapAttr } from '../../MapAttrs/MapAttr';

export class GPE_AutoFull extends PageBaseGroupEdit {
  constructor() {
    super('GPE_AutoFull');
    this.PageTitle = '自动计算';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //要编辑的字段.

    //初始化数据
    const mypk = this.GetRequestVal('PKVal');
    const mapAttr = new MapAttr(mypk);
    await mapAttr.Retrieve();
    const mapExt = new MapExt();
    const pix = 'AutoFull';
    mapExt.MyPK = mapAttr.MyPK + '_' + pix;
    if ((await mapExt.RetrieveFromDBSources()) == 0) {
      mapExt.FK_MapData = mapAttr.FK_MapData;
      mapExt.DoWay = 0;
      mapExt.ExtType = pix;
      mapExt.AttrOfOper = mapAttr.KeyOfEn;
      mapExt.Tag1 = 1;
      await mapExt.Insert();
    }
    this.entity = mapExt;

    //增加子页面.
    this.AddGroup('A', '自动计算'); //增加分组.
    this.Blank('0', '禁用', this.Desc1);
    this.SingleTB('1', '启用自动计算', MapExtAttr.Tag, this.Desc2, '格式:@DanJia*@JinE', DataType.AppString);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }
  public readonly Desc1 = ` 
  #### 帮助
  说明：自动计算就是对字段之前进行数学基本计算。可以对主表的字段进行计算，也可以对从表的字段进行计算。
  #### 应用场景
  定货时，有单位，有数量，自动求合计。
  #### 效果图
   - 主表计算-效果图
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/AutoFull/Img/AutoFullzhuyanshi.png "屏幕截图.png") 
   - 从表计算-效果图
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/AutoFull/Img/AutoFullcongBiaodan.png "屏幕截图.png")  
  `;

  public readonly Desc2 = ` 
  #### 帮助
  1. 如果是主表: 就是主表字段之间的计算，比如: @A+@B
  2. 如果是从表: 表达式就是列之间的计算,比如: @DanJia*@ShuLiang
  3. 仅仅支持数值类型的计算，比如：float,int,decimal类型的数据字段。
  4. 字段表达式不区分大小写，比如: @DanJia*@ShuLiang与@danjia*@shuliang是一样的
  #### 主表自动计算-图例
  - 配置图例1
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/AutoFull/Img/AutoFullzhu.png "屏幕截图.png") 
  - 配置图例2
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/AutoFull/Img/AutoFullzhu1.png "屏幕截图.png") 
  - 运行效果图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/AutoFull/Img/AutoFullzhuyanshi.png "屏幕截图.png") 
  #### 从表自动计算-图例

  - 配置图例
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/AutoFull/Img/AutoFullCong1.png "屏幕截图.png") 


  - 运行效果图
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/AutoFull/Img/AutoFullcongBiaodan.png "屏幕截图.png") 
....`;
}
