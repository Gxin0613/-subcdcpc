import { MapExt, MapExtAttr } from '/@/WF/Admin/FrmLogic/MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_DtlNumFiledSumAvg extends PageBaseGroupEdit {
  constructor() {
    super('GPE_DtlNumFiledSumAvg');
    this.PageTitle = '求合,平均显示';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //要编辑的字段.

    //特殊处理,初始化数据.
    await this.entity.InitDataForMapAttr('NumFiledSumAvg', this.GetRequestVal('PKVal'));

    //增加子页面.
    this.AddGroup('A', '扫码录入'); //增加分组.
    this.Blank('0', '禁用', this.Desc0);
    this.Blank('1', '显示合计', this.Desc1);
    this.Blank('2', '显示平均数', this.Desc1);
    this.Blank('3', '显示最大', this.Desc1);
    this.Blank('4', '显示最小', this.Desc1);
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }
  }
  public async AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }

  public readonly Desc1 = `
  #### 帮助
   - 对从表的列，进行求和，求平均、求最大、求最小计算显示。
   - 求出来的数据呈现在从表的底部。
   - 对当前字段是从表有效。
   - 配置图例1
   - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/DtlNumFiledSumAvg/Img/AutoFullDtl1.png "屏幕截图.png") 

   - 配置图例2
   - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/DtlNumFiledSumAvg/Img/AutoFullDtl.png "屏幕截图.png") 
 
   - 配置图例3
   - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/DtlNumFiledSumAvg/Img/AutoFullDtl2.png "屏幕截图.png") 
  
   - 运行图例
   - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/DtlNumFiledSumAvg/Img/AutoFullDtlXianshi.png "屏幕截图.png") 
   
  .`;
  public readonly Desc0 = `
  #### 帮助
  - 禁用：不对从表列进行计算。
  - 对当前字段是从表有效。
  - 对从表的列，进行求和，求平均、求最大、求最小计算显示。
  - 求出来的数据呈现在从表的底部。
  #### 效果图
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/DtlNumFiledSumAvg/Img/AutoFullDtlXianshi.png "屏幕截图.png") 


  `;
}
