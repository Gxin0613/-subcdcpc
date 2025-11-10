import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { Entity } from '/@/bp/en/Entity';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import WebUser from '/@/bp/web/WebUser';
import { DataType } from '/@/bp/en/DataType';
import DBAccess from '/@/utils/gener/DBAccess';

/// 工作内容 属性
export class WorkRecDtlAttr {
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

  public static readonly Doc1 = 'Doc1';
  public static readonly Doc2 = 'Doc2';
  public static readonly Doc3 = 'Doc3';
  public static readonly WorkRecDtlModel = 'WorkRecDtlModel';

  public static readonly HeiJiHour = 'HeiJiHour';
  public static readonly NumOfItem = 'NumOfItem';

  public static readonly RiQi = 'RiQi';
  public static readonly NianYue = 'NianYue';
  public static readonly NianDu = 'NianDu';
  public static readonly PrjName = 'PrjName';
  public static readonly Result = 'Result';
  public static readonly Hour = 'Hour';
  public static readonly Minute = 'Minute';
  public static readonly WeekNum = 'WeekNum';
}

/// 工作内容
export class WorkRecDtl extends EntityMyPK {
  constructor(pkVal?: string) {
    super('TS.CCOA.WorkRecDtl');
    if (!!pkVal) {
      this.MyPK = pkVal;
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
    const map = new Map('OA_WorkRecDtl', '工作内容');

    map.AddMyPK();

    map.AddTBString(WorkRecDtlAttr.RefPK, null, 'RefPK', false, false, 0, 40, 10);

    map.AddTBString(WorkRecDtlAttr.PrjName, null, '项目名称', true, false, 0, 500, 100, true);
    map.AddTBStringDoc(WorkRecDtlAttr.Doc, null, '内容', true, false, true);
    map.AddTBStringDoc(WorkRecDtlAttr.Result, null, '结果', true, false, true);

    map.AddTBInt(WorkRecDtlAttr.Hour, 0, '小时', true, false);
    map.AddTBInt(WorkRecDtlAttr.Minute, 0, '分钟', true, false);
    map.AddTBFloat(WorkRecDtlAttr.HeiJiHour, 0, '合计小时', false, false);

    map.AddTBString('OrgNo', null, '组织编号', false, false, 0, 100, 10);
    map.AddTBString('RecNo', null, '记录人', false, false, 0, 100, 10, true);
    map.AddTBString('RecName', null, '记录人名称', false, false, 0, 100, 10, true);
    map.AddTBDateTime('RDT', null, '记录时间', false, false);
    map.AddTBDate('RiQi', null, '隶属日期', false, false);
    map.AddTBString('NianYue', null, '年月', false, false, 0, 10, 10);
    map.AddTBString('NianDu', null, '年度', false, false, 0, 10, 10);
    map.AddTBInt(WorkRecDtlAttr.WeekNum, 0, '周次', false, false);

    //  map.AddMyFileS("附件");
    this._enMap = map;
    return this._enMap;
  }

  protected override beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();

    this.RecNo = WebUser.No;
    this.RecName = WebUser.Name;
    this.RDT = DataType.CurrentDateTime;
    //  this.RDT=DataType.CurrentDateTime;
    return Promise.resolve(true);
  }
}

/**
 * 工作内容 s
 */
export class WorkRecDtls extends EntitiesMyPK {
  get GetNewEntity(): Entity {
    return new WorkRecDtl();
  }
  constructor() {
    super();
  }
}
