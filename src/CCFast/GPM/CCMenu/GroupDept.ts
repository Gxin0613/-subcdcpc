import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

/// 权限组部门 属性
export class GroupDeptAttr {
  /// <summary>
  /// 权限组
  /// </summary>
  public static readonly FK_Group = 'FK_Group';
  /// <summary>
  /// 部门
  /// </summary>
  public static readonly FK_Dept = 'FK_Dept';
}

/// 权限组部门
export class GroupDept extends EntityMyPK {
  constructor(pkVal?: string) {
    super('TS.GPM.GroupDept', 'TS.GPM.GroupDept');
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
    const map = new Map('GPM_GroupDept', '权限组部门');

    map.AddMyPK();
    map.AddTBString(GroupDeptAttr.FK_Group, null, '权限组', false, false, 0, 50, 20);
    map.AddTBString(GroupDeptAttr.FK_Dept, null, '部门', false, false, 0, 50, 20);

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 权限组部门s
 */
export class GroupDepts extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new GroupDept();
  }
  constructor() {
    super();
  }
}
