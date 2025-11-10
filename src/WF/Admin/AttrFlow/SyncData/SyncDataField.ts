import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GloWF } from '../../GloWF';

/// <summary>
/// 数据同步
/// </summary>
export class SyncDataField extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.AttrFlow.SyncDataField');
    if (!!pkval) {
      this.MyPK = pkval;
    }
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_SyncDataField', '字段同步');
    map.AddMyPK();
    map.AddTBString('FlowNo', null, '流程编号', false, false, 0, 10, 50, true);
    map.AddTBString('RefPKVal', null, '关键内容', false, false, 0, 50, 50, true);
    map.AddTBString('FrmID', null, '表单ID', false, false, 0, 50, 50, true);

    map.AddTBString('AttrKey', null, '字段', true, true, 0, 100, 100, false);
    map.AddTBString('AttrName', null, '字段名', true, true, 0, 100, 100, false);
    map.AddTBInt('AttrType', 1, '类型', false, false);
    map.AddTBString('AttrTypeT', null, '类型', true, true, 0, 100, 50, false);

    //这里需要弹窗选择.
    map.AddTBString('ToFieldKey', null, '同步到字段', true, false, 0, 100, 50, false);

    const sql = GloWF.SQLOfToFieldKey(); //`SELECT KeyOfEn as No, Name FROM Sys_MapAttr WHERE FK_MapData='@FrmID' ORDER BY GroupID,Idx `;
    map.SetPopList('ToFieldKey', sql, false, '600px', '500px', '选字段', 'icon-people');

    const cfg = `@none=无@varch2int=varchar转int@varchar2float=varchar转float@varchar2Date=varchar转date@number2varchar=number转varchar@int2boolen=int转boolen`;
    map.AddDDLStringEnum('TurnFunc', 'None', '转换函数', cfg, true, '', false);
    // map.AddBoolean(SyncDataFieldAttr.IsSync, true, '同步?', true, true);
    // const val = '@DBSrc=按数据源同步@API=按API同步';
    // map.AddDDLStringEnum(SyncDataAttr.SyncType, 'DBSrc', '同步类型', val, true, null, false);
    // map.AddTBString(SyncDataAttr.Docs, null, '内容(API/数据源)', true, false, 0, 3000, 200, true);
    // map.AddTBStringDoc(SyncDataAttr.Note, null, '备注', true, false, true);
    // map.AddTBAtParas();

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

/**
 * 数据同步s
 */
export class SyncDataFields extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new SyncDataField();
  }
  constructor() {
    super();
  }
}
