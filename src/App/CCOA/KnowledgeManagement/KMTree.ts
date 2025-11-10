import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesTree, EntityTree } from '/@/bp/en/EntityTree';
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

    map.AddTBStringPK('No', null, '编号', false, false, 0, 50, 10);
    map.AddTBString('Name', null, '名称', false, false, 0, 500, 10);
    map.AddTBString('ParentNo', null, '父节点编号', false, false, 0, 50, 10);
    map.AddTBInt('Idx', 0, 'Idx', false, false);
    map.AddTBString('KnowledgeNo', null, '知识编号', false, false, 0, 50, 10);

    // map.AddTBString('KnowledgeNo', null, '知识编号', false, false, 0, 50, 10);
    // map.AddTBInt('FileType', 1, '文件类型', false, false);
    // map.AddTBInt(KMTreeAttr.Idx, 0, 'Idx', false, false);
    // map.AddTBString(KMTreeAttr.OrgNo, null, '组织编号', false, false, 0, 100, 10);
    // map.AddTBString(KMTreeAttr.Rec, null, '记录人', false, false, 0, 100, 10);
    // map.AddTBString(KMTreeAttr.RecName, null, '记录人名称', false, false, 0, 100, 10, true);
    // map.AddTBDateTime(KMTreeAttr.RDT, null, '记录时间', false, false);
    // map.AddTBInt(KMTreeAttr.IsDel, 0, 'IsDel', false, false);

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
