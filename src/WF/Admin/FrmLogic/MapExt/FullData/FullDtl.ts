import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { SFDBSrc } from '../../SFDBSrc/SFDBSrc';
/// <summary>
/// 填充从表
/// </summary>
export class FullDtl extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.MapExt.FullDtl');
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
    const map = new Map('Sys_MapExt', '填充从表');

    map.AddMyPK();
    map.AddTBString(MapExtAttr.FK_MapData, null, '表单ID', false, true, 0, 10, 50, true);
    map.AddTBString(MapExtAttr.RefPKVal, null, 'RefPKVal', false, true, 0, 10, 50, true);
    map.AddTBString(MapExtAttr.ExtType, null, '类型', false, true, 0, 10, 50, true);

    map.AddTBString(MapExtAttr.Tag1, null, '从表ID', true, true, 0, 150, 150, false);
    map.AddTBString(MapExtAttr.Tag2, null, '从表名称', true, true, 0, 150, 150, false);

    map.AddDDLSysEnum(MapExtAttr.DBType, 0, '数据源类型', true, true, 'DBType', '@0=执行SQL@1=执行url返回JSON@2=执行CCFromRef.js返回JSON', null, false);
    map.AddDDLEntities(MapExtAttr.FK_DBSrc, 'local', '数据源', new SFDBSrc(), true, null, false);

    map.AddTBStringDoc(MapExtAttr.Doc, null, '表达式', true, false, true, this.help);
    map.AddTBAtParas(4000);
    this._enMap = map;
    return this._enMap;
  }
  public readonly help = `
  #### 帮助
  - 输入一个数据源，返回一个数据集合，列名与从表的列名对应就可以自动填充.
  `;
  override async beforeInsert(): Promise<boolean> {
    // this.ExtModel = 'RegularExpression';
    // this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}

/**
 * 填充从表s
 */
export class FullDtls extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FullDtl();
  }
  constructor() {
    super();
  }
}
