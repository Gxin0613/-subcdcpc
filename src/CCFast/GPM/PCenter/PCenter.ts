import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { PowerCenterAttr } from '../../GPM/CCMenu/PowerCenter';

/// 权限中心
export class PCenter extends EntityMyPK {
  constructor(pkVal?: string) {
    super('TS.GPM.PCenter', 'BP.CCFast.CCMenu.PowerCenter');
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
    map.AddTBString(PowerCenterAttr.CtrlObj, null, '控制对象(SystemMenus)', false, false, 0, 300, 20);
    map.AddTBString(PowerCenterAttr.CtrlPKVal, null, '控制对象ID', false, false, 0, 300, 20);
    //Menus, Frm
    map.AddTBString(PowerCenterAttr.CtrlGroup, null, '隶属分组(可为空)', false, false, 0, 300, 20);

    //AnyOne,Adminer,Depts
    map.AddTBString(PowerCenterAttr.CtrlModel, null, '控制模式ID', false, false, 0, 300, 120);
    map.AddTBString(PowerCenterAttr.CtrlModelT, null, '控制模式', true, true, 0, 300, 120);

    map.AddTBString(PowerCenterAttr.IDs, null, '控制内容1', true, true, 0, 300, 100);
    map.AddTBString(PowerCenterAttr.IDs + 'T', null, '控制内容2', true, true, 0, 300, 100);
    // map.AddTBString(PowerCenterAttr.IDNames, null, '控制内容2', true, true, 0, 300, 150);
    // map.AddTBStringDoc(PowerCenterAttr.IDs, null, '控制内容1', true, true, true);
    // map.AddTBStringDoc(PowerCenterAttr.IDNames, null, '控制内容2', true, true, true);
    map.AddTBString(PowerCenterAttr.OrgNo, null, 'OrgNo', false, false, 0, 100, 20);
    map.AddTBString(PowerCenterAttr.Idx, null, 'Idx', false, false, 0, 100, 20);
    map.AddTBAtParas();

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 权限中心s
 */
export class PCenters extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new PCenter();
  }

  constructor() {
    super();
  }
}
