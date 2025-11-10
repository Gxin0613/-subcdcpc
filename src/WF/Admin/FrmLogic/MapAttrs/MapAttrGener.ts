import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

/// <summary>
/// 字段属性
/// </summary>
export class MapAttrGener extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.FrmUI.MapAttrGener');
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
    map.AddTBString('KeyOfEn', null, '字段', true, false, 0, 200, 150);
    map.AddTBString('Name', null, '描述', true, false, 0, 200, 150);
    map.AddTBString('MyDataType', null, '中文', true, false, 0, 200, 150);
    map.AddTBString('UIBindKey', null, '关联', true, false, 0, 200, 150);

    map.AddTBString('FK_MapData', null, '表单ID', false, false, 1, 100, 20);

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 字段s
 */
export class MapAttrGeners extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new MapAttrGener();
  }
  constructor() {
    super();
  }
}
