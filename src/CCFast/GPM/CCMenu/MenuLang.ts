import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';

/// 菜单
export class MenuLang extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.GPM.MenuLang');
    if (!!pkVal) {
      this.setPKVal(pkVal);
    }
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
    const map = new Map('GPM_Menu', '菜单');

    map.AddTBStringPK('No', null, '编号', false, false, 1, 90, 50);
    map.AddTBString('Name', null, '名称', true, false, 0, 300, 150, true);
    map.AddLang();

    map.AddTBString('ModuleNo', null, '隶属模块编号', false, false, 0, 300, 200, true);
    map.AddTBString('SystemNo', null, '隶属系统编号', false, false, 0, 300, 200, true);
    //隐藏字段.
    map.AddTBInt('Idx', 0, '序号', false, false);

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 菜单s
 */
export class MenuLangs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new MenuLang();
  }
  constructor() {
    super();
  }
}
