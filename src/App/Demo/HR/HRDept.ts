import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesTree, EntityTree } from '/@/bp/en/EntityTree';

/// <summary>
/// 部门
/// </summary>
export class HRDept extends EntityTree {
  constructor(no?: string) {
    super('TS.Demo.HRDept');
    if (!!no) {
      this.setPKVal(no);
    }
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.OpenForAdmin();
    return uac;
  }

  public override get EnMap() {
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('Demo_HRDept', '部门');

    map.AddTBStringPK('No', null, '编号', true, true, 3, 3, 75);
    map.AddTBString('Name', null, '名称', true, false, 0, 50, 150);
    map.AddTBString('ParentNo', null, '父节点编号', false, false, 0, 50, 100);
    map.AddTBString('Leader', null, '部门领导账号', true, false, 0, 50, 150);

    this._enMap = map;
    return this._enMap;
  }
}

//部门s
export class HRDepts extends EntitiesTree {
  get GetNewEntity(): HRDept {
    return new HRDept();
  }

  constructor() {
    super();
  }
}
