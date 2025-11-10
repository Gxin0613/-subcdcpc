import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesTree, EntityTree } from '/@/bp/en/EntityTree';
/// 网盘目录树
export class DirectoryTree extends EntityTree {
  constructor(pkVal?: string) {
    super('TS.CCOA.NetDisk.DirectoryTree');
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
    const map = new Map('OA_NetDiskDirectory', '网盘目录树');

    map.AddTBStringPK('No', null, '编号', false, false, 0, 50, 10);
    map.AddTBString('Name', null, '名称', true, false, 0, 500, 10);
    map.AddTBString('ParentNo', null, '父节点编号', false, false, 0, 50, 10);
    map.AddTBString('Icon', null, 'Icon', true, false, 0, 50, 10);
    map.AddTBInt('Idx', 0, 'Idx', false, false);

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
 * 网盘目录树 s
 */
export class DirectoryTrees extends EntitiesTree {
  get GetNewEntity(): EntityTree {
    return new DirectoryTree();
  }
  constructor() {
    super();
  }
}
