import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { SFDBSrc } from '../../SFDBSrc/SFDBSrc';
/// <summary>
/// 填充从表
/// </summary>
export class FullAthSelf extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.MapExt.FullAthSelf');
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

    map.AddTBString(MapExtAttr.Tag1, null, '附件NoOfObj', true, true, 0, 150, 150, false);
    map.AddTBString(MapExtAttr.Tag2, null, '附件名称', true, true, 0, 150, 150, false);
    map.AddDDLEntities(MapExtAttr.FK_DBSrc, 'local', '数据源', new SFDBSrc(), true, null, false);
    map.AddTBStringDoc(MapExtAttr.Doc, null, '表达式', true, false, true, this.help);
    this._enMap = map;
    return this._enMap;
  }
  public readonly help = `
  #### 帮助
  - 输入一个数据源SQL或者url，返回一个数据集合，列包含两个FileName,FileUrl,附件名称，附件存储路径，就可以自动填充.
  `;
  override async beforeInsert(): Promise<boolean> {
    // this.ExtModel = 'RegularExpression';
    // this.MyPK = DBAccess.GenerGUID();
    return true;
  }
}

/**
 * 填充从表s
 */
export class FullAthSelfs extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FullAthSelf();
  }
  constructor() {
    super();
  }
}
