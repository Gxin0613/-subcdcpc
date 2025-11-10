import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
/// 模块
export class ModuleLang extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.GPM.ModuleLang');
    if (!!pkVal) this.No = pkVal;
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsUpdate = true;
    return uac;
  }

  public override get EnMap() {
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('GPM_Module', '模块');

    map.AddTBStringPK('No', null, '编号', true, true, 1, 200, 100);
    map.AddTBString('Name', null, '中文', true, false, 0, 300, 300);
    map.AddLang();
    map.AddTBString('SystemNo', null, '隶属系统', false, false, 0, 300, 20);
    map.AddTBInt('Idx', 0, '序号', false, false);

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 模块s
 */
export class ModuleLangs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new ModuleLang();
  }
  constructor() {
    super();
  }
}
