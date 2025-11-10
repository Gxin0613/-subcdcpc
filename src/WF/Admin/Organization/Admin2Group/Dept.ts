import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesTree, EntityTree } from '/@/bp/en/EntityTree';

/// 部门
export class Dept extends EntityTree {
  constructor(pkval?: string) {
    super('TS.Admin.Dept');
    if (!!pkval) this.setPKVal(pkval);
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = false;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Port_Dept', '部门');

    map.AddTBStringPK('No', null, '编号', true, true, 3, 3, 50);
    map.AddTBString('Name', null, '名称', true, false, 0, 50, 200);
    map.AddTBString('ParentNo', null, '父节点编号', true, false, 0, 50, 200);
    map.AddTBString('OrgNo', null, '隶属组织', true, false, 0, 50, 200);
    map.AddTBInt('Idx', 0, '序号', true, false);

    this._enMap = map;
    return this._enMap;
  }
}

//部门s
export class Depts extends EntitiesTree {
  get GetNewEntity(): Dept {
    return new Dept();
  }

  constructor() {
    super();
  }
}
