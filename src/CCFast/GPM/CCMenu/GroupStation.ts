import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

/// 权限组角色 属性
export class GroupStationAttr {
  /// <summary>
  /// 权限组
  /// </summary>
  public static readonly FK_Group = 'FK_Group';
  /// <summary>
  /// 角色
  /// </summary>
  public static readonly FK_Station = 'FK_Station';
}

/// 权限组角色
export class GroupStation extends EntityMyPK {
  constructor(pkVal?: string) {
    super('TS.GPM.GroupStation', 'BP.CCFast.CCMenu.GroupStation');
    if (!!pkVal) {
      this.MyPK = pkVal;
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
    const map = new Map('GPM_GroupStation', '权限组角色');

    map.AddMyPK();
    map.AddTBString(GroupStationAttr.FK_Group, null, '权限组', false, false, 0, 50, 20);
    map.AddTBString(GroupStationAttr.FK_Station, null, '角色', false, false, 0, 50, 20);

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 权限组角色s
 */
export class GroupStations extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new GroupStation();
  }
  constructor() {
    super();
  }
}
