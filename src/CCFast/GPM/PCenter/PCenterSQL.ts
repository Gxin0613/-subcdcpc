import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { PowerCenterAttr } from '../../GPM/CCMenu/PowerCenter';

/// 权限
export class PCenterSQL extends EntityMyPK {
  constructor(pkVal?: string) {
    super('TS.GPM.PCenterSQL');
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

    map.AddTBStringDoc(PowerCenterAttr.IDs, null, 'SQL', true, false, true);

    this._enMap = map;
    return this._enMap;
  }
}
