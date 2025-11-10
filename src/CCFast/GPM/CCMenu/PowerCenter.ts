import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

/// 权限中心 属性
export class PowerCenterAttr {
  /// <summary>
  /// 控制对象
  /// </summary>
  public static readonly CtrlObj = 'CtrlObj';
  /// <summary>
  /// 分组
  /// </summary>
  public static readonly CtrlGroup = 'CtrlGroup';
  /// <summary>
  /// 控制模式
  /// </summary>
  public static readonly CtrlModel = 'CtrlModel';
  public static readonly CtrlModelT = 'CtrlModelT';
  /// <summary>
  /// IDs
  /// </summary>
  public static readonly IDs = 'IDs';
  /// <summary>
  /// 名称
  /// </summary>
  public static readonly IDNames = 'IDNames';
  /// <summary>
  /// 控制对象Val
  /// </summary>
  public static readonly CtrlPKVal = 'CtrlPKVal';
  /// <summary>
  /// 编号
  /// </summary>
  public static readonly OrgNo = 'OrgNo';

  public static readonly Idx = 'Idx';
}

/// 权限中心
export class PowerCenter extends EntityMyPK {
  constructor(pkVal?: string) {
    super('TS.GPM.PowerCenter', 'BP.CCFast.CCMenu.PowerCenter');
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
    const map = new Map('GPM_PowerCenter', '权限中心');

    map.AddMyPK();

    // System,Module,Menus
    map.AddTBString(PowerCenterAttr.CtrlObj, null, '控制对象(SystemMenus)', true, false, 0, 300, 20);
    map.AddTBString(PowerCenterAttr.CtrlPKVal, null, '控制对象ID', true, false, 0, 300, 20);
    //Menus, Frm
    map.AddTBString(PowerCenterAttr.CtrlGroup, null, '隶属分组(可为空)', true, false, 0, 300, 20);

    //AnyOne,Adminer,Depts
    map.AddTBString(PowerCenterAttr.CtrlModel, null, '控制模式', true, false, 0, 300, 20);

    map.AddTBStringDoc(PowerCenterAttr.IDs, null, '主键s(Stas,Depts等)', true, true, true);
    map.AddTBStringDoc(PowerCenterAttr.IDNames, null, 'IDNames', true, true, true);

    map.AddTBString(PowerCenterAttr.OrgNo, null, '编号', true, false, 0, 100, 20);
    map.AddTBString(PowerCenterAttr.Idx, null, 'Idx', true, false, 0, 100, 20);

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 权限中心s
 */
export class PowerCenters extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new PowerCenter();
  }

  constructor() {
    super();
  }
}
