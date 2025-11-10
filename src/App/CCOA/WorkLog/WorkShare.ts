import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { Entity } from '/@/bp/en/Entity';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { EntitiesMyPK } from '/@/bp/en/EntityMyPK';

/// 日志共享
export class WorkShare extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCOA.WorkShare');
    if (!!pkVal) {
      this.No = pkVal;
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
    const map = new Map('OA_WorkShare', '日志共享');

    map.AddMyPK();

    map.AddTBString('EmpNo', null, '记录人', false, false, 0, 100, 10, true);
    map.AddTBString('EmpName', null, '记录人名称', false, false, 0, 100, 10, true);

    map.AddTBString('ShareToEmpNo', null, '记录人名称', false, false, 0, 100, 10, true);
    map.AddTBString('ShareToEmpName', null, '记录人名称', false, false, 0, 100, 10, true);

    map.AddTBInt('ShareState', 0, '状态0=关闭,1=分享', false, false);
    map.AddTBString('OrgNo', null, '组织编号', false, false, 0, 50, 10);
    //  map.AddMyFileS("附件");
    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 日志共享 s
 */
export class WorkShares extends EntitiesMyPK {
  get GetNewEntity(): Entity {
    return new WorkShare();
  }
  constructor() {
    super();
  }
}
