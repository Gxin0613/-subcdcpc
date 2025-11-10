import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

/// <summary>
/// 组织表单对应
/// </summary>
export class FrmOrg extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.WF.FrmOrg');
    if (!!mypk) {
      this.MyPK = mypk;
    }
  }

  /// <summary>
  /// 组织表单对应
  /// </summary>
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
    const map = new Map('WF_FrmOrg', '组织表单对应');
    map.AddMyPK(false);

    map.AddTBString('OrgNo', null, '组织', true, true, 0, 50, 150);
    map.AddTBString('FrmID', null, 'FrmID', true, true, 0, 50, 100);
    this._enMap = map;
    return this._enMap;
  }
}

//组织表单对应
export class FrmOrgs extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FrmOrg();
  }
  constructor() {
    super();
  }
}
