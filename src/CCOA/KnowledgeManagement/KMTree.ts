import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesTree, EntityTree, EntityTreeAttr } from '/@/bp/en/EntityTree';

/// 知识树 属性
export class KMTreeAttr extends EntityTreeAttr {
  /// <summary>
  /// 组织编号
  /// </summary>
  public static readonly OrgNo = 'OrgNo';
  /// <summary>
  /// <summary>
  /// 文件类型
  /// </summary>
  public static readonly FileType = 'FileType';
  /// <summary>
  /// 记录人
  /// </summary>
  public static readonly Rec = 'Rec';
  /// <summary>
  /// 记录人名称
  /// </summary>
  public static readonly RecName = 'RecName';
  /// <summary>
  /// 记录日期
  /// </summary>
  public static readonly RDT = 'RDT';
  /// <summary>
  /// 知识编号
  /// </summary>
  public static readonly KnowledgeNo = 'KnowledgeNo';
  /// <summary>
  /// 是否删除.
  /// </summary>
  public static readonly IsDel = 'IsDel';
}

/// 知识树
export class KMTree extends EntityTree {
  constructor(pkVal?: string) {
    super('TS.CCOA.KnowledgeManagement.KMTree');
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
    const map = new Map('OA_KMTree', '知识树');

    map.AddTBStringPK(KMTreeAttr.No, null, '编号', false, false, 0, 50, 10);
    map.AddTBString(KMTreeAttr.Name, null, '名称', false, false, 0, 500, 10);
    map.AddTBString(KMTreeAttr.ParentNo, null, '父节点编号', false, false, 0, 50, 10);

    map.AddTBString(KMTreeAttr.KnowledgeNo, null, '知识编号', false, false, 0, 50, 10);
    map.AddTBInt(KMTreeAttr.FileType, 1, '文件类型', false, false);
    map.AddTBInt(KMTreeAttr.Idx, 0, 'Idx', false, false);

    map.AddTBString(KMTreeAttr.OrgNo, null, '组织编号', false, false, 0, 100, 10);
    map.AddTBString(KMTreeAttr.Rec, null, '记录人', false, false, 0, 100, 10);
    map.AddTBString(KMTreeAttr.RecName, null, '记录人名称', false, false, 0, 100, 10, true);
    map.AddTBDateTime(KMTreeAttr.RDT, null, '记录时间', false, false);
    map.AddTBInt(KMTreeAttr.IsDel, 0, 'IsDel', false, false);

    //  map.AddMyFileS("附件");
    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 知识树 s
 */
export class KMTrees extends EntitiesTree {
  get GetNewEntity(): EntityTree {
    return new KMTree();
  }
  constructor() {
    super();
  }
}
