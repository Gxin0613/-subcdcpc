import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { GloWF } from '../../../GloWF';
import { MapAttr } from '../../MapAttrs/MapAttr';
import { DataType } from '/@/bp/en/DataType';

// 两个日期之差
export class GPEReqDays extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.GPEReqDays');
    // this.RefEnName = 'TS.Sys.MapExt'; //关联更新的类.
    if (!!mypk) this.MyPK = mypk;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapExt', '两个日期之差');

    map.AddGroupAttr('基本设置');
    map.AddMyPK();
    map.AddTBString(MapExtAttr.FK_MapData, null, '表单ID', false, false, 0, 50, 200, true);
    map.AddTBString(MapExtAttr.AttrOfOper, null, '表单ID', false, false, 0, 50, 200, true);

    //. 这个变量没有解析. 当前实体的attr，都可能是表达式的参数.
    // let sql = `SELECT KeyOfEn as No, Name FROM Sys_MapAttr WHERE FK_MapData='@FK_MapData' AND (MyDataType=6 OR MyDataType=7) ORDER BY GroupID,Idx`;
    map.AddDDLSQL(MapExtAttr.Doc, null, '日期从', GloWF.SQLOfGPEReqDays, true, null, true);
    map.AddDDLSQL(MapExtAttr.Tag1, null, '到', GloWF.SQLOfGPEReqDays, true, null, true);

    map.AddDDLStringEnum('Tag', '', '节假日', '@0=不计算节假日@1=计算节假日', true);
    map.AddDDLStringEnum('Tag2', '', '计算方式', '@ReqDays=按整天计算@ReqTimes=按天小时计算', true);

    map.AddTBString('Tag3', '', '计算时间从', true, false, 0, 100, 100);
    map.SetHelperAlert('Tag3', '对按照小时计算有效.');
    map.AddTBString('Tag4', '', '计算时间到', true, false, 0, 100, 100);
    map.SetHelperAlert('Tag4', '对按照小时计算有效.');

    // map.AddRadioBtn(MapExtAttr.Tag, 0, '节假日', true, true, 'JieJiaRi', '@0=不计算节假日@1=计算节假日');

    //参数字段.  @SelectType=1@IsEnter=0
    // map.ParaFields = ',SelectType,IsEnter,Title,BtnLab,SearchTip,ShowModel,MultipleSelectType,';

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    this.FK_MapData = 'ND1Rpt';
    return true;
  }

  override async beforeUpdateInsertAction(): Promise<boolean> {
    if (!this.Tag2) this.Tag2 = 'ReqDays';
    if (!this.Tag3) this.Tag3 = '08:30';
    if (!this.Tag4) this.Tag4 = '17:30';

    const mypk = this.FK_MapData + '_' + this.AttrOfOper;
    const mapAttr = new MapAttr();
    mapAttr.MyPK = mypk;
    await mapAttr.RetrieveFromDBSources();

    if (this.Tag2 == 'ReqTimes' && mapAttr.MyDataType == DataType.AppInt) {
      alert('当前字段是整数类型，[计算方式] 需要选择按照整天计算.');
      return false;
    }
    if (this.Tag2 == 'ReqTimes') {
      //alert('当前字段是整数类型，[计算方式] 需要选择按照整天计算.');
      // return false;
    }

    return true;
  }
  public readonly DescTag1 = ` 
   #### 说明
   - 在表单中选择日期计算的终止值字段，比如：请假日期到 
    `;
  public readonly DescDoc = ` 
  #### 说明
  - 在表单中选择日期计算的起始值字段，比如：请假日期从 
   `;
}
