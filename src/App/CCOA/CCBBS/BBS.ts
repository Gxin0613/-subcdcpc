import { EntityNoNameAttr, EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { BBSType } from './BBSType';
import WebUser from '/@/bp/web/WebUser';

/// 类型 属性
export class BBSAttr extends EntityNoNameAttr {
  /// <summary>
  /// 信息内容
  /// </summary>
  public static readonly Docs = 'Docs';
  /// <summary>
  /// 组织编号
  /// </summary>
  public static readonly OrgNo = 'OrgNo';
  /// <summary>
  /// 记录人
  /// </summary>
  public static readonly Rec = 'Rec';
  /// <summary>
  /// 记录人名称
  /// </summary>
  public static readonly RecName = 'RecName';

  public static readonly RecDeptNo = 'RecDeptNo';
  public static readonly RecDeptName = 'RecDeptName';
  /// <summary>
  /// 记录日期
  /// </summary>
  public static readonly RDT = 'RDT';
  /// <summary>
  /// 年月
  /// </summary>
  public static readonly NianYue = 'NianYue';
  /// <summary>
  /// 读取人数
  /// </summary>
  public static readonly ReadTimes = 'ReadTimes';
  /// <summary>
  /// 读取人
  /// </summary>
  public static readonly Reader = 'Reader';
  /// <summary>
  /// 状态
  /// </summary>
  public static readonly BBSSta = 'BBSSta';

  public static readonly RelerName = 'RelerName';
  public static readonly RelDeptName = 'RelDeptName';

  public static readonly BBSType = 'BBSType';
  public static readonly BBSPRI = 'BBSPRI';
}

/// 类型
export class BBS extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCOA.CCBBS.BBS');
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
    const map = new Map('OA_BBS', '类型');

    map.AddTBStringPK(BBSAttr.No, null, '编号', false, true, 1, 59, 59);
    map.AddTBString(BBSAttr.Name, null, '标题', true, false, 0, 100, 10, true);

    map.AddTBStringDoc(BBSAttr.Docs, null, '内容', true, false, true);

    map.AddDDLSysEnum(BBSAttr.BBSPRI, 0, '重要性', true, true, 'BBSPRI', '@0=普通@1=紧急@2=火急');

    map.AddDDLSysEnum(BBSAttr.BBSSta, 0, '状态', true, true, 'BBSSta', '@0=发布中@1=禁用');
    map.AddDDLEntities(BBSAttr.BBSType, null, '类型', new BBSType(), true);

    map.AddTBString(BBSAttr.Rec, null, '记录人', false, false, 0, 100, 10);
    map.AddTBString(BBSAttr.RecName, null, '记录人', true, true, 0, 100, 10, false);
    map.AddTBString(BBSAttr.RecDeptNo, null, '记录人部门', false, false, 0, 100, 10, false);

    map.AddTBString(BBSAttr.RelerName, null, '发布人', true, false, 0, 100, 10, false);
    map.AddTBString(BBSAttr.RelDeptName, null, '发布单位', true, false, 0, 100, 10, false);

    map.AddTBDateTime(BBSAttr.RDT, null, '发布日期', true, true);
    map.AddTBString(BBSAttr.NianYue, null, '隶属年月', false, false, 0, 10, 10);

    map.AddTBInt(BBSAttr.ReadTimes, 0, '读取次数', true, true);
    map.AddTBStringDoc(BBSAttr.Reader, null, '读取人', false, false, false);

    if (WebUser.CCBPMRunModel != 0) map.AddTBString(BBSAttr.OrgNo, null, '组织', true, true, 0, 100, 10);

    //增加附件.
    // map.AddMyFileS();
    //   //  #region 设置查询条件.
    //     map.DTSearchKey = BBSAttr.RDT;
    //     map.DTSearchWay = DTSearchWay.ByDateRange;
    //     map.DTSearchLabel = "发布日期";
    //     if (TS.Difference.WebUser.CCBPMRunModel != CCBPMRunModel.Single)
    //         map.AddHidden("OrgNo", "=", WebUser.OrgNo);

    map.AddSearchAttr(BBSAttr.BBSSta);
    //    map.AddSearchAttr(BBSAttr.BBS);
    // #endregion 设置查询条件.

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 类型s
 */
export class BBSs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new BBS();
  }
  constructor() {
    super();
  }
}
