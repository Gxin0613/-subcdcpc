import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
/// 系统
export class MySystemLang extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.GPM.MySystemLang');
    if (!!pkVal) {
      this.No = pkVal;
    }
  }
  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsUpdate = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('GPM_System', '系统');

    map.AddTBStringPK('No', null, '编号', true, true, 2, 100, 100);
    map.AddTBString('Name', null, '中文名', true, false, 0, 300, 150);
    map.AddLang();

    this._enMap = map;
    return this._enMap;
  }
}

export class MySystemLangs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new MySystemLang();
  }
  constructor() {
    super();
  }
}
