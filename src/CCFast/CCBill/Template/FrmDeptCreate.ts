import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { Entity } from '/@/bp/en/Entity';

import { Dept } from '/@/bp/port/Dept';

export class FrmDeptCreateAttr {
  public static readonly FrmID = 'FrmID';
  public static readonly FK_Dept = 'FK_Dept';
}

/// <summary>
/// 单据部门
/// </summary>
export class FrmDeptCreate extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.CCBill.FrmDeptCreate');
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
    const map = new Map('Frm_DeptCreate', '单据部门');

    map.AddTBStringPK(FrmDeptCreateAttr.FrmID, null, '表单', true, true, 1, 100, 100);
    map.AddDDLEntities(FrmDeptCreateAttr.FK_Dept, null, '可以创建部门', new Dept(), true);
    // map.AddDDLEntitiesPK(FrmDeptCreateAttr.FK_Dept, null, "可以创建部门", new BP.Port.Depts(), true);
    // AddDDLEntitiesPK
    this._enMap = map;
    return this._enMap;
  }
}

//单据部门s
export class FrmDeptCreates extends EntitiesMyPK {
  get GetNewEntity(): Entity {
    return new FrmDeptCreate();
  }
  constructor() {
    super();
  }
}
