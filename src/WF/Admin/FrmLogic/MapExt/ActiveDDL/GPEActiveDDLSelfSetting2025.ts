import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { GloWF } from '../../../GloWF';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';

// 级联下拉框
export class GPEActiveDDLSelfSetting2025 extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.GPEActiveDDLSelfSetting2025');
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
    const map = new Map('Sys_MapExt', '级联下拉框');
    map.GroupBarShowModel = 1;
    map.AddGroupAttr('基本设置');
    map.AddMyPK();

    map.AddTBString(MapExtAttr.FK_MapData, null, '表单ID', true, true, 0, 50, 200);
    map.AddTBString(MapExtAttr.ExtModel, null, 'ActiveDDL', false, false, 0, 50, 200);
    map.AddTBString(MapExtAttr.ExtType, null, 'ActiveDDL', false, false, 0, 50, 200);
    map.AddTBString(MapExtAttr.AttrOfOper, null, '当前字段', true, true, 0, 50, 200);
    map.AddDDLSQL(MapExtAttr.AttrsOfActive, null, '联动的下拉框', GloWF.SQLOfActiveDDL, true);
    map.AddBoolean('IsSelectVal', false, '级联是否默认选择值', true, true, false);
    map.ParaFields = ',IsSelectVal,';
    map.AddTBAtParas();

    const url = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=ActiveDDL&DBModel=SFTable');
    map.AddLink('Doc', '设置-数据源', url, false, GPNReturnType.OpenUrlByDrawer50, this.DescDoc, 'icon-settings');

    this._enMap = map;
    return this._enMap;
  }
  protected override beforeUpdateInsertAction(): Promise<boolean> {
    //this.DoWay = 1;
    return Promise.resolve(true);
  }
  public readonly DescDoc = ` 
  #### 说明
  - 设置数据源返回No,Name两个列, 用于填充下拉框.
   `;
}
