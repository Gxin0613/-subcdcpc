import { EntityNoNameAttr, EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';

/// 类型 属性
export class BBSTypeAttr extends EntityNoNameAttr {
  /// 序号
  public static readonly Idx = 'Idx';
}

/// 类型
export class BBSType extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCOA.CCBBS.BBSType');
    if (!!pkVal) {
      this.No = pkVal;
    }
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('OA_BBSType', '类型');

    map.AddTBStringPK(BBSTypeAttr.No, null, '编号', true, true, 3, 3, 3);
    map.AddTBString(BBSTypeAttr.Name, null, '名称', true, false, 0, 300, 20);
    map.AddTBInt(BBSTypeAttr.Idx, 0, '显示顺序', true, false);

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 类型s
 */
export class BBSTypes extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new BBSType();
  }
  constructor() {
    super();
  }
}
