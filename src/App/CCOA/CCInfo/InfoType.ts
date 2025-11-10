import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';

/// 类型
export class InfoType extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCOA.CCInfo.InfoType');
    if (!!pkVal) this.setPKVal(pkVal);
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
    const map = new Map('OA_InfoType', '类型');
    map.AddTBStringPK('No', null, '编号', true, true, 3, 3, 100);
    map.AddTBString('Name', null, '名称', true, false, 0, 300, 300);
    map.AddTBInt('Idx', 0, '显示顺序', true, false);

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 类型s
 */
export class InfoTypes extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new InfoType();
  }
  constructor() {
    super();
  }
}
