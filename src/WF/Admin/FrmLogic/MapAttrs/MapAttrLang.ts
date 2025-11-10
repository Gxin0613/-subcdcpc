import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

/// <summary>
/// 字段属性
/// </summary>
export class MapAttrLang extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.FrmUI.MapAttrLang');
    if (!!mypk) this.MyPK = mypk;
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsUpdate = true;
    return uac;
  }

  public override get EnMap() {
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('Sys_MapAttr', '字段');

    map.AddMyPK();
    map.AddTBString('Name', null, '中文', true, false, 0, 200, 150);
    map.AddLang();

    map.AddTBString('FK_MapData', null, '表单ID', false, false, 1, 100, 20);

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 字段属性s
 */
export class MapAttrLangs extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new MapAttrLang();
  }
  constructor() {
    super();
  }
}
