import { MapExt, MapExtAttr } from '/@/WF/Admin/FrmLogic/MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { GPEDateFieldInputRole } from './GPEDateFieldInputRole';
import { MapAttr } from '../../MapAttrs/MapAttr';

export class GPE_DateFieldInputRole extends PageBaseGroupEdit {
  constructor() {
    super('GPE_DateFieldInputRole');
    this.PageTitle = '输入值限制'; // DateFieldInputRole
  }
  async Init() {
    this.KeyOfEn = MapExtAttr.DoWay; //要编辑的字段.

    const mypk = this.GetRequestVal('PKVal');
    const mapAttr = new MapAttr(mypk);
    await mapAttr.Retrieve();
    const mapExt = new MapExt();
    const pix = 'DateFieldInputRole';
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
    this.AddGroup('A', '日期输入值限制'); //增加分组.
    this.Blank('0', '不限制', this.Desc0);
    this.Blank('1', '不能输入历史日期,只能输入当前日期以及未来日期.', this.Desc1);
    this.AddEntity('2', '只能输入指定运算符(如大于等于)指定字段的日期', new GPEDateFieldInputRole(), this.Desc2);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly Desc0 = ` 
  #### 帮助
   - 不限制，对于日期型数据，不做任何限制。
   - 不能输入历史日期：不是输入之前的日期，只能输入当前日期以及未来日期。
   - 只能输入指定运算符(如大于等于)指定字段的日期，比如请假结束日期，就不能小于请假开始日期。
  #### 应用场景
   - 多数用于对日期有要求的字段，比如请假单，销假单，疫情信息上报日期等。
  #### 效果图
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/DateFieldInputRole/Img/DateFiledInptRole.png "日期限制.png") 
  `;
  public readonly Desc1 = `
  #### 帮助 
  1. 历史日期禁止输入。
  2. 比如请假日期从,对于当前人员来说,不能输入历史日期。
....`;
  public readonly Desc2 = ` 
  #### 帮助
  1. 比如: 请假日期到，不能大于请假日期从。
  2. 用于限制一个时间点要大于指定字段的时间点。
  #### 配置图
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/DateFieldInputRole/Img/DateFiledInptRoleSetting.png "日期限制.png") 
  #### 效果图
  - ![输入图片说明](./resource/WF/Admin/FrmLogic/MapExt/DateFieldInputRole/Img/DateFiledInptRole.png "日期限制.png") 
`;
}
