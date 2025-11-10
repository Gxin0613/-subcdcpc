import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { PowerCenterAttr } from '../../GPM/CCMenu/PowerCenter';
import { GloWF } from '/@/WF/Admin/GloWF';

/// 权限
export class PCenterEmp extends EntityMyPK {
  constructor(pkVal?: string) {
    super('TS.GPM.PCenterEmp');
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

    map.AddTBString(PowerCenterAttr.IDs, null, '人员编号', true, false, 0, 300, 200, true);
    map.AddTBString(PowerCenterAttr.IDNames, null, '人员名称', true, true, 0, 300, 200, true);

    //设置pop
    map.SetPopTreeEns(
      PowerCenterAttr.IDs,
      GloWF.srcDeptLazily,
      GloWF.srcDeptRoot,
      GloWF.srcEmpLazily,
      GloWF.srcEmpSearchKey,
      true,
      '800px',
      '400px',
      '人员',
      'icon-people',
      '0',
      true,
      true,
    );

    this._enMap = map;
    return this._enMap;
  }
}
