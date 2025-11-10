import { MapExt, MapExtAttr } from '/@/WF/Admin/FrmLogic/MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { GPEReqDays } from './GPEReqDays';

export class GPE_ReqDays extends PageBaseGroupEdit {
  constructor() {
    super('GPE_ReqDays');
    this.PageTitle = '求两个日期之差';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //要编辑的字段.

    //特殊处理,初始化数据.
    await this.entity.InitDataForMapAttr('ReqDays', this.GetRequestVal('PKVal'));

    //增加子页面.
    this.AddGroup('A', '求两个日期之差'); //增加分组.
    this.Blank('0', '不启用', this.Desc2);
    this.AddEntity('1', '选择日期', new GPEReqDays(), this.Desc1);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }
  public readonly Desc1 = `
  #### 帮助
  - 应用场景：在请假单中，根据请假日期从，请假日期到的差值，自动计算请假天数。
  #### 配置图例1
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/ReqDays/Img/ReqDaysBiaodan.png "屏幕截图.png") 
  - 配置图例2
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/ReqDays/Img/ReqDaysBiaodan2.png "屏幕截图.png") 
  #### 运行图例
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/ReqDays/Img/ReqDaysYanshi.png "屏幕截图.png") 
  `;
  public readonly Desc2 = `
  #### 帮助
   - 对两个日期求差，日期1-日期2= 天数.
   - 得出的值是一个整形的数值。
  #### 应用场景
   - 根据请假日期从，请假日期到自动计算请假天数.
  #### 效果图
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/ReqDays/Img/ReqDaysYanshi.png "屏幕截图.png") 
  
  `;
}
