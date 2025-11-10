/// <summary>
/// 节点人员 属性
/// </summary>

import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

//节点人员属性.
export class NodeEmpAttr {
  public static readonly FK_Node = 'FK_Node';
  public static readonly FK_Emp = 'FK_Emp';
}

//节点人员
export class NodeEmp extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.WF.Template.NodeEmp');
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
    const map = new Map('WF_NodeEmp', '节点人员');
    map.AddMyPK();

    map.AddTBInt('FK_Node', 0, '节点ID', true, false, false);
    map.AddTBString(NodeEmpAttr.FK_Emp, null, '操作员', true, false, 0, 50, 200);

    this._enMap = map;
    return this._enMap;
  }

  override async beforeUpdateInsertAction(): Promise<boolean> {
    this.MyPK = this.FK_Node + '_' + this.FK_Emp;
    return true;
  }
}

//节点人员s
export class NodeEmps extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new NodeEmp();
  }

  constructor() {
    super();
  }
}
