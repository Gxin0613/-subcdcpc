import { EntityNoNameAttr } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesOID, EntityOID } from '/@/bp/en/EntityOID';

/// 知识点 属性
export class KMDtlAttr extends EntityNoNameAttr {
  /// <summary>
  /// 模式
  /// </summary>
  public static readonly KMDtlPRI = 'KMDtlPRI';
  /// <summary>
  /// 内容1
  /// </summary>
  public static readonly Docs = 'Docs';

  public static readonly Title = 'Title';

  /// <summary>
  /// 内容2
  /// </summary>
  public static readonly KMDtlSta = 'KMDtlSta';
  /// <summary>
  /// 内容3
  /// </summary>
  public static readonly RefTreeNo = 'RefTreeNo';
  public static readonly KnowledgeNo = 'KnowledgeNo';
  /// <summary>
  /// 负责人
  /// </summary>
  public static readonly ManagerEmpName = 'ManagerEmpName';

  public static readonly RefLabelNo = 'RefLabelNo';
  public static readonly RefLabelName = 'RefLabelName';

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
  /// <summary>
  /// 记录关注者
  /// </summary>
  public static readonly RDT = 'RDT';
  /// <summary>
  /// 隶属关注者
  /// </summary>
  public static readonly RiQi = 'RiQi';
  /// <summary>
  /// 年月
  /// </summary>
  public static readonly Foucs = 'Foucs';
  /// <summary>
  /// 第几周
  /// </summary>
  public static readonly RefEmpsName = 'RefEmpsName';
  /// <summary>
  /// 年度
  /// </summary>
  public static readonly DTTo = 'DTTo';
  /// <summary>
  /// 是否删除.
  /// </summary>
  public static readonly IsDel = 'IsDel';
}

/// 知识点
export class KMDtl extends EntityOID {
  constructor(pkVal?: number) {
    super('TS.CCOA.KnowledgeManagement.KMDtl');
    if (!!pkVal) {
      this.OID = pkVal;
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
    const map = new Map('OA_KMDtl', '知识点');

    map.AddTBStringPK(KMDtlAttr.No, null, '编号', false, false, 0, 50, 10);

    map.AddTBString(KMDtlAttr.Name, null, '名称', true, false, 0, 500, 10, true);
    map.AddTBStringDoc(KMDtlAttr.Docs, null, '内容', true, true, true);

    map.AddTBString(KMDtlAttr.RefTreeNo, null, '关联树编号', false, false, 0, 50, 10);
    map.AddTBString(KMDtlAttr.KnowledgeNo, null, '知识编号', false, false, 0, 50, 10);
    map.AddTBString(KMDtlAttr.Foucs, null, '关注者(多个人用都好分开)', false, false, 0, 4000, 10);

    // map.AddTBString(KMDtlAttr.Docs, null, "内容", false, false, 0, 4000, 10);
    // map.AddDDLSysEnum(KMDtlAttr.KMDtlPRI, 0, "优先级", true, false, "KMDtlPRI", "@0=高@1=中@2=低");
    //   map.AddDDLSysEnum(KMDtlAttr.KMDtlSta, 0, "状态", true, false, "KMDtlSta", "@0=未完成@1=删除");
    // map.AddTBInt(KMDtlAttr.KMDtlSta, 0, "状态", false, false);

    //
    map.AddTBInt(KMDtlAttr.IsDel, 0, 'IsDel', false, false);

    map.AddTBString(KMDtlAttr.OrgNo, null, '组织编号', false, false, 0, 100, 10);
    map.AddTBString(KMDtlAttr.Rec, null, '记录人', false, false, 0, 100, 10);
    map.AddTBString(KMDtlAttr.RecName, null, '记录人名称', false, false, 0, 100, 10, true);
    map.AddTBDateTime(KMDtlAttr.RDT, null, '记录时间', false, false);
    map.AddTBInt('Idx', 0, 'Idx', false, false);

    //  map.AddMyFileS("附件");
    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 知识点 s
 */
export class KMDtls extends EntitiesOID {
  get GetNewEntity(): EntityOID {
    return new KMDtl();
  }
  constructor() {
    super();
  }
}
