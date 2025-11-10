import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { Entity } from '/@/bp/en/Entity';
import { Emp } from '/@/bp/port/Emp';

export class EmpCreateAttr {
  public static readonly FrmID = 'FrmID';
  public static readonly FK_Emp = 'FK_Emp';
}

/// <summary>
/// 单据可创建的人员
/// </summary>
export class EmpCreate extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.CCBill.EmpCreate');
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
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('Frm_EmpCreate', '单据可创建的人员');
    map.AddTBStringPK(EmpCreateAttr.FrmID, null, '表单', true, true, 1, 100, 100);
    map.AddDDLEntities(EmpCreateAttr.FK_Emp, null, '人员', new Emp(), true);
    //  map.AddDDLEntitiesPK(EmpCreateAttr.FK_Emp, null, "人员", new BP.Port.Emps(), true);
    //AddDDLEntitiesPK  改造zhoupeng

    this._enMap = map;
    return this._enMap;
  }
}

//单据可创建的人员s
export class EmpCreates extends EntitiesMyPK {
  get GetNewEntity(): Entity {
    return new EmpCreate();
  }
  constructor() {
    super();
  }
}
