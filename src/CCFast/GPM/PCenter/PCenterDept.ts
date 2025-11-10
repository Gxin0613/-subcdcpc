import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { PowerCenterAttr } from '../../GPM/CCMenu/PowerCenter';
import { GloWF } from '/@/WF/Admin/GloWF';

/// 权限
export class PCenterDept extends EntityMyPK {
  constructor(pkVal?: string) {
    super('TS.GPM.PCenterDept', 'BP.CCFast.CCMenu.PowerCenter');
    if (!!pkVal) {
      this.MyPK = pkVal;
    }
  }

  /// 权限
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
    const map = new Map('GPM_PowerCenter', '权限');

    map.AddMyPK();
    map.AddTBString(PowerCenterAttr.IDs, null, '部门编号', true, false, 0, 300, 200, true);
    // map.AddTBString(PowerCenterAttr.IDNames, null, '部门名称', true, true, 0, 300, 200, true);
    //设置pop
    map.SetPopTree(PowerCenterAttr.IDs, GloWF.srcDepts, GloWF.srcDeptRoot, true, '500px', '400px', '选择部门', 'icon-drop', '1');

    this._enMap = map;
    return this._enMap;
  }
}
