import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { PowerCenterAttr } from '../../GPM/CCMenu/PowerCenter';
import { GloWF } from '/@/WF/Admin/GloWF';

/// 权限
export class PCenterStation extends EntityMyPK {
  constructor(pkVal?: string) {
    super('TS.GPM.PCenterStation');
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

    map.AddTBString(PowerCenterAttr.IDs, null, '角色编号', true, false, 0, 300, 200, true);
    //map.AddTBString(PowerCenterAttr.IDNames, null, '角色名称', true, true, 0, 300, 200, true);
    //设置pop
    map.SetPopGroupList(PowerCenterAttr.IDs, GloWF.srcStationTypes, GloWF.srcStations, true, PowerCenterAttr.IDNames);

    this._enMap = map;
    return this._enMap;
  }
}
