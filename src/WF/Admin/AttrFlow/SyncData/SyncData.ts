import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';

export class SyncDataAttr {
  ///流程编号
  public static readonly FlowNo = 'FlowNo';
  //同步类型.
  public static readonly SyncType = 'SyncType';
  //数据库链接URL
  public static readonly DBSrc = 'DBSrc';
  public static readonly DBSrcT = 'DBSrcT';
  //API链接URL
  public static readonly APIUrl = 'APIUrl';
  //备注.
  public static readonly Note = 'Note';
  //表
  public static readonly PTable = 'PTable';
  //表名
  public static readonly PTableName = 'PTableName';
  //主键
  public static readonly TablePKName = 'TablePKName';
  //主键类型
  public static readonly TablePKType = 'TablePKType';
  //源表单ID
  public static readonly FrmID = 'FrmID';
  //名称
  public static readonly FrmName = 'FrmName';
  //查询表
  //public static readonly SQLTables = 'SQLTables';
  //查询字段.
  //public static readonly SQLFields = 'SQLFields';
}

/// <summary>
/// 数据同步
/// </summary>
export class SyncData extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.AttrFlow.SyncData');
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
    const map = new Map('WF_SyncData', '数据同步');

    map.AddMyPK();
    map.AddTBString(SyncDataAttr.FlowNo, null, '流程编号', false, false, 0, 10, 50, true);
    const val = '@DBSrc=按数据源同步@API=按API同步';
    map.AddDDLStringEnum(SyncDataAttr.SyncType, 'DBSrc', '同步类型', val, true, '', false);

    map.AddTBStringDoc(SyncDataAttr.Note, null, '备注/说明', true, false, true);

    map.AddTBString(SyncDataAttr.APIUrl, null, 'API链接URL', false, false, 0, 300, 50, true);
    map.AddTBString(SyncDataAttr.DBSrc, null, '数据库链接URL', false, false, 0, 100, 50, true);
    map.AddTBString(SyncDataAttr.DBSrcT, null, '数据源', false, false, 0, 200, 50, true);

    map.AddTBString(SyncDataAttr.PTable, null, '数据表', true, true, 0, 100, 50);
    map.AddTBString(SyncDataAttr.PTableName, null, '表名', true, true, 0, 100, 50);

    map.AddTBString(SyncDataAttr.TablePKName, null, '主键', true, true, 0, 100, 50);
    map.AddTBString(SyncDataAttr.TablePKType, null, '主键类型', true, true, 0, 100, 50);

    map.AddTBString(SyncDataAttr.FrmID, null, '源表单ID', true, true, 0, 100, 50);
    map.AddTBString(SyncDataAttr.FrmName, null, '名称', true, true, 0, 100, 50);

    // map.AddTBString(SyncDataAttr.SQLTables, null, '查询表的集合SQL', false, false, 0, 300, 50);
    // map.AddTBString(SyncDataAttr.SQLFields, null, '查询表字段的SQL', false, false, 0, 300, 50);

    map.AddTBAtParas();

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}

/**
 * 数据同步s
 */
export class SyncDatas extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new SyncData();
  }
  constructor() {
    super();
  }
}
