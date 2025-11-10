import { GPEDtlDateFiledMaxMin } from './GPEDtlDateFiledMaxMin';
import { MapExt, MapExtAttr } from '/@/WF/Admin/FrmLogic/MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_DtlDateFiledMaxMin extends PageBaseGroupEdit {
  constructor() {
    super('GPE_DtlDateFiledMaxMin');
    this.PageTitle = '求从表日期';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //要编辑的字段.

    //特殊处理,初始化数据.
    await this.entity.InitDataForMapAttr('DateFiledMaxMin', this.GetRequestVal('PKVal'));

    //增加子页面.
    this.AddGroup('A', '求从表日期'); //增加分组.
    this.Blank('0', '禁用', this.Desc0);
    this.AddEntity('1', '启用设置', new GPEDtlDateFiledMaxMin(), this.Desc0);
  }
  public BtnClick(_pageID: string, _pageVal: any, _btnName: string) {}
  public async AfterSave(_pageID: string, _pageVal: any) {}

  public readonly Desc0 = `
  #### 帮助
   - 对从表的列的日期字段，进行求最大、求最小显示到主表数据上.
   - ![输入图片说明](./resource/WF/Admin/FrmLogic/GPE_DtlDateFiledMaxMin.png "求最大最小") 
  .`;
}
