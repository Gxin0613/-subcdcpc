import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';

/// 权限组
export class Group extends EntityNoName {
  /// 组织编号
  get OrgNo() {
    return this.GetValStringByKey('OrgNo');
  }

  constructor(pkVal?: string) {
    super('TS.GPM.Group', 'BP.CCFast.CCMenu.Group');
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
    if (this._enMap != null) return this._enMap;
    const map = new Map('GPM_Group', '权限组');
    map.AddTBStringPK('No', null, '编号', true, true, 3, 3, 3);
    map.AddTBString('Name', null, '名称', true, false, 0, 300, 20);
    map.AddTBInt('Idx', 0, '显示顺序', true, false);

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 权限组s
 */
export class Groups extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Group();
  }
  constructor() {
    super();
  }
}
