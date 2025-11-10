import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { Entity } from '/@/bp/en/Entity';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { EntitiesMyPK } from '/@/bp/en/EntityMyPK';
import { EntityTreeAttr } from '/@/bp/en/EntityTree';

/// 日志审核 属性
export class WorkCheckerAttr extends EntityTreeAttr {
  /// <summary>
  /// 内容
  /// </summary>
  public static readonly Doc = 'Doc';
  /// <summary>
  /// 分数
  /// </summary>
  public static readonly Cent = 'Cent';
  /// <summary>
  /// 提醒时间
  /// </summary>
  public static readonly RefPK = 'RefPK';
  /// <summary>
  /// 组织编号
  /// </summary>
  public static readonly OrgNo = 'OrgNo';
  /// <summary>
  /// 记录人
  /// </summary>
  public static readonly Rec = 'Rec';
  /// <summary>
  /// 记录人名字
  /// </summary>
  public static readonly RecName = 'RecName';
  /// <summary>
  /// 记录日期
  /// </summary>
  public static readonly RDT = 'RDT';
}

/// 日志审核
export class WorkChecker extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCOA.WorkLog.WorkChecker');
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
    const map = new Map('OA_WorkChecker', '日志审核');

    map.AddMyPK();

    map.AddTBString(WorkCheckerAttr.RefPK, null, 'RefPK', false, false, 0, 100, 10);
    map.AddTBString(WorkCheckerAttr.Doc, null, 'Doc', false, false, 0, 999, 10);

    map.AddTBInt(WorkCheckerAttr.Cent, 0, '评分', false, false);

    map.AddTBString(WorkCheckerAttr.OrgNo, null, 'OrgNo', false, false, 0, 100, 10);
    map.AddTBString(WorkCheckerAttr.Rec, null, '记录人', false, false, 0, 100, 10, true);
    map.AddTBString(WorkCheckerAttr.RecName, null, '记录人', false, false, 0, 100, 10, true);

    map.AddTBDateTime(WorkCheckerAttr.RDT, null, '记录时间', false, false);

    //  map.AddMyFileS("附件");
    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 日志审核 s
 */
export class WorkCheckers extends EntitiesMyPK {
  get GetNewEntity(): Entity {
    return new WorkChecker();
  }
  constructor() {
    super();
  }
}
