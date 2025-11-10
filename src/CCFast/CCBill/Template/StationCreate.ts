import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
export class StationCreateAttr {
  public static readonly FrmID = 'FrmID';
  public static readonly FK_Station = 'FK_Station';
}

/// <summary>
/// 单据可创建的角色
/// </summary>
export class StationCreate extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.CCBill.StationCreate');
    if (!!mypk) {
      this.MyPK = mypk;
    }
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Frm_StationCreate', '单据可创建的角色');
    map.AddMyPK();
    map.AddTBString(StationCreateAttr.FrmID, null, '表单', true, false, 0, 50, 200);
    map.AddTBString(StationCreateAttr.FK_Station, null, '角色', true, false, 0, 50, 200);
    this._enMap = map;
    return this._enMap;
  }
}

// 单据可创建的角色 s
export class StationCreates extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new StationCreate();
  }
  constructor() {
    super();
  }
}
