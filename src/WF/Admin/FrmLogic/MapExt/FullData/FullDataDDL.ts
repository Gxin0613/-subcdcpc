import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { SFDBSrc } from '../../SFDBSrc/SFDBSrc';
/// <summary>
/// 填充下拉框
/// </summary>
export class FullDataDDL extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.MapExt.FullDataDDL');
    if (!!pkval) this.MyPK = pkval;
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
    const map = new Map('Sys_MapExt', '填充下拉框');

    map.AddMyPK();
    map.AddTBString(MapExtAttr.RefPKVal, null, 'RefPKVal', false, false, 0, 10, 50, true);
    map.AddTBString(MapExtAttr.ExtType, null, 'ExtType', false, false, 0, 10, 50, true);
    map.AddTBString(MapExtAttr.FK_MapData, null, '表单ID', false, false, 0, 10, 50, true);

    map.AddTBString(MapExtAttr.Tag1, null, '下拉框ID', true, true, 0, 150, 150, false);
    map.AddTBString(MapExtAttr.Tag2, null, '名称', true, true, 0, 150, 150, false);

    map.AddDDLSysEnum(MapExtAttr.DBType, 0, '数据源类型', true, true, 'DBType', '@0=执行SQL@1=执行url返回JSON@2=执行CCFromRef.js返回JSON', null, false);
    map.AddDDLEntities(MapExtAttr.FK_DBSrc, 'local', '数据源', new SFDBSrc(), true, null, false);

    const help = `
    #### 帮助
    - 输入一个数据源，返回一个数据集合，具有: No,Name 两个列.
    `;

    map.AddTBString(MapExtAttr.Doc, null, '表达式', true, false, 0, 10, 300, true, help);

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    // this.ExtModel = 'RegularExpression';
    // this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}

/**
 * 填充下拉框s
 */
export class FullDataDDLs extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FullDataDDL();
  }
  constructor() {
    super();
  }
}
