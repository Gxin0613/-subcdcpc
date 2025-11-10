import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

/// <summary>
/// 组织表单对应
/// </summary>
export class FlowOrg extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.WF.FlowOrg');
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
    const map = new Map('WF_FlowOrg', '组织流程对应');
    map.AddMyPK(false);

    map.AddTBString('OrgNo', null, '组织', true, true, 0, 50, 150);
    map.AddTBString('FlowNo', null, 'FlowNo', true, true, 0, 50, 100);
    this._enMap = map;
    return this._enMap;
  }
}

//组织表单对应
export class FlowOrgs extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FlowOrg();
  }
  constructor() {
    super();
  }
}
