import { EntityNoNameAttr } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

/// 菜单 属性
export class MenuEmpAttr extends EntityNoNameAttr {
  /// <summary>
  /// 操作员
  /// </summary>
  public static readonly FK_Emp = 'FK_Emp';
  /// <summary>
  /// 菜单功能
  /// </summary>
  public static readonly FK_Menu = 'FK_Menu';
  /// <summary>
  /// 是否选中.
  /// </summary>
  public static readonly IsChecked = 'IsChecked';
  /// <summary>
  /// 系统
  /// </summary>
  public static readonly FK_App = 'FK_App';
  public static readonly Idx = 'Idx';
}

/// 菜单
export class MenuEmp extends EntityMyPK {
  constructor(pkVal?: string) {
    super('TS.GPM.MenuEmp', 'BP.CCFast.CCMenu.MenuEmp');
    if (!!pkVal) {
      this.MyPK = pkVal;
    }
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('GPM_MenuEmp', '菜单');

    map.AddMyPK();
    map.AddTBString(MenuEmpAttr.FK_Menu, null, '菜单', false, false, 0, 50, 20);
    map.AddTBString(MenuEmpAttr.FK_Emp, null, '人员', false, false, 0, 50, 20);
    map.AddTBString(MenuEmpAttr.FK_App, null, '系统', false, false, 0, 50, 20);
    map.AddBoolean(MenuEmpAttr.IsChecked, true, '是否选中', true, true);

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 菜单s
 */
export class MenuEmps extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new MenuEmp();
  }
  constructor() {
    super();
  }
}
