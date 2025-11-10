import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

/// 权限组人员 属性
export class GroupEmpAttr {
  /// <summary>
  /// 权限组
  /// </summary>
  public static readonly FK_Group = 'FK_Group';
  /// <summary>
  /// 人员
  /// </summary>
  public static readonly FK_Emp = 'FK_Emp';
}

/// 权限组人员
export class GroupEmp extends EntityMyPK {
  constructor(pkVal?: string) {
    super('TS.GPM.GroupEmp', 'BP.CCFast.CCMenu.GroupEmp');
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
    const map = new Map('GPM_GroupEmp', '权限组人员');

    map.AddMyPK();
    map.AddTBString(GroupEmpAttr.FK_Group, null, '权限组', false, false, 0, 50, 20);
    map.AddTBString(GroupEmpAttr.FK_Emp, null, '人员', false, false, 0, 50, 20);

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 权限组人员s
 */
export class GroupEmps extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new GroupEmp();
  }
  constructor() {
    super();
  }
}
