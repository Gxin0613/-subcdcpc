/// <summary>
/// 节点人员 属性
/// </summary>

import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

//节点人员属性.
export class NodeDeptAttr {
  public static readonly FK_Node = 'FK_Node';
  public static readonly FK_Dept = 'FK_Dept';
}

//节点人员
export class NodeDept extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.WF.Template.NodeDept');
    if (!!mypk) {
      this.MyPK = mypk;
    }
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_NodeDept', '节点人员');
    map.AddMyPK();
    map.AddTBInt('FK_Node', 0, '节点ID', true, false, false);
    map.AddTBString(NodeDeptAttr.FK_Dept, null, '部门编号', true, false, 0, 50, 200);
    this._enMap = map;
    return this._enMap;
  }
}

//节点人员s
export class NodeDepts extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new NodeDept();
  }
  constructor() {
    super();
  }
}
